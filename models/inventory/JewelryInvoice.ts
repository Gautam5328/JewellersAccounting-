import { Doc } from 'fyo/model/doc';
import { FormulaMap, ListViewSettings } from 'fyo/model/types';
import { ModelNameEnum } from 'models/types';
import { calculateJewelryLine, getNumber } from './jewelryCalculations';
import { JewelryInvoiceItem } from './JewelryInvoiceItem';

export class JewelryInvoice extends Doc {
  party?: string;
  date?: Date;
  invoiceType?: 'GST Invoice' | 'Non-GST Invoice';
  items?: JewelryInvoiceItem[];
  oldGoldWeight?: number;
  oldGoldExchangeAmount?: number;
  karigar?: string;
  karigarCharges?: number;
  repairOrderRef?: string;
  subtotal?: import('pesa').Money;
  gstAmount?: import('pesa').Money;
  discountAmount?: import('pesa').Money;
  grandTotal?: import('pesa').Money;
  profitAmount?: import('pesa').Money;
  hidden = {
    gstAmount: () => this.invoiceType === 'Non-GST Invoice',
  };

  formulas: FormulaMap = {
    subtotal: {
      formula: () => {
        const subtotal = (this.items ?? []).reduce(
          (sum, row) => sum + getNumber(row.lineAmount),
          0
        );
        return this.fyo.pesa(subtotal);
      },
      dependsOn: ['items', 'oldGoldExchangeAmount', 'karigarCharges'],
    },
    gstAmount: {
      formula: () => {
        const gstAmount = (this.items ?? []).reduce(
          (sum, row) => sum + getNumber(row.lineGstAmount),
          0
        );
        return this.fyo.pesa(gstAmount);
      },
      dependsOn: ['items'],
    },
    grandTotal: {
      formula: () => {
        const subtotal = getNumber(this.subtotal);
        const gstAmount = getNumber(this.gstAmount);
        const exchange = getNumber(this.oldGoldExchangeAmount);
        const karigarCharges = getNumber(this.karigarCharges);
        const discountAmount = getNumber(this.discountAmount);

        return this.fyo.pesa(
          subtotal + gstAmount + karigarCharges - exchange - discountAmount
        );
      },
      dependsOn: [
        'subtotal',
        'gstAmount',
        'oldGoldExchangeAmount',
        'karigarCharges',
        'discountAmount',
      ],
    },
    profitAmount: {
      formula: () => {
        const subtotal = getNumber(this.subtotal);
        const makingTotal = (this.items ?? []).reduce(
          (sum, row) => sum + getNumber(row.makingCharges),
          0
        );

        return this.fyo.pesa(subtotal - makingTotal);
      },
      dependsOn: ['items', 'subtotal'],
    },
  };

  override async beforeSync(): Promise<void> {
    await super.beforeSync();

    const rows = (this.items ?? []) as JewelryInvoiceItem[];
    const invoiceType = this.invoiceType ?? 'GST Invoice';
    for (const row of rows) {
      if (!row) {
        continue;
      }

      const gstPercent =
        invoiceType === 'Non-GST Invoice'
          ? 0
          : row.gstPercent === null || row.gstPercent === undefined
            ? 3
            : row.gstPercent;
      const makingGstPercent =
        invoiceType === 'Non-GST Invoice'
          ? 0
          : row.makingGstPercent === null || row.makingGstPercent === undefined
            ? 5
            : row.makingGstPercent;

      if (invoiceType === 'GST Invoice') {
        const hsn = (row as any).hsnCode;
        if (!hsn || String(hsn).trim() === '') {
          throw new Error('HSN Code is required for GST Invoice (default 7113).');
        }
      } else {
        // Explicitly prevent any tax values from sticking around.
        await row.set({
          gstPercent: 0,
          makingGstPercent: 0,
        });
      }

      const result = calculateJewelryLine({
        metalType: row.metalType,
        purity: row.purity,
        netWeight: row.netWeight,
        goldRate: getNumber(row.goldRate),
        metalAmount: getNumber((row as any).metalAmount),
        wastagePercentage: row.wastagePercentage,
        makingCharges: getNumber(row.makingCharges),
        gemAmount: getNumber((row as any).gemAmount),
        certificationAmount: getNumber((row as any).certificationAmount),
        carat: row.carat,
        ratePerCarat: getNumber(row.ratePerCarat),
        gstPercent,
        makingGstPercent,
      });

      await row.set({
        ...(row.gstPercent === null || row.gstPercent === undefined
          ? { gstPercent }
          : {}),
        ...(row.makingGstPercent === null || row.makingGstPercent === undefined
          ? { makingGstPercent }
          : {}),
        goldValue: this.fyo.pesa(result.goldValue),
        diamondValue: this.fyo.pesa(result.diamondValue),
        wastageAmount: this.fyo.pesa(result.wastageAmount),
        lineAmount: this.fyo.pesa(result.lineAmount),
        lineGstAmount: this.fyo.pesa(result.lineGstAmount),
        totalAmount: this.fyo.pesa(result.totalAmount),
      });
    }
  }

