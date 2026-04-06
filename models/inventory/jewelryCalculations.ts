import { Fyo } from 'fyo';
import { isPesa } from 'fyo/utils';
import { ModelNameEnum } from 'models/types';

export type JewelryMetalType = 'Gold' | 'Silver' | 'Diamond';
export type JewelryPurity = '18K' | '22K' | '24K';

export interface JewelryLineInput {
  metalType?: JewelryMetalType | string;
  purity?: JewelryPurity | string;
  netWeight?: number | null;
  goldRate?: number | null;
  wastagePercentage?: number | null;
  makingCharges?: number | null;
  gemAmount?: number | null;
  certificationAmount?: number | null;
  carat?: number | null;
  ratePerCarat?: number | null;
  gstPercent?: number | null;
  makingGstPercent?: number | null;
}

export interface JewelryLineResult {
  purityFactor: number;
  goldValue: number;
  diamondValue: number;
  gemAmount: number;
  certificationAmount: number;
  wastageAmount: number;
  lineAmount: number;
  lineGstAmount: number;
  totalAmount: number;
}

export function getPurityFactor(purity?: string): number {
  if (purity === '18K') {
    return 0.75;
  }

  if (purity === '22K') {
    return 0.916;
  }

  if (purity === '24K') {
    return 0.999;
  }

  return 1;
}

export function getNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (isPesa(value)) {
    return value.float;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function calculateJewelryLine(input: JewelryLineInput): JewelryLineResult {
  const purityFactor = getPurityFactor(input.purity);
  const netWeight = getNumber(input.netWeight);
  const goldRate = getNumber(input.goldRate);
  const wastagePercentage = getNumber(input.wastagePercentage);
  const makingCharges = getNumber(input.makingCharges);
  const gemAmount = getNumber(input.gemAmount);
  const certificationAmount = getNumber(input.certificationAmount);
  const carat = getNumber(input.carat);
  const ratePerCarat = getNumber(input.ratePerCarat);
  const gstPercent =
    input.gstPercent === null || input.gstPercent === undefined
      ? 3
      : getNumber(input.gstPercent);
  const makingGstPercent =
    input.makingGstPercent === null || input.makingGstPercent === undefined
      ? 5
      : getNumber(input.makingGstPercent);

  const goldValue = netWeight * goldRate * purityFactor;
  const diamondValue = carat * ratePerCarat;
  const materialValue = (goldValue || 0) + (diamondValue || 0) + (gemAmount || 0);
  const wastageAmount = materialValue * (wastagePercentage / 100);
  const lineAmount =
    materialValue + wastageAmount + makingCharges + (certificationAmount || 0);
  const lineGstAmount =
    materialValue * (gstPercent / 100) +
    wastageAmount * (gstPercent / 100) +
    (makingCharges + (certificationAmount || 0)) * (makingGstPercent / 100);

  return {
    purityFactor,
    goldValue,
    diamondValue,
    gemAmount,
    certificationAmount,
    wastageAmount,
    lineAmount,
    lineGstAmount,
    totalAmount: lineAmount + lineGstAmount,
  };
}

export async function getLatestGoldRate(
  fyo: Fyo,
  purity: string
): Promise<number | undefined> {
  const rows = (await fyo.db.getAll(ModelNameEnum.GoldRate, {
    fields: ['ratePerGram'],
    filters: { purity, isActive: true },
    orderBy: ['date', 'modified'],
    order: 'desc',
    limit: 1,
  })) as { ratePerGram?: unknown }[];

  if (!rows.length) {
    return;
  }

  return getNumber(rows[0]?.ratePerGram);
}

export async function getLatestGoldPurchaseRate(
  fyo: Fyo,
  purity: string
): Promise<number | undefined> {
  let rows: { purchaseRatePerGram?: unknown }[] = [];
  try {
    rows = (await fyo.db.getAll(ModelNameEnum.GoldRate, {
      fields: ['purchaseRatePerGram'],
      filters: { purity, isActive: true },
      orderBy: ['date', 'modified'],
      order: 'desc',
      limit: 1,
    })) as { purchaseRatePerGram?: unknown }[];
  } catch {
    return;
  }

  if (!rows.length) {
    return;
  }

  return getNumber(rows[0]?.purchaseRatePerGram);
}

export async function getLatestDiamondRate(
  fyo: Fyo,
  cut?: string,
  clarity?: string,
  color?: string
): Promise<number | undefined> {
  const rows = (await fyo.db.getAll(ModelNameEnum.DiamondRate, {
    fields: ['ratePerCarat'],
    filters: {
      isActive: true,
      ...(cut ? { cut } : {}),
      ...(clarity ? { clarity } : {}),
      ...(color ? { color } : {}),
    },
    orderBy: ['date', 'modified'],
    order: 'desc',
    limit: 1,
  })) as { ratePerCarat?: unknown }[];

  if (!rows.length) {
    return;
  }

  return getNumber(rows[0]?.ratePerCarat);
}

export async function getLatestDiamondPurchaseRate(
  fyo: Fyo,
  cut?: string,
  clarity?: string,
  color?: string
): Promise<number | undefined> {
  let rows: { purchaseRatePerCarat?: unknown }[] = [];
  try {
    rows = (await fyo.db.getAll(ModelNameEnum.DiamondRate, {
      fields: ['purchaseRatePerCarat'],
      filters: {
        isActive: true,
        ...(cut ? { cut } : {}),
        ...(clarity ? { clarity } : {}),
        ...(color ? { color } : {}),
      },
      orderBy: ['date', 'modified'],
      order: 'desc',
      limit: 1,
    })) as { purchaseRatePerCarat?: unknown }[];
  } catch {
    return;
  }

  if (!rows.length) {
    return;
  }

  return getNumber(rows[0]?.purchaseRatePerCarat);
}
