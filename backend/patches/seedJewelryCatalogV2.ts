import { ModelNameEnum } from 'models/types';
import { DatabaseManager } from '../database/manager';
import { getDefaultMetaFieldValueMap } from 'backend/helpers';

async function execute(dm: DatabaseManager) {
  const defaults = getDefaultMetaFieldValueMap();

  const incomeAccount =
    (
      (await dm.db?.getAll(ModelNameEnum.Account, {
        fields: ['name'],
        filters: { rootType: 'Income', isGroup: 0 },
        orderBy: ['name'],
        order: 'asc',
        limit: 1,
      })) as { name: string }[]
    )?.[0]?.name ??
    (
      (await dm.db?.getAll(ModelNameEnum.Account, {
        fields: ['name'],
        filters: { rootType: 'Income' },
        orderBy: ['name'],
        order: 'asc',
        limit: 1,
      })) as { name: string }[]
    )?.[0]?.name;

  const expenseAccount =
    (
      (await dm.db?.getAll(ModelNameEnum.Account, {
        fields: ['name'],
        filters: { rootType: 'Expense', isGroup: 0 },
        orderBy: ['name'],
        order: 'asc',
        limit: 1,
      })) as { name: string }[]
    )?.[0]?.name ??
    (
      (await dm.db?.getAll(ModelNameEnum.Account, {
        fields: ['name'],
        filters: { rootType: 'Expense' },
        orderBy: ['name'],
        order: 'asc',
        limit: 1,
      })) as { name: string }[]
    )?.[0]?.name;

  const names = [
    'Ring',
    'Tops',
    'Necklace',
    'Bracelet',
    'Bangle',
    'Pendant Set',
  ];

  for (const name of names) {
    const exists = await dm.db?.exists(ModelNameEnum.Item, name);
    if (exists) {
      continue;
    }

    await dm.db?.insert(ModelNameEnum.Item, {
      name,
      for: 'Both',
      itemType: 'Product',
      unit: 'Unit',
      trackItem: 0,
      ...(incomeAccount ? { incomeAccount } : {}),
      ...(expenseAccount ? { expenseAccount } : {}),
      ...defaults,
    });
  }
}

export default { execute };

