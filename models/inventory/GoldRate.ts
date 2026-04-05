import { Doc } from 'fyo/model/doc';
import { ListViewSettings } from 'fyo/model/types';
import { Money } from 'pesa';

export class GoldRate extends Doc {
  date?: Date;
  purity?: '18K' | '22K' | '24K';
  ratePerGram?: Money;
  purchaseRatePerGram?: Money;
  source?: string;
  isActive?: boolean;

  static getListViewSettings(): ListViewSettings {
    return {
      columns: [
        'date',
        'purity',
        'ratePerGram',
        'purchaseRatePerGram',
        'source',
        'isActive',
      ],
    };
  }
}
