import { Doc } from 'fyo/model/doc';
import { DocValue } from 'fyo/core/types';
import { ListViewSettings, ValidationMap } from 'fyo/model/types';
import { ValidationError } from 'fyo/utils/errors';
import { ModelNameEnum } from 'models/types';
import { Money } from 'pesa';
import { getNumber } from './jewelryCalculations';

export class JewelryItem extends Doc {
  item?: string;
  metalType?: 'Gold' | 'Silver' | 'Diamond';
  purity?: '9K' | '14K' | '18K' | '22K' | '24K';
  goldColor?: 'Yellow' | 'Rose' | 'White';
  grossWeight?: number;
  netWeight?: number;
  weight?: number;
  carat?: number;
  diamondOrigin?: 'Natural' | 'Lab';
  makingCharges?: Money;
  wastagePercentage?: number;
  ratePerCarat?: Money;
  gemAmount?: Money;
  certificationAmount?: Money;
  purchaseRate?: Money;
  saleRate?: Money;
  status?: string;

  validations: ValidationMap = {
    grossWeight: (value: DocValue) => {
      if (value !== null && (value as number) < 0) {
        throw new ValidationError(this.fyo.t`Gross weight cannot be negative.`);
      }
    },
    netWeight: (value: DocValue) => {
      if (value !== null && (value as number) < 0) {
        throw new ValidationError(this.fyo.t`Net weight cannot be negative.`);
      }
    },
    weight: (value: DocValue) => {
      if (value !== null && (value as number) < 0) {
        throw new ValidationError(this.fyo.t`Weight cannot be negative.`);
      }
    },
    carat: (value: DocValue) => {
      if (value !== null && (value as number) < 0) {
        throw new ValidationError(this.fyo.t`Carat cannot be negative.`);
      }
    },
  };

  static getListViewSettings(): ListViewSettings {
    return {
      columns: [
        'name',
        'barcode',
        'metalType',
        'purity',
        'weight',
        'carat',
        'status',
      ],
    };
  }

  override async beforeSync(): Promise<void> {
    (this as any)._wasNewPiece = this.notInserted;
    await super.beforeSync();

    // Keep a single "weight" field populated for reporting/stock summaries.
    if (this.metalType !== 'Diamond') {
      const weight = getNumber(this.weight);
      if (weight > 0) {
        return;
      }

      const derived =
        getNumber(this.netWeight) || getNumber(this.grossWeight) || 0;
      if (derived > 0) {
        await this.set('weight', derived);
      }
    }
  }

  override async afterSync(): Promise<void> {
    await super.afterSync();

    if (!(this as any)._wasNewPiece) {
      return;
    }

    if (!this.name) {
      return;
    }

    // When a new piece is created, treat it as stock coming IN so balances don't go negative.
    const status = this.status ?? 'In Stock';
    if (status !== 'In Stock') {
      return;
    }

    const exists = await this.fyo.db.getAll(ModelNameEnum.JewelryStockLedger, {
      fields: ['name'],
      filters: {
        referenceType: this.schemaName,
        referenceName: this.name,
        entryType: 'IN',
      },
      limit: 1,
    });
    if (exists.length) {
      return;
    }

    const metalType = this.metalType ?? 'Gold';
    const qty =
      metalType === 'Diamond'
        ? getNumber(this.carat)
        : getNumber(this.netWeight) || getNumber(this.weight) || getNumber(this.grossWeight);

    // Best effort: use purchaseRate if set (else 0).
    const rate = getNumber(this.purchaseRate);
    const amount = qty > 0 && rate > 0 ? qty * rate : 0;

    await this.fyo.doc
      .getNewDoc(ModelNameEnum.JewelryStockLedger, {
        date: new Date(),
        jewelryItem: this.name,
        item: this.item,
        entryType: 'IN',
        metalType,
        purity: this.purity,
        ...(metalType === 'Diamond' ? { carat: qty } : { weight: qty }),
        ...(rate > 0 ? { rate: this.fyo.pesa(rate) } : {}),
        ...(amount > 0 ? { amount: this.fyo.pesa(amount) } : {}),
        referenceType: this.schemaName,
        referenceName: this.name,
        remarks: 'Piece added',
      })
      .sync();
  }
}
