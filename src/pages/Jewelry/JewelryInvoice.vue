<template>
  <div class="flex flex-col h-full">
    <PageHeader title="New Invoice">
      <Button @click="openInvoicesList">Invoices</Button>
      <Button type="primary" @click="createDraftInvoice">Create</Button>
    </PageHeader>

    <div class="grid grid-cols-12 gap-4 p-4">
      <div class="col-span-8 rounded border p-4 dark:border-gray-800">
        <p class="font-semibold mb-3">Invoice</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Customer</p>
            <select v-model="draft.party" class="w-full px-2 py-1 border rounded bg-transparent">
              <option :value="null">Select Customer</option>
              <option v-for="party in parties" :key="party" :value="party">
                {{ party }}
              </option>
            </select>
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Invoice Type</p>
            <select
              v-model="draft.invoiceType"
              class="w-full px-2 py-1 border rounded bg-transparent"
            >
              <option value="GST Invoice">GST Invoice</option>
              <option value="Non-GST Invoice">Non-GST Invoice</option>
            </select>
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Old Gold Exchange Amount</p>
            <input
              v-model.number="draft.oldGoldExchangeAmount"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Discount</p>
            <input
              v-model.number="draft.discountAmount"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter discount"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Jewelry Item</p>
            <select
              v-model="draft.item"
              class="w-full px-2 py-1 border rounded bg-transparent"
              @change="onItemSelected"
            >
              <option :value="null">Select Jewelry Item</option>
              <option v-for="item in items" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Piece (optional)</p>
            <select
              v-model="draft.jewelryItem"
              class="w-full px-2 py-1 border rounded bg-transparent"
              @change="onJewelryItemSelected"
            >
              <option :value="null">Select Piece</option>
              <option
                v-for="piece in filteredPieces"
                :key="piece.name"
                :value="piece.name"
              >
                {{ pieceLabel(piece) }}
              </option>
            </select>
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Metal Type</p>
            <select v-model="draft.metalType" class="w-full px-2 py-1 border rounded bg-transparent">
              <option>Gold</option>
              <option>Silver</option>
              <option>Diamond</option>
            </select>
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Purity</p>
            <select v-model="draft.purity" class="w-full px-2 py-1 border rounded bg-transparent">
              <option>9K</option>
              <option>14K</option>
              <option>18K</option>
              <option>22K</option>
              <option>24K</option>
            </select>
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Gross Weight (g)</p>
            <input
              v-model.number="draft.grossWeight"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.001"
              placeholder="Enter gross weight"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Net Weight (g)</p>
            <input
              v-model.number="draft.netWeight"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.001"
              placeholder="Enter net weight"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Jewellery Cost</p>
            <input
              v-model.number="draft.metalAmount"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter jewellery cost"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Wastage %</p>
            <input
              v-model.number="draft.wastagePercentage"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter wastage %"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Making Charges</p>
            <input
              v-model.number="draft.makingCharges"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter making charges"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Stone Charges</p>
            <input
              v-model.number="draft.gemAmount"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Gem amount"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">
              Certification Amount
            </p>
            <input
              v-model.number="draft.certificationAmount"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Certification amount"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Carat</p>
            <input
              v-model.number="draft.carat"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter carat"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Per ct price</p>
            <input
              v-model.number="draft.ratePerCarat"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Per ct price"
            />
          </div>
          <div>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Diamond Type</p>
            <select
              v-model="draft.diamondOrigin"
              class="w-full px-2 py-1 border rounded bg-transparent"
            >
              <option :value="null">Select type</option>
              <option value="Natural">Natural</option>
              <option value="Lab">Lab</option>
            </select>
          </div>
          <div v-if="draft.invoiceType === 'GST Invoice'">
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">HSN Code</p>
            <input
              v-model="draft.hsnCode"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="text"
              placeholder="7113"
            />
          </div>
          <div v-if="draft.invoiceType === 'GST Invoice'">
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">GST % (Metal)</p>
            <input
              v-model.number="draft.gstPercent"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter GST %"
            />
          </div>
        </div>
      </div>

      <div class="col-span-4 rounded border p-4 dark:border-gray-800">
        <p class="font-semibold mb-3">Live Totals</p>
        <p class="text-sm py-1">
          {{ draft.metalType === 'Diamond' ? 'Metal Value' : 'Jewellery Cost' }}:
          {{ formatCurrency(calculation.goldValue) }}
        </p>
        <p class="text-sm py-1">
          Diamond Value: {{ formatCurrency(calculation.diamondValue) }}
        </p>
        <p class="text-sm py-1">
          Wastage Amount: {{ formatCurrency(calculation.wastageAmount) }}
        </p>
        <p class="text-sm py-1">Line Amount: {{ formatCurrency(calculation.lineAmount) }}</p>
        <p class="text-sm py-1">GST: {{ formatCurrency(calculation.lineGstAmount) }}</p>
        <p class="text-base font-semibold py-2 border-t mt-3 dark:border-gray-800">
          Final Total:
          {{
            formatCurrency(
              calculation.totalAmount -
                Number(draft.oldGoldExchangeAmount || 0) -
                Number(draft.discountAmount || 0)
            )
          }}
        </p>
      </div>
    </div>

    <div class="px-4 pb-4">
      <p class="font-semibold mb-2">Recent Invoices</p>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left border-y dark:border-gray-800">
            <th class="py-2">Invoice</th>
            <th class="py-2">Customer</th>
            <th class="py-2">Date</th>
            <th class="py-2">Grand Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in recentInvoices"
            :key="row.name"
            class="border-b dark:border-gray-800 cursor-pointer"
            @click="openInvoice(row.name)"
          >
            <td class="py-2">{{ row.name }}</td>
            <td class="py-2">{{ row.party }}</td>
            <td class="py-2">{{ formatDate(row.date) }}</td>
            <td class="py-2">{{ formatCurrency(row.grandTotal) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { ModelNameEnum } from 'models/types';
import {
  calculateJewelryLine,
  getLatestDiamondRate,
  getNumber,
} from 'models/inventory/jewelryCalculations';
import Button from 'src/components/Button.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { fyo } from 'src/initFyo';
import { showToast } from 'src/utils/interactive';
import { routeTo } from 'src/utils/ui';
import { defineComponent } from 'vue';

interface InvoiceRow {
  name: string;
  party?: string;
  date?: string | Date;
  grandTotal?: unknown;
}

type NullableNumber = number | null;

interface JewelryPieceRow {
  name: string;
  barcode?: string;
  item?: string;
  status?: string;
  metalType?: string;
  purity?: string;
  weight?: unknown;
  netWeight?: unknown;
  grossWeight?: unknown;
  carat?: unknown;
  makingCharges?: unknown;
  wastagePercentage?: unknown;
  diamondOrigin?: string;
  ratePerCarat?: unknown;
  gemAmount?: unknown;
  certificationAmount?: unknown;
  saleRate?: unknown;
}

export default defineComponent({
  name: 'JewelryInvoicePage',
  components: { PageHeader, Button },
  data() {
    return {
      draft: {
        party: null as string | null,
        invoiceType: 'GST Invoice' as 'GST Invoice' | 'Non-GST Invoice',
        item: null as string | null,
        jewelryItem: null as string | null,
        metalType: 'Gold',
        purity: '22K',
        grossWeight: null as NullableNumber,
        netWeight: null as NullableNumber,
        goldRate: null as NullableNumber,
        wastagePercentage: null as NullableNumber,
        makingCharges: null as NullableNumber,
        metalAmount: null as NullableNumber,
        gemAmount: null as NullableNumber,
        certificationAmount: null as NullableNumber,
        carat: null as NullableNumber,
        ratePerCarat: null as NullableNumber,
        diamondOrigin: null as string | null,
        gstPercent: null as NullableNumber,
        makingGstPercent: null as NullableNumber,
        oldGoldExchangeAmount: null as NullableNumber,
        discountAmount: null as NullableNumber,
        hsnCode: '7113' as string,
      },
      parties: [] as string[],
      items: [] as string[],
      jewelryPieces: [] as JewelryPieceRow[],
      recentInvoices: [] as InvoiceRow[],
    };
  },
  computed: {
    calculation() {
      const input = {
        ...this.draft,
        ...(this.draft.invoiceType === 'Non-GST Invoice'
          ? { gstPercent: 0, makingGstPercent: 0 }
          : {}),
      };
      return calculateJewelryLine(input);
    },
    filteredPieces(): JewelryPieceRow[] {
      const item = this.draft.item;
      return this.jewelryPieces.filter((row) => {
        if (row.status && row.status !== 'In Stock') {
          return false;
        }
        if (!item) {
          return true;
        }
        return row.item === item;
      });
    },
  },
  async activated() {
    await this.loadOptions();
    await this.loadRecentInvoices();
  },
  methods: {
    formatDate(value?: string | Date) {
      if (!value) {
        return '';
      }

      const parsed = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(parsed.valueOf())) {
        return '';
      }

      return parsed.toISOString().slice(0, 10);
    },
    formatCurrency(value: unknown) {
      return fyo.format(getNumber(value), 'Currency');
    },
    async loadOptions() {
      const parties = await fyo.db.getAll(ModelNameEnum.Party, {
        fields: ['name'],
        filters: { role: ['in', ['Customer', 'Both']] },
        orderBy: ['name'],
        order: 'asc',
      });
      const [items, pieces] = await Promise.all([
        fyo.db.getAll(ModelNameEnum.Item, {
          fields: ['name'],
          orderBy: ['name'],
          order: 'asc',
        }),
        (async () => {
          try {
            return await fyo.db.getAll(ModelNameEnum.JewelryItem, {
              fields: [
                'name',
                'barcode',
                'item',
                'status',
                'metalType',
                'purity',
                'weight',
                'netWeight',
                'grossWeight',
                'carat',
                'makingCharges',
                'wastagePercentage',
                'diamondOrigin',
                'ratePerCarat',
                'gemAmount',
                'certificationAmount',
                'saleRate',
              ],
              orderBy: ['modified'],
              order: 'desc',
              limit: 500,
            });
          } catch {
            // Backward-compat: DB not migrated yet.
            return await fyo.db.getAll(ModelNameEnum.JewelryItem, {
              fields: [
                'name',
                'barcode',
                'item',
                'status',
                'metalType',
                'purity',
                'weight',
                'netWeight',
                'grossWeight',
                'carat',
                'makingCharges',
              ],
              orderBy: ['modified'],
              order: 'desc',
              limit: 500,
            });
          }
        })(),
      ]);

      this.parties = parties.map((row) => row.name as string);
      this.items = items.map((row) => row.name as string);
      this.jewelryPieces = pieces as JewelryPieceRow[];
      if (!this.draft.party && this.parties.length) {
        this.draft.party = this.parties[0];
      }
      if (!this.draft.item && this.items.length) {
        this.draft.item = this.items[0];
        await this.onItemSelected();
      }
    },
    async onItemSelected() {
      if (!this.draft.item) {
        return;
      }
      this.draft.jewelryItem = null;

      const fields = [
        'metalType',
        'purity',
        'weight',
        'carat',
        'makingCharges',
        'wastagePercentage',
        'diamondOrigin',
        'ratePerCarat',
        'gemAmount',
        'certificationAmount',
        'rate',
      ];
      let itemData: any;
      try {
        itemData = await fyo.db.get(ModelNameEnum.Item, this.draft.item, fields);
      } catch {
        itemData = await fyo.db.get(ModelNameEnum.Item, this.draft.item, [
          'metalType',
          'purity',
          'weight',
          'carat',
          'makingCharges',
          'rate',
        ]);
      }
      if (!itemData) {
        return;
      }

      const metalType = (itemData?.metalType as string | undefined) ?? undefined;
      const purity = (itemData?.purity as string | undefined) ?? undefined;
      let weight = getNumber(itemData?.weight);
      const carat = getNumber(itemData?.carat);
      const makingCharges = getNumber(itemData?.makingCharges);
      const wastagePercentage = getNumber(itemData?.wastagePercentage);
      const diamondOrigin = (itemData?.diamondOrigin as string | undefined) ?? undefined;
      const ratePerCarat = getNumber(itemData?.ratePerCarat);
      const gemAmount = getNumber(itemData?.gemAmount);
      const certificationAmount = getNumber(itemData?.certificationAmount);
      const itemRate = getNumber(itemData?.rate);

      if (metalType) {
        this.draft.metalType = metalType as any;
      }
      if (purity) {
        this.draft.purity = purity as any;
      }

      // Reset line fields so switching items always switches details
      this.draft.grossWeight = weight > 0 ? weight : null;
      this.draft.netWeight = weight > 0 ? weight : null;
      this.draft.carat = carat > 0 ? carat : null;
      this.draft.makingCharges = makingCharges > 0 ? makingCharges : null;
      this.draft.wastagePercentage = wastagePercentage > 0 ? wastagePercentage : null;
      this.draft.diamondOrigin = diamondOrigin ?? null;
      this.draft.gemAmount = gemAmount > 0 ? gemAmount : null;
      this.draft.certificationAmount =
        certificationAmount > 0 ? certificationAmount : null;
      this.draft.metalAmount = itemRate > 0 ? itemRate : null;
      this.draft.goldRate = null;
      this.draft.ratePerCarat = null;

      // We no longer auto-calculate jewellery cost from daily metal rates.
      // If you want default costing, store it on Item.rate (shown as Jewellery Cost above).

      if (this.draft.metalType === 'Diamond') {
        const latestDiamondRate = await getLatestDiamondRate(fyo);
        if (ratePerCarat > 0) {
          this.draft.ratePerCarat = ratePerCarat;
        } else if (latestDiamondRate !== undefined && latestDiamondRate > 0) {
          this.draft.ratePerCarat = latestDiamondRate;
        } else if (itemRate > 0) {
          // Fallback if you store per-carat rate on Item.rate
          this.draft.ratePerCarat = itemRate;
        }
      }

      // If only one piece is in stock for this item, auto-select it.
      const availablePieces = this.jewelryPieces.filter(
        (row) =>
          row.item === this.draft.item && (!row.status || row.status === 'In Stock')
      );
      if (availablePieces.length === 1) {
        this.draft.jewelryItem = availablePieces[0].name;
        await this.onJewelryItemSelected();
      }
    },
    pieceLabel(piece: JewelryPieceRow) {
      const parts = [];
      if (piece.barcode) parts.push(piece.barcode);
      if (piece.name) parts.push(piece.name);
      return parts.join(' - ');
    },
    async onJewelryItemSelected() {
      const name = this.draft.jewelryItem;
      if (!name) {
        return;
      }

      const piece = this.jewelryPieces.find((row) => row.name === name);
      if (!piece) {
        return;
      }

      if (piece.item) {
        this.draft.item = piece.item;
      }

      const metalType = piece.metalType;
      const purity = piece.purity;
      const weight =
        getNumber(piece.netWeight) ||
        getNumber(piece.weight) ||
        getNumber(piece.grossWeight);
      const gross = getNumber(piece.grossWeight) || weight;
      const net = getNumber(piece.netWeight) || weight;
      const carat = getNumber(piece.carat);
      const makingCharges = getNumber(piece.makingCharges);
      const wastagePercentage = getNumber(piece.wastagePercentage);
      const gemAmount = getNumber(piece.gemAmount);
      const certificationAmount = getNumber(piece.certificationAmount);
      const ratePerCarat = getNumber(piece.ratePerCarat);
      const saleRate = getNumber(piece.saleRate);

      if (metalType) this.draft.metalType = metalType as any;
      if (purity) this.draft.purity = purity as any;

      this.draft.grossWeight = gross > 0 ? gross : null;
      this.draft.netWeight = net > 0 ? net : null;
      this.draft.carat = carat > 0 ? carat : null;
      this.draft.makingCharges = makingCharges > 0 ? makingCharges : null;
      this.draft.wastagePercentage = wastagePercentage > 0 ? wastagePercentage : null;
      this.draft.gemAmount = gemAmount > 0 ? gemAmount : null;
      this.draft.certificationAmount =
        certificationAmount > 0 ? certificationAmount : null;
      this.draft.diamondOrigin = piece.diamondOrigin ?? this.draft.diamondOrigin;

      // Prefer piece-specific rates if provided.
      if (this.draft.metalType === 'Diamond') {
        if (ratePerCarat > 0) {
          this.draft.ratePerCarat = ratePerCarat;
        } else if (saleRate > 0) {
          this.draft.ratePerCarat = saleRate;
        }
      } else {
        if (saleRate > 0) {
          this.draft.metalAmount = saleRate;
        }
      }
    },
    async loadRecentInvoices() {
      this.recentInvoices = (await fyo.db.getAll(ModelNameEnum.JewelryInvoice, {
        fields: ['name', 'party', 'date', 'grandTotal'],
        orderBy: ['modified'],
        order: 'desc',
        limit: 25,
      })) as InvoiceRow[];
    },
    async createDraftInvoice() {
      if (!this.draft.party || !this.draft.item) {
        showToast({ type: 'warning', message: 'Select customer and item' });
        return;
      }

      const partyExists = await fyo.db.exists(ModelNameEnum.Party, this.draft.party);
      const itemExists = await fyo.db.exists(ModelNameEnum.Item, this.draft.item);
      if (!partyExists || !itemExists) {
        showToast({
          type: 'error',
          message: 'Selected customer/item not found. Please refresh options.',
        });
        await this.loadOptions();
        return;
      }

      const invoice = fyo.doc.getNewDoc(ModelNameEnum.JewelryInvoice, {
        party: this.draft.party,
        date: new Date(),
        invoiceType: this.draft.invoiceType,
        ...(this.draft.oldGoldExchangeAmount
          ? { oldGoldExchangeAmount: fyo.pesa(this.draft.oldGoldExchangeAmount) }
          : {}),
        ...(this.draft.discountAmount
          ? { discountAmount: fyo.pesa(this.draft.discountAmount) }
          : {}),
      });

      await invoice.append('items', {
        item: this.draft.item,
        ...(this.draft.jewelryItem ? { jewelryItem: this.draft.jewelryItem } : {}),
        metalType: this.draft.metalType,
        purity: this.draft.purity,
        ...(this.draft.invoiceType === 'GST Invoice' && this.draft.hsnCode
          ? { hsnCode: this.draft.hsnCode }
          : {}),
        ...(this.draft.grossWeight ? { grossWeight: this.draft.grossWeight } : {}),
        ...(this.draft.netWeight ? { netWeight: this.draft.netWeight } : {}),
        ...(this.draft.metalAmount
          ? { metalAmount: fyo.pesa(this.draft.metalAmount) }
          : {}),
        ...(this.draft.wastagePercentage
          ? { wastagePercentage: this.draft.wastagePercentage }
          : {}),
        ...(this.draft.makingCharges
          ? { makingCharges: fyo.pesa(this.draft.makingCharges) }
          : {}),
        ...(this.draft.gemAmount ? { gemAmount: fyo.pesa(this.draft.gemAmount) } : {}),
        ...(this.draft.certificationAmount
          ? { certificationAmount: fyo.pesa(this.draft.certificationAmount) }
          : {}),
        ...(this.draft.carat ? { carat: this.draft.carat } : {}),
        ...(this.draft.ratePerCarat
          ? { ratePerCarat: fyo.pesa(this.draft.ratePerCarat) }
          : {}),
        ...(this.draft.diamondOrigin
          ? { diamondOrigin: this.draft.diamondOrigin }
          : {}),
        ...(this.draft.invoiceType === 'GST Invoice' && this.draft.gstPercent
          ? { gstPercent: this.draft.gstPercent }
          : {}),
        ...(this.draft.invoiceType === 'GST Invoice' && this.draft.makingGstPercent
          ? { makingGstPercent: this.draft.makingGstPercent }
          : {}),
      });

      await invoice.sync();
      await this.loadRecentInvoices();
      await routeTo(`/edit/${ModelNameEnum.JewelryInvoice}/${invoice.name!}`);
    },
    async openInvoicesList() {
      await routeTo(`/list/${ModelNameEnum.JewelryInvoice}/Invoices`);
    },
    async openInvoice(name: string) {
      await routeTo(`/edit/${ModelNameEnum.JewelryInvoice}/${name}`);
    },
  },
});
</script>