  override async afterSubmit(): Promise<void> {
    await super.afterSubmit();
    await this.createStockLedgerEntries('OUT', 'Sold via invoice');
  }

  override async afterCancel(): Promise<void> {
    await super.afterCancel();
    await this.createStockLedgerEntries('IN', 'Invoice cancelled (reversal)');
  }

  private async createStockLedgerEntries(
    entryType: 'IN' | 'OUT',
    remarks: string
  ) {
    if (!this.name) {
      return;
    }

    const date = this.date ?? new Date();
    const rows = this.items ?? [];

    for (const row of rows) {
      const jewelryItem = (row?.jewelryItem as string | undefined) ?? undefined;
      const referenceLine = (row as any)?.name as string | undefined;
      const exists = await this.fyo.db.getAll(ModelNameEnum.JewelryStockLedger, {
        fields: ['name'],
        filters: {
          referenceType: this.schemaName,
          referenceName: this.name,
          entryType,
          ...(jewelryItem ? { jewelryItem } : {}),
          ...(referenceLine ? { referenceLine } : {}),
        },
        limit: 1,
      });
      if (exists.length) {
        continue;
      }

      await this.fyo.doc
        .getNewDoc(ModelNameEnum.JewelryStockLedger, {
          date,
          ...(jewelryItem ? { jewelryItem } : {}),
          item: row.item,
          entryType,
          metalType: row.metalType,
          purity: row.purity,
          weight: getNumber(row.netWeight) || getNumber(row.grossWeight),
          carat: getNumber(row.carat),
          rate: (() => {
            if (row.metalType === 'Diamond') {
              return row.ratePerCarat;
            }

            const qty =
              getNumber(row.netWeight) || getNumber(row.grossWeight) || 0;
            const amount =
              getNumber((row as any).goldValue) + getNumber((row as any).diamondValue);
            if (qty > 0 && amount > 0) {
              return this.fyo.pesa(amount / qty);
            }

            return row.goldRate;
          })(),
          amount: this.fyo.pesa(
            getNumber((row as any).goldValue) + getNumber((row as any).diamondValue)
          ),
          referenceType: this.schemaName,
          referenceName: this.name,
          ...(referenceLine ? { referenceLine } : {}),
          remarks,
        })
        .sync();

      try {
        if (jewelryItem) {
          const piece = await this.fyo.doc.getDoc(
            ModelNameEnum.JewelryItem,
            jewelryItem
          );
          if (entryType === 'OUT') {
            await piece.set('status', 'Sold');
          } else if (entryType === 'IN') {
            await piece.set('status', 'In Stock');
          }
          await piece.sync();
        }
      } catch {
        // ignore if the piece doc can't be loaded
      }
    }
  }

  static getListViewSettings(): ListViewSettings {
    return {
      columns: ['name', 'party', 'date', 'subtotal', 'gstAmount', 'grandTotal'],
    };
  }
}
