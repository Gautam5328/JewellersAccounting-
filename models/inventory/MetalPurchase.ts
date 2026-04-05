import { Doc } from 'fyo/model/doc';
import { ListViewSettings } from 'fyo/model/types';
import { ModelNameEnum } from 'models/types';
import { getNumber } from './jewelryCalculations';

export class MetalPurchase extends Doc {
  date?: Date;
  supplier?: string;
  metalType?: 'Gold' | 'Silver' | 'Diamond';
  purity?: '18K' | '22K' | '24K';
  grams?: number;
  carats?: number;
  ratePerUnit?: import('pesa').Money;
  amount?: import('pesa').Money;

  override async beforeSync(): Promise<void> {
    await super.beforeSync();
    const qty =
      this.metalType === 'Diamond'
        ? getNumber(this.carats)
        : getNumber(this.grams);
    const rate = getNumber(this.ratePerUnit);
    if (qty > 0 && rate > 0) {
      await this.set('amount', this.fyo.pesa(rate * qty));
    }
  }

  override async afterSync(): Promise<void> {
    await super.afterSync();
    if (!this.name) {
      return;
    }
    const existing = await this.fyo.db.getAll(ModelNameEnum.JewelryStockLedger, {
      fields: ['name'],
      filters: {
        referenceType: this.schemaName,
        referenceName: this.name,
        entryType: 'IN',
      },
      limit: 1,
    });
    if (existing.length) {
      return;
    }
    const qty =
      this.metalType === 'Diamond'
        ? getNumber(this.carats)
        : getNumber(this.grams);
    const rate = getNumber(this.ratePerUnit);
    const amount = getNumber(this.amount);

    await this.fyo.doc
      .getNewDoc(ModelNameEnum.JewelryStockLedger, {
        date: this.date ?? new Date(),
        entryType: 'IN',
        metalType: this.metalType,
        purity: this.purity,
        ...(this.metalType === 'Diamond'
          ? { carat: qty }
          : { weight: qty }),
        rate: rate > 0 ? this.fyo.pesa(rate) : undefined,
        amount: amount > 0 ? this.fyo.pesa(amount) : undefined,
        referenceType: this.schemaName,
        referenceName: this.name,
        remarks: this.supplier,
      })
      .sync();
  }

  static getListViewSettings(): ListViewSettings {
    return {
      columns: [
        'date',
        'supplier',
        'metalType',
        'purity',
        'grams',
        'carats',
        'ratePerUnit',
        'amount',
      ],
    };
  }
}
