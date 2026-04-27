import { Patch } from '../database/types';
import addUOMs from './addUOMs';
import createInventoryNumberSeries from './createInventoryNumberSeries';
import fixRoundOffAccount from './fixRoundOffAccount';
import testPatch from './testPatch';
import updateSchemas from './updateSchemas';
import setPaymentReferenceType from './setPaymentReferenceType';
import fixLedgerDateTime from './v0_21_0/fixLedgerDateTime';
import fixItemHSNField from './fixItemHSNField';
import createPaymentMethods from './createPaymentMethods';
import seedJewelryCatalog from './seedJewelryCatalog';
import seedJewelryCatalogV2 from './seedJewelryCatalogV2';
import seedJewelryLocations from './seedJewelryLocations';
import seedLooseMetalItems from './seedLooseMetalItems';

export default [
  { name: 'testPatch', version: '0.5.0-beta.0', patch: testPatch },
  {
    name: 'updateSchemas',
    version: '0.5.0-beta.0',
    patch: updateSchemas,
    priority: 100,
  },
  {
    name: 'addUOMs',
    version: '0.6.0-beta.0',
    patch: addUOMs,
  },
  {
    name: 'fixRoundOffAccount',
    version: '0.6.3-beta.0',
    patch: fixRoundOffAccount,
  },
  {
    name: 'createInventoryNumberSeries',
    version: '0.6.6-beta.0',
    patch: createInventoryNumberSeries,
  },
  {
    name: 'setPaymentReferenceType',
    version: '0.20.1',
    patch: setPaymentReferenceType,
  },
  {
    name: 'fixLedgerDateTime',
    version: '0.21.2',
    patch: fixLedgerDateTime,
  },
  { name: 'fixItemHSNField', version: '0.24.0', patch: fixItemHSNField },
  {
    name: 'createPaymentMethods',
    version: '0.25.1',
    patch: createPaymentMethods,
  },
  {
    name: 'seedJewelryCatalog',
    version: '0.37.0',
    patch: seedJewelryCatalog,
  },
  {
    name: 'seedJewelryCatalogV2',
    version: '0.37.0',
    patch: seedJewelryCatalogV2,
  },
  {
    name: 'seedJewelryLocations',
    version: '0.37.0',
    patch: seedJewelryLocations,
  },
  {
    name: 'seedLooseMetalItems',
    version: '0.37.0',
    patch: seedLooseMetalItems,
  },
] as Patch[];
