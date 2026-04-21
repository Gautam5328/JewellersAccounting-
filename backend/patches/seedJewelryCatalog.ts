import { ModelNameEnum } from 'models/types';
import { DatabaseManager } from '../database/manager';
import { getDefaultMetaFieldValueMap } from 'backend/helpers';

async function execute(dm: DatabaseManager) {
  const defaults = getDefaultMetaFieldValueMap();

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
      ...defaults,
    });
  }
}

export default { execute };

