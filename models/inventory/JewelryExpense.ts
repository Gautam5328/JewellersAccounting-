import { Doc } from 'fyo/model/doc';
import { ListViewSettings } from 'fyo/model/types';

export class JewelryExpense extends Doc {
  date?: Date;
  title?: string;
  amount?: import('pesa').Money;

  static getListViewSettings(): ListViewSettings {
    return {
      columns: ['date', 'title', 'amount'],
    };
  }
}

