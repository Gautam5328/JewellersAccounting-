import { Doc } from 'fyo/model/doc';
import { ChangeArg } from 'fyo/model/types';
import { ModelNameEnum } from 'models/types';
import { getNumber, calculateJewelryLine, getLatestGoldRate } from './jewelryCalculations';
import { Money } from 'pesa';

export class JewelryInvoiceItem extends Doc {
  item?: string;
  jewelryItem?: string;
  metalType?: 'Gold' | 'Silver' | 'Diamond';
  purity?: '18K' | '22K' | '24K';
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
  makingCharges?: Money;
  gstPercent?: number;
  makingGstPercent?: number;
  lineAmount?: Money;
  lineGstAmount?: Money;
  totalAmount?: Money;

  override async change(ch: ChangeArg): Promise<void> {
    await super.change(ch);

    if (ch.changed === 'item' && this.item) {
      await this.hydrateItemDefaults();
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
    const data = await this.fyo.db.get(
      ModelNameEnum.Item,
      this.item as string,
      ['metalType', 'purity', 'weight', 'carat', 'makingCharges']
    );

    await this.set({
      metalType: (this.metalType ?? data.metalType) as string,
      purity: (this.purity ?? data.purity) as string,
      netWeight: (this.netWeight ?? getNumber(data.weight)) as number,
      carat: (this.carat ?? getNumber(data.carat)) as number,
      makingCharges: this.fyo.pesa(
        getNumber(this.makingCharges) || getNumber(data.makingCharges)
      ),
    });

    if (!this.goldRate?.float && this.purity) {
      const latestGoldRate = await getLatestGoldRate(this.fyo, this.purity);
      if (latestGoldRate !== undefined) {
        await this.set('goldRate', this.fyo.pesa(latestGoldRate));
      }
    }
  }

  private async applyJewelryCalculation() {
    const result = calculateJewelryLine({
      metalType: this.metalType,
      purity: this.purity,
      netWeight: this.netWeight,
      goldRate: getNumber(this.goldRate),
      wastagePercentage: this.wastagePercentage,
      makingCharges: getNumber(this.makingCharges),
      carat: this.carat,
      ratePerCarat: getNumber(this.ratePerCarat),
      gstPercent: this.gstPercent ?? 3,
      makingGstPercent: this.makingGstPercent ?? 5,
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
