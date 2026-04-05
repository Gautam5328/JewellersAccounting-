import { Doc } from 'fyo/model/doc';
import { ListViewSettings } from 'fyo/model/types';
import { Money } from 'pesa';
import { getNumber } from './jewelryCalculations';

export class JewelryStockLedger extends Doc {
  date?: Date;
  jewelryItem?: string;
  item?: string;
  entryType?: 'IN' | 'OUT' | 'ADJUSTMENT';
  metalType?: 'Gold' | 'Silver' | 'Diamond';
  purity?: '18K' | '22K' | '24K';
  weight?: number;
  carat?: number;
  rate?: Money;
  amount?: Money;
  referenceType?: string;
  referenceName?: string;
  referenceLine?: string;

  override async beforeSync(): Promise<void> {
    await super.beforeSync();

    const rate = getNumber(this.rate);
    const weight = getNumber(this.weight);
    const carat = getNumber(this.carat);

    if (!rate || rate <= 0) {
      return;
    }

    const qty = this.metalType === 'Diamond' ? carat : weight;
    if (!qty || qty <= 0) {
      return;
    }

    await this.set('amount', this.fyo.pesa(qty * rate));
  }

  static getListViewSettings(): ListViewSettings {
    return {
      columns: [
        'date',
        'jewelryItem',
        'item',
        'entryType',
        'metalType',
        'weight',
        'carat',
        'rate',
        'amount',
        'referenceName',
      ],
    };
  }
}
