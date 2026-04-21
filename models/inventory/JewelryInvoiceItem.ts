import { Doc } from 'fyo/model/doc';
import { ChangeArg, HiddenMap } from 'fyo/model/types';
import { ModelNameEnum } from 'models/types';
import {
  getNumber,
  calculateJewelryLine,
  getLatestGoldRate,
  getLatestDiamondRate,
} from './jewelryCalculations';
import { Money } from 'pesa';

export class JewelryInvoiceItem extends Doc {
  item?: string;
  jewelryItem?: string;
  metalType?: 'Gold' | 'Silver' | 'Diamond';
  goldColor?: 'Yellow' | 'Rose' | 'White';
  purity?: '9K' | '14K' | '18K' | '22K' | '24K';
  netWeight?: number;
  grossWeight?: number;
  wastagePercentage?: number;
  goldRate?: Money;
  goldValue?: Money;
  wastageAmount?: Money;
  carat?: number;
  diamondOrigin?: 'Natural' | 'Lab';
  cut?: string;
  clarity?: string;
  color?: string;
  ratePerCarat?: Money;
  diamondValue?: Money;
  gemAmount?: Money;
  certificationAmount?: Money;
  makingCharges?: Money;
  metalAmount?: Money;
  gstPercent?: number;
  makingGstPercent?: number;
  lineAmount?: Money;
  lineGstAmount?: Money;
  totalAmount?: Money;
  hsnCode?: string;
  hidden: HiddenMap = {
    gstPercent: () => (this.parentdoc as any)?.invoiceType === 'Non-GST Invoice',
    makingGstPercent: () =>
      (this.parentdoc as any)?.invoiceType === 'Non-GST Invoice',
    lineGstAmount: () =>
      (this.parentdoc as any)?.invoiceType === 'Non-GST Invoice',
    hsnCode: () => (this.parentdoc as any)?.invoiceType === 'Non-GST Invoice',
  };

  override async change(ch: ChangeArg): Promise<void> {
    await super.change(ch);

    if ((this as any)._hydratingDefaults) {
      return;
    }

    if (ch.changed === 'item' && this.item) {
      await this.hydrateItemDefaults();
    }

    if (ch.changed === 'jewelryItem' && this.jewelryItem) {
      await this.hydratePieceDefaults();
    }

    if (
      [
        'item',
        'jewelryItem',
        'metalType',
        'purity',
        'netWeight',
        'goldRate',
        'metalAmount',
        'wastagePercentage',
        'makingCharges',
        'carat',
        'ratePerCarat',
        'gstPercent',
        'makingGstPercent',
      ].includes(ch.changed)
    ) {
      await this.applyJewelryCalculation();
    }
  }

  override async beforeSync(): Promise<void> {
    await super.beforeSync();
    await this.applyJewelryCalculation();
  }

  private async hydrateItemDefaults() {
    let data: any;
    try {
      data = await this.fyo.db.get(ModelNameEnum.Item, this.item as string, [
        'metalType',
        'purity',
        'weight',
        'carat',
        'makingCharges',
        'wastagePercentage',
        'diamondOrigin',
        'ratePerCarat',
        'gemAmount',
        'certificationAmount',
        'rate',
      ]);
    } catch {
      // Backward-compat: DB not migrated yet.
      data = await this.fyo.db.get(ModelNameEnum.Item, this.item as string, [
        'metalType',
        'purity',
        'weight',
        'carat',
        'makingCharges',
        'rate',
      ]);
    }

    await this.set({
      metalType: (this.metalType ?? data.metalType) as string,
      ...(this.goldColor ? {} : data.goldColor ? { goldColor: data.goldColor as string } : {}),
      purity: (this.purity ?? data.purity) as string,
      netWeight: (this.netWeight ?? getNumber(data.weight)) as number,
      carat: (this.carat ?? getNumber(data.carat)) as number,
      ...(this.wastagePercentage === null || this.wastagePercentage === undefined
        ? getNumber(data.wastagePercentage) > 0
          ? { wastagePercentage: getNumber(data.wastagePercentage) as number }
          : {}
        : {}),
      ...(this.diamondOrigin
        ? {}
        : data.diamondOrigin
          ? { diamondOrigin: data.diamondOrigin as string }
          : {}),
      ...(getNumber(this.makingCharges) || getNumber(data.makingCharges)
        ? {
            makingCharges: this.fyo.pesa(
              getNumber(this.makingCharges) || getNumber(data.makingCharges)
            ),
          }
        : {}),
      ...(getNumber(this.gemAmount) || getNumber(data.gemAmount)
        ? {
            gemAmount: this.fyo.pesa(
              getNumber(this.gemAmount) || getNumber(data.gemAmount)
            ),
          }
        : {}),
      ...(getNumber(this.certificationAmount) || getNumber(data.certificationAmount)
        ? {
            certificationAmount: this.fyo.pesa(
              getNumber(this.certificationAmount) ||
                getNumber(data.certificationAmount)
            ),
          }
        : {}),
      ...(getNumber(this.metalAmount) || getNumber(data.rate)
        ? {
            metalAmount: this.fyo.pesa(
              getNumber(this.metalAmount) || getNumber(data.rate)
            ),
          }
        : {}),
    });

    const resolvedMetalType = (this.metalType ?? data.metalType) as
      | string
      | undefined;

    if (
      (this.metalType === 'Diamond' || data.metalType === 'Diamond') &&
      !this.ratePerCarat?.float
    ) {
      const fallbackRate = getNumber(data.ratePerCarat) || getNumber(data.rate);
      if (fallbackRate > 0) {
        await this.set('ratePerCarat', this.fyo.pesa(fallbackRate));
      } else {
        const latest = await getLatestDiamondRate(this.fyo);
        if (latest !== undefined && latest > 0) {
          await this.set('ratePerCarat', this.fyo.pesa(latest));
        }
      }
    }
  }

