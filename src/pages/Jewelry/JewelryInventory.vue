<template>
  <div class="flex flex-col h-full">
    <PageHeader title="Inventory">
      <Button @click="openStockLedger">Stock Movements</Button>
      <Button type="primary" @click="createJewelryItem">New Piece</Button>
    </PageHeader>

    <div class="grid grid-cols-3 gap-4 px-4 py-3">
      <div class="rounded border p-3 dark:border-gray-800">
        <p class="text-xs text-gray-600 dark:text-gray-300">Total Pieces</p>
        <p class="text-xl font-semibold">{{ summary.totalPieces }}</p>
      </div>
      <div class="rounded border p-3 dark:border-gray-800">
        <p class="text-xs text-gray-600 dark:text-gray-300">Gold Stock (g)</p>
        <p class="text-xl font-semibold">{{ summary.goldStockGrams.toFixed(3) }}</p>
      </div>
      <div class="rounded border p-3 dark:border-gray-800">
        <p class="text-xs text-gray-600 dark:text-gray-300">
          Diamond Stock (ct)
        </p>
        <p class="text-xl font-semibold">
          {{ summary.diamondStockCarats.toFixed(3) }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 px-4 pb-3">
      <div class="rounded border p-3 dark:border-gray-800">
        <p class="text-xs text-gray-600 dark:text-gray-300">Jewelry Purchases (30 days)</p>
        <p class="text-xl font-semibold">{{ summary.jewelryPurchasesCount }}</p>
        <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
          {{ formatCurrency(summary.jewelryPurchasesAmount) }}
        </p>
      </div>
      <div class="rounded border p-3 dark:border-gray-800">
        <p class="text-xs text-gray-600 dark:text-gray-300">Metal Purchases (30 days)</p>
        <p class="text-xl font-semibold">{{ summary.metalPurchasesCount }}</p>
        <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
          {{ formatCurrency(summary.metalPurchasesAmount) }}
        </p>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-6">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-y dark:border-gray-800 text-left">
            <th class="py-2">ID</th>
            <th class="py-2">Barcode</th>
            <th class="py-2">Metal</th>
            <th class="py-2">Purity</th>
            <th class="py-2">Weight (g)</th>
            <th class="py-2">Carat</th>
            <th class="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.name"
            class="border-b dark:border-gray-800 cursor-pointer"
            @click="openJewelryItem(row.name)"
          >
            <td class="py-2">{{ row.name }}</td>
            <td class="py-2">{{ row.barcode }}</td>
            <td class="py-2">{{ row.metalType }}</td>
            <td class="py-2">{{ row.purity }}</td>
            <td class="py-2">{{ Number(row.weight ?? 0).toFixed(3) }}</td>
            <td class="py-2">{{ Number(row.carat ?? 0).toFixed(3) }}</td>
            <td class="py-2">{{ row.status }}</td>
          </tr>
          <tr v-if="rows.length === 0" class="border-b dark:border-gray-800">
            <td class="py-3 text-gray-600 dark:text-gray-300" colspan="7">
              No pieces found.
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between mt-6 mb-2">
        <p class="font-semibold">Metal Purchases</p>
        <Button @click="openMetalPurchases">View All</Button>
      </div>
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-y dark:border-gray-800 text-left">
            <th class="py-2">Date</th>
            <th class="py-2">Metal</th>
            <th class="py-2">Purity</th>
            <th class="py-2 text-right">Qty</th>
            <th class="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in metalPurchases"
            :key="row.name"
            class="border-b dark:border-gray-800 cursor-pointer"
            @click="openMetalPurchase(row.name)"
          >
            <td class="py-2">{{ formatDate(row.date) }}</td>
            <td class="py-2">{{ row.metalType }}</td>
            <td class="py-2">{{ row.purity }}</td>
            <td class="py-2 text-right">
              <span v-if="row.metalType === 'Diamond'">
                {{ Number(row.carats ?? 0).toFixed(3) }} ct
              </span>
              <span v-else>
                {{ Number(row.grams ?? 0).toFixed(3) }} g
              </span>
            </td>
            <td class="py-2 text-right">
              {{ formatCurrency(row.amount ?? row.totalCost) }}
            </td>
          </tr>
          <tr v-if="metalPurchases.length === 0" class="border-b dark:border-gray-800">
            <td class="py-3 text-gray-600 dark:text-gray-300" colspan="5">
              No metal purchases found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { ModelNameEnum } from 'models/types';
import { getNumber } from 'models/inventory/jewelryCalculations';
import Button from 'src/components/Button.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { fyo } from 'src/initFyo';
import { routeTo } from 'src/utils/ui';
import { defineComponent } from 'vue';

interface InventoryRow {
  name: string;
  barcode?: string;
  metalType?: string;
  purity?: string;
  weight?: number;
  carat?: number;
  status?: string;
}

interface MetalPurchaseRow {
  name: string;
  date?: string | Date;
  metalType?: string;
  purity?: string;
  grams?: unknown;
  carats?: unknown;
  amount?: unknown;
  totalCost?: unknown;
}

export default defineComponent({
  name: 'JewelryInventory',
  components: { PageHeader, Button },
  data() {
    return {
      rows: [] as InventoryRow[],
      metalPurchases: [] as MetalPurchaseRow[],
      summary: {
        totalPieces: 0,
        goldStockGrams: 0,
        diamondStockCarats: 0,
        jewelryPurchasesCount: 0,
        jewelryPurchasesAmount: 0,
        metalPurchasesCount: 0,
        metalPurchasesAmount: 0,
      },
    };
  },
  async activated() {
    await this.loadData();
  },
  methods: {
    formatCurrency(value: number) {
      return fyo.format(getNumber(value), 'Currency');
    },
    formatDate(value?: string | Date) {
      if (!value) return '';
      const parsed = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(parsed.valueOf())) return '';
      return parsed.toISOString().slice(0, 10);
    },
    async loadData() {
      this.rows = (await fyo.db.getAll(ModelNameEnum.JewelryItem, {
        fields: ['name', 'barcode', 'metalType', 'purity', 'weight', 'carat', 'status'],
        orderBy: ['modified'],
        order: 'desc',
        limit: 100,
      })) as InventoryRow[];

      this.summary.totalPieces = this.rows.length;
      this.summary.goldStockGrams = this.rows
        .filter((row) => row.metalType === 'Gold' || row.metalType === 'Silver')
        .reduce((sum, row) => sum + Number(row.weight ?? 0), 0);
      this.summary.diamondStockCarats = this.rows
        .filter((row) => row.metalType === 'Diamond')
        .reduce((sum, row) => sum + Number(row.carat ?? 0), 0);

      // Recent metal purchases list
      try {
        this.metalPurchases = (await fyo.db.getAll(ModelNameEnum.MetalPurchase, {
          fields: [
            'name',
            'date',
            'metalType',
            'purity',
            'grams',
            'carats',
            'amount',
            'totalCost',
          ],
          orderBy: ['date', 'modified'],
          order: 'desc',
          limit: 25,
        })) as MetalPurchaseRow[];
      } catch {
        this.metalPurchases = [];
      }

      // Purchases summary (last 30 days) from stock ledger IN entries.
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const ledger = (await fyo.db.getAll(ModelNameEnum.JewelryStockLedger, {
        fields: ['date', 'entryType', 'referenceType', 'referenceName', 'amount'],
        orderBy: ['date', 'modified'],
        order: 'desc',
        limit: 5000,
      })) as {
        date?: string | Date;
        entryType?: string;
        referenceType?: string;
        referenceName?: string;
        amount?: unknown;
      }[];

      const isRecent = (value?: string | Date) => {
        if (!value) return false;
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.valueOf())) return false;
        return d >= since;
      };

      const recentIn = ledger.filter(
        (row) => row.entryType === 'IN' && isRecent(row.date)
      );

      const jewelryIn = recentIn.filter(
        (row) => row.referenceType === ModelNameEnum.JewelryItem
      );
      const metalIn = recentIn.filter(
        (row) => row.referenceType === ModelNameEnum.MetalPurchase
      );

      this.summary.jewelryPurchasesCount = jewelryIn.length;
      this.summary.jewelryPurchasesAmount = jewelryIn.reduce(
        (sum, row) => sum + getNumber(row.amount),
        0
      );
      this.summary.metalPurchasesCount = metalIn.length;
      this.summary.metalPurchasesAmount = metalIn.reduce(
        (sum, row) => sum + getNumber(row.amount),
        0
      );
    },
    async createJewelryItem() {
      // Create and sync immediately so the user sees the final numeric ID
      // (instead of a draft name like "New Jewelry Item 01").
      const doc = fyo.doc.getNewDoc(ModelNameEnum.JewelryItem, {
        numberSeries: 'JWL-',
      });
      await doc.sync();
      await routeTo(`/edit/${ModelNameEnum.JewelryItem}/${doc.name!}`);
    },
    async openJewelryItem(name: string) {
      await routeTo(`/edit/${ModelNameEnum.JewelryItem}/${name}`);
    },
    async openStockLedger() {
      await routeTo('/list/JewelryStockLedger/Stock Movements');
    },
    async openMetalPurchases() {
      await routeTo('/list/MetalPurchase/Metal Purchases');
    },
    async openMetalPurchase(name: string) {
      await routeTo(`/edit/${ModelNameEnum.MetalPurchase}/${name}`);
    },
  },
});
</script>
