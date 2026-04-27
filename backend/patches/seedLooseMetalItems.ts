import { ModelNameEnum } from 'models/types';
import { DatabaseManager } from '../database/manager';
import { getDefaultMetaFieldValueMap } from 'backend/helpers';

async function execute(dm: DatabaseManager) {
  const defaults = getDefaultMetaFieldValueMap();

  const items: { name: string; metalType: 'Gold' | 'Silver' | 'Diamond' }[] = [
    { name: 'Loose Gold', metalType: 'Gold' },
    { name: 'Loose Silver', metalType: 'Silver' },
    { name: 'Loose Diamond', metalType: 'Diamond' },
  ];

  for (const item of items) {
    const exists = await dm.db?.exists(ModelNameEnum.Item, item.name);
    if (exists) {
      continue;
    }

    await dm.db?.insert(ModelNameEnum.Item, {
      name: item.name,
      for: 'Both',
      itemType: 'Product',
      unit: 'Unit',
      trackItem: 0,
      metalType: item.metalType,
      ...defaults,
    });
  }
}

export default { execute };

