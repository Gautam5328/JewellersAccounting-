import { ModelNameEnum } from 'models/types';
import { DatabaseManager } from '../database/manager';
import { getDefaultMetaFieldValueMap } from 'backend/helpers';

async function getDefaultAccount(
  dm: DatabaseManager,
  rootType: 'Income' | 'Expense'
): Promise<string | undefined> {
  const account =
    (
      (await dm.db?.getAll(ModelNameEnum.Account, {
        fields: ['name'],
        filters: { rootType, isGroup: 0 },
        orderBy: ['name'],
        order: 'asc',
        limit: 1,
      })) as { name: string }[]
    )?.[0]?.name ??
    (
      (await dm.db?.getAll(ModelNameEnum.Account, {
        fields: ['name'],
        filters: { rootType },
        orderBy: ['name'],
        order: 'asc',
        limit: 1,
      })) as { name: string }[]
    )?.[0]?.name;

  return account;
}

async function execute(dm: DatabaseManager) {
  const defaults = getDefaultMetaFieldValueMap();
  const incomeAccount = await getDefaultAccount(dm, 'Income');
  const expenseAccount = await getDefaultAccount(dm, 'Expense');

  for (const oldName of ['Pendent Set', 'Pendant Set']) {
    const oldExists = await dm.db?.exists(ModelNameEnum.Item, oldName);
    const pendantExists = await dm.db?.exists(ModelNameEnum.Item, 'Pendant');
    if (oldExists && !pendantExists) {
      await dm.db?.rename(ModelNameEnum.Item, oldName, 'Pendant');
      break;
    }
  }

  for (const name of ['Pendant', 'Tanmaniya']) {
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
