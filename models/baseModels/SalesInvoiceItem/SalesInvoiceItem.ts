import { ChangeArg } from 'fyo/model/types';
import { ModelNameEnum } from 'models/types';
import {
  calculateJewelryLine,
  getLatestDiamondRate,
  getLatestGoldRate,
  getNumber,
} from 'models/inventory/jewelryCalculations';
import { InvoiceItem } from '../InvoiceItem/InvoiceItem';

export class SalesInvoiceItem extends InvoiceItem {
  metalType?: 'Gold' | 'Silver' | 'Diamond';
  purity?: '9K' | '14K' | '18K' | '22K' | '24K';
  grossWeight?: number;
  netWeight?: number;
  wastagePercentage?: number;
  goldRate?: import('pesa').Money;
  goldValue?: import('pesa').Money;
  wastageAmount?: import('pesa').Money;
  makingCharges?: import('pesa').Money;
  carat?: number;
  cut?: string;
  clarity?: string;
  color?: string;
  ratePerCarat?: import('pesa').Money;
  diamondValue?: import('pesa').Money;
  colorStoneCarat?: number;
  colorStoneRatePerCarat?: import('pesa').Money;
  colorStoneAmount?: import('pesa').Money;
  lineAmount?: import('pesa').Money;
  lineGstAmount?: import('pesa').Money;
  totalAmount?: import('pesa').Money;
  gstPercent?: number;
  makingGstPercent?: number;

  override async change(ch: ChangeArg): Promise<void> {
    await super.change(ch);

    if (ch.changed === 'item' && this.item) {
      await this.hydrateJewelryDefaults();
    }

    if (
      [
        'item',
        'metalType',
        'purity',
        'netWeight',
        'goldRate',
        'wastagePercentage',
        'makingCharges',
        'carat',
        'cut',
        'clarity',
        'color',
        'ratePerCarat',
        'colorStoneCarat',
        'colorStoneRatePerCarat',
        'gstPercent',
        'makingGstPercent',
      ].includes(ch.changed)
    ) {
      await this.applyJewelryCalculation();
    }
  }

  private async hydrateJewelryDefaults() {
    let itemData: any;
    try {
      itemData = await this.fyo.db.get(ModelNameEnum.Item, this.item as string, [
        'metalType',
        'purity',
        'weight',
        'carat',
        'makingCharges',
        'colorStoneCarat',
        'colorStoneRatePerCarat',
      ]);
    } catch {
      itemData = await this.fyo.db.get(ModelNameEnum.Item, this.item as string, [
        'metalType',
        'purity',
        'weight',
        'carat',
        'makingCharges',
      ]);
    }

    await this.set({
      metalType: this.metalType ?? (itemData.metalType as string),
      purity: this.purity ?? (itemData.purity as string),
      netWeight: (this.netWeight ?? getNumber(itemData.weight)) as number,
      carat: (this.carat ?? getNumber(itemData.carat)) as number,
      colorStoneCarat: (this.colorStoneCarat ??
        getNumber(itemData.colorStoneCarat)) as number,
      makingCharges: this.fyo.pesa(
        getNumber(this.makingCharges) || getNumber(itemData.makingCharges)
      ),
      ...(getNumber(this.colorStoneRatePerCarat) ||
      getNumber(itemData.colorStoneRatePerCarat)
        ? {
            colorStoneRatePerCarat: this.fyo.pesa(
              getNumber(this.colorStoneRatePerCarat) ||
                getNumber(itemData.colorStoneRatePerCarat)
            ),
          }
        : {}),
    });

    if (!this.goldRate?.float && this.purity) {
      const latestGoldRate = await getLatestGoldRate(this.fyo, this.purity);
      if (latestGoldRate !== undefined) {
        await this.set('goldRate', this.fyo.pesa(latestGoldRate));
      }
    }

    if (!this.ratePerCarat?.float) {
      const latestDiamondRate = await getLatestDiamondRate(
        this.fyo,
        this.cut,
        this.clarity,
        this.color
      );
      if (latestDiamondRate !== undefined) {
        await this.set('ratePerCarat', this.fyo.pesa(latestDiamondRate));
      }
    }
  }

  private async applyJewelryCalculation() {
    if (!this.metalType && !this.netWeight && !this.carat) {
      return;
    }

    const result = calculateJewelryLine({
      metalType: this.metalType,
      purity: this.purity,
      netWeight: this.netWeight,
      goldRate: getNumber(this.goldRate),
      wastagePercentage: this.wastagePercentage,
      makingCharges: getNumber(this.makingCharges),
      carat: this.carat,
      ratePerCarat: getNumber(this.ratePerCarat),
      colorStoneCarat: this.colorStoneCarat,
      colorStoneRatePerCarat: getNumber(this.colorStoneRatePerCarat),
      gstPercent: this.gstPercent ?? 3,
      makingGstPercent: this.makingGstPercent ?? 5,
    });

    await this.set({
      goldValue: this.fyo.pesa(result.goldValue),
      diamondValue: this.fyo.pesa(result.diamondValue),
      colorStoneAmount: this.fyo.pesa(result.colorStoneAmount),
      wastageAmount: this.fyo.pesa(result.wastageAmount),
      lineAmount: this.fyo.pesa(result.lineAmount),
      lineGstAmount: this.fyo.pesa(result.lineGstAmount),
      totalAmount: this.fyo.pesa(result.totalAmount),
      rate: this.fyo.pesa(result.totalAmount),
      quantity: this.quantity ?? 1,
    });
  }
}
