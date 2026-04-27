import { ModelNameEnum } from 'models/types';
import { DatabaseManager } from '../database/manager';
import { getDefaultMetaFieldValueMap } from 'backend/helpers';

async function execute(dm: DatabaseManager) {
  const defaults = getDefaultMetaFieldValueMap();

  const names = ['Main Store', 'Showroom', 'Workshop'];

  for (const name of names) {
    const exists = await dm.db?.exists(ModelNameEnum.Location, name);
    if (exists) {
      continue;
    }

    await dm.db?.insert(ModelNameEnum.Location, { name, ...defaults });
  }
}

export default { execute };

