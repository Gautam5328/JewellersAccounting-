import { Doc } from 'fyo/model/doc';
import { ListViewSettings } from 'fyo/model/types';
import { Money } from 'pesa';

export class DiamondRate extends Doc {
  date?: Date;
  cut?: string;
  clarity?: string;
  color?: string;
  caratBand?: string;
  ratePerCarat?: Money;
  purchaseRatePerCarat?: Money;
  isActive?: boolean;

  static getListViewSettings(): ListViewSettings {
    return {
      columns: [
        'date',
        'cut',
        'clarity',
        'color',
        'ratePerCarat',
        'purchaseRatePerCarat',
        'isActive',
      ],
    };
  }
}