  private async hydratePieceDefaults() {
    if (!this.jewelryItem) {
      return;
    }

    let data: any;
    try {
      data = await this.fyo.db.get(ModelNameEnum.JewelryItem, this.jewelryItem, [
        'item',
        'metalType',
        'purity',
        'grossWeight',
        'netWeight',
        'weight',
        'carat',
        'makingCharges',
        'wastagePercentage',
        'diamondOrigin',
        'ratePerCarat',
        'gemAmount',
        'certificationAmount',
        'saleRate',
      ]);
    } catch {
      data = await this.fyo.db.get(ModelNameEnum.JewelryItem, this.jewelryItem, [
        'item',
        'metalType',
        'purity',
        'grossWeight',
        'netWeight',
        'weight',
        'carat',
        'makingCharges',
        'saleRate',
      ]);
    }

    const pieceMetalType = (data?.metalType as string | undefined) ?? undefined;
    const metalType = (this.metalType ?? pieceMetalType) as string | undefined;
    const netWeight =
      getNumber(data?.netWeight) ||
      getNumber(data?.weight) ||
      getNumber(data?.grossWeight);
    const grossWeight = getNumber(data?.grossWeight) || netWeight;
    const carat = getNumber(data?.carat);
    const makingCharges = getNumber(data?.makingCharges);
    const wastagePercentage = getNumber(data?.wastagePercentage);
    const gemAmount = getNumber(data?.gemAmount);
    const certificationAmount = getNumber(data?.certificationAmount);
    const saleRate = getNumber(data?.saleRate);
    const pieceRatePerCarat = getNumber(data?.ratePerCarat);

    (this as any)._hydratingDefaults = true;
    try {
      await this.set({
        ...(data?.item ? { item: data.item as string } : {}),
        ...(pieceMetalType ? { metalType: pieceMetalType as string } : {}),
        ...(data?.goldColor ? { goldColor: data.goldColor as string } : {}),
        ...(data?.purity ? { purity: data.purity as string } : {}),
        ...(grossWeight > 0 ? { grossWeight } : {}),
        ...(netWeight > 0 ? { netWeight } : {}),
        ...(carat > 0 ? { carat } : {}),
        ...(makingCharges > 0 ? { makingCharges: this.fyo.pesa(makingCharges) } : {}),
        ...(wastagePercentage > 0 ? { wastagePercentage } : {}),
        ...(data?.diamondOrigin ? { diamondOrigin: data.diamondOrigin as string } : {}),
        ...(gemAmount > 0 ? { gemAmount: this.fyo.pesa(gemAmount) } : {}),
        ...(certificationAmount > 0
          ? { certificationAmount: this.fyo.pesa(certificationAmount) }
          : {}),
      });

      if (metalType === 'Diamond') {
        const rate = pieceRatePerCarat || saleRate;
        if (rate > 0) {
          await this.set('ratePerCarat', this.fyo.pesa(rate));
        }
      } else {
        if (saleRate > 0) {
          await this.set('metalAmount', this.fyo.pesa(saleRate));
        }
      }
    } finally {
      (this as any)._hydratingDefaults = false;
    }

    await this.applyJewelryCalculation();
  }

  private async applyJewelryCalculation() {
    const invoiceType = (this.parentdoc as any)?.invoiceType as
      | 'GST Invoice'
      | 'Non-GST Invoice'
      | undefined;

    const result = calculateJewelryLine({
      metalType: this.metalType,
      purity: this.purity,
      netWeight: this.netWeight,
      goldRate: getNumber(this.goldRate),
      metalAmount: getNumber(this.metalAmount),
      wastagePercentage: this.wastagePercentage,
      makingCharges: getNumber(this.makingCharges),
      gemAmount: getNumber(this.gemAmount),
      certificationAmount: getNumber(this.certificationAmount),
      carat: this.carat,
      ratePerCarat: getNumber(this.ratePerCarat),
      gstPercent: invoiceType === 'Non-GST Invoice' ? 0 : this.gstPercent ?? 3,
      makingGstPercent:
        invoiceType === 'Non-GST Invoice' ? 0 : this.makingGstPercent ?? 5,
    });

    await this.set({
      goldValue: this.fyo.pesa(result.goldValue),
      diamondValue: this.fyo.pesa(result.diamondValue),
      wastageAmount: this.fyo.pesa(result.wastageAmount),
      lineAmount: this.fyo.pesa(result.lineAmount),
      lineGstAmount: this.fyo.pesa(result.lineGstAmount),
      totalAmount: this.fyo.pesa(result.totalAmount),
    });
  }
}
