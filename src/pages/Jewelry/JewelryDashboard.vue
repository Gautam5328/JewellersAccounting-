<template>
  <div class="flex flex-col h-full">
    <PageHeader title="Dashboard" />

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="grid grid-cols-4 gap-4 px-4 py-3">
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Daily Sales</p>
          <p class="text-xl font-semibold">{{ formatCurrency(kpis.dailySales) }}</p>
        </div>
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Gold Stock (g)</p>
          <p class="text-xl font-semibold">{{ kpis.goldStock.toFixed(3) }}</p>
        </div>
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Diamond Stock (ct)</p>
          <p class="text-xl font-semibold">{{ kpis.diamondStock.toFixed(3) }}</p>
        </div>
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Avg Profit / Invoice</p>
          <p class="text-xl font-semibold">{{ formatCurrency(kpis.avgProfit) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 px-4 pb-3">
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Gold Purchased (g)</p>
          <p class="text-xl font-semibold">{{ kpis.goldPurchased.toFixed(3) }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {{ formatCurrency(kpis.goldPurchasedAmount) }}
          </p>
        </div>
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Gold Sold (g)</p>
          <p class="text-xl font-semibold">{{ kpis.goldSold.toFixed(3) }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {{ formatCurrency(kpis.goldSoldAmount) }}
          </p>
        </div>
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Gold Balance (g)</p>
          <p class="text-xl font-semibold">{{ kpis.goldBalance.toFixed(3) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 px-4 pb-4">
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Diamond Purchased (ct)</p>
          <p class="text-xl font-semibold">{{ kpis.diamondPurchased.toFixed(3) }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {{ formatCurrency(kpis.diamondPurchasedAmount) }}
          </p>
        </div>
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Diamond Sold (ct)</p>
          <p class="text-xl font-semibold">{{ kpis.diamondSold.toFixed(3) }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {{ formatCurrency(kpis.diamondSoldAmount) }}
          </p>
        </div>
        <div class="rounded border p-3 dark:border-gray-800">
          <p class="text-xs text-gray-600 dark:text-gray-300">Diamond Balance (ct)</p>
          <p class="text-xl font-semibold">{{ kpis.diamondBalance.toFixed(3) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 px-4 pb-4">
        <div class="rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-2">Sales Trend (7 Days)</p>
          <LineChart
            v-if="salesPoints.length > 0 && salesLabels.length > 0"
            :points="[salesPoints]"
            :x-labels="salesLabels"
            :colors="[chartColor]"
            :aspect-ratio="2.8"
            :show-tooltip="true"
            :draw-axis="false"
            :format="(v: number) => formatCurrency(v)"
          />
        </div>

        <div class="rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-2">Inventory Mix</p>
          <DonutChart
            :sectors="inventorySectors"
            :value-formatter="(v: number) => String(v.toFixed(3))"
            total-label="Total Stock"
            :active="null"
            :dark-mode="darkMode"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 px-4 pb-4">
        <div class="rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-2">Monthly Gold (g)</p>
          <BarChart
            v-if="monthlyLabels.length > 0"
            :points="[monthlyGoldIn, monthlyGoldOut]"
            :x-labels="monthlyLabels"
            :colors="[
              { positive: barInColor, negative: barInColor },
              { positive: barOutColor, negative: barOutColor },
            ]"
            :aspect-ratio="2.8"
            :draw-axis="false"
            :format="(v: number) => String(v.toFixed(3))"
            :skip-x-label="2"
          />
          <div class="flex gap-4 text-xs text-gray-600 dark:text-gray-300 mt-2">
            <span>Green: Purchase (IN)</span>
            <span>Red: Sale (OUT)</span>
          </div>
        </div>

        <div class="rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-2">Monthly Diamond (ct)</p>
          <BarChart
            v-if="monthlyLabels.length > 0"
            :points="[monthlyDiamondIn, monthlyDiamondOut]"
            :x-labels="monthlyLabels"
            :colors="[
              { positive: barInColor, negative: barInColor },
              { positive: barOutColor, negative: barOutColor },
            ]"
            :aspect-ratio="2.8"
            :draw-axis="false"
            :format="(v: number) => String(v.toFixed(3))"
            :skip-x-label="2"
          />
          <div class="flex gap-4 text-xs text-gray-600 dark:text-gray-300 mt-2">
            <span>Green: Purchase (IN)</span>
            <span>Red: Sale (OUT)</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 px-4 pb-4">
        <div class="rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-2">Monthly Gold (₹)</p>
          <BarChart
            v-if="monthlyLabels.length > 0"
            :points="[monthlyGoldInAmount, monthlyGoldOutAmount]"
            :x-labels="monthlyLabels"
            :colors="[
              { positive: barInColor, negative: barInColor },
              { positive: barOutColor, negative: barOutColor },
            ]"
            :aspect-ratio="2.8"
            :draw-axis="false"
            :format="(v: number) => formatCurrency(v)"
            :skip-x-label="2"
          />
        </div>

        <div class="rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-2">Monthly Diamond (₹)</p>
          <BarChart
            v-if="monthlyLabels.length > 0"
            :points="[monthlyDiamondInAmount, monthlyDiamondOutAmount]"
            :x-labels="monthlyLabels"
            :colors="[
              { positive: barInColor, negative: barInColor },
              { positive: barOutColor, negative: barOutColor },
            ]"
            :aspect-ratio="2.8"
            :draw-axis="false"
            :format="(v: number) => formatCurrency(v)"
            :skip-x-label="2"
          />
        </div>
      </div>

      <div class="px-4 pb-4">
        <div class="rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-2">Today</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300">Gold Sold (g)</p>
              <p class="font-semibold">{{ today.goldSold.toFixed(3) }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-300 mt-2">
                Avg Sale Rate (₹/g)
              </p>
              <p class="font-semibold">{{ formatCurrency(today.goldAvgSaleRate) }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-300 mt-2">
                Latest Purchase Rate (22K)
              </p>
              <p class="font-semibold">{{ formatCurrency(today.goldPurchaseRate) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300">Diamond Sold (ct)</p>
              <p class="font-semibold">{{ today.diamondSold.toFixed(3) }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-300 mt-2">
                Avg Sale Rate (₹/ct)
              </p>
              <p class="font-semibold">{{ formatCurrency(today.diamondAvgSaleRate) }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-300 mt-2">
                Latest Purchase Rate
              </p>
              <p class="font-semibold">{{ formatCurrency(today.diamondPurchaseRate) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ModelNameEnum } from 'models/types';
import {
  getLatestDiamondPurchaseRate,
  getLatestGoldPurchaseRate,
  getNumber,
} from 'models/inventory/jewelryCalculations';
import BarChart from 'src/components/Charts/BarChart.vue';
import DonutChart from 'src/components/Charts/DonutChart.vue';
import LineChart from 'src/components/Charts/LineChart.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { fyo } from 'src/initFyo';
import { uicolors } from 'src/utils/colors';
import { defineComponent } from 'vue';

const uiColor = (family: string, shade: string, fallback: string) =>
  (uicolors as any)?.[family]?.[shade] ?? fallback;

interface InvoiceRow {
  date?: string | Date;
  grandTotal?: unknown;
  profitAmount?: unknown;
}

interface JewelryItemRow {
  metalType?: string;
  weight?: number;
  carat?: number;
  status?: string;
}

export default defineComponent({
  name: 'JewelryDashboard',
  components: { PageHeader, LineChart, DonutChart, BarChart },
  props: {
    darkMode: { type: Boolean, default: false },
  },
  data() {
    return {
      chartColor: uiColor('blue', '500', '#33A1FF'),
      barInColor: uiColor('green', '500', '#30A66D'),
      barOutColor: uiColor('red', '500', '#E03636'),
      salesLabels: [] as string[],
      salesPoints: [] as number[],
      monthlyLabels: [] as string[],
      monthlyGoldIn: [] as number[],
      monthlyGoldOut: [] as number[],
      monthlyDiamondIn: [] as number[],
      monthlyDiamondOut: [] as number[],
      monthlyGoldInAmount: [] as number[],
      monthlyGoldOutAmount: [] as number[],
      monthlyDiamondInAmount: [] as number[],
      monthlyDiamondOutAmount: [] as number[],
      today: {
        goldSold: 0,
        diamondSold: 0,
        goldAvgSaleRate: 0,
        diamondAvgSaleRate: 0,
        goldPurchaseRate: 0,
        diamondPurchaseRate: 0,
      },
      kpis: {
        dailySales: 0,
        goldStock: 0,
        diamondStock: 0,
        avgProfit: 0,
        goldPurchased: 0,
        goldSold: 0,
        goldBalance: 0,
        goldPurchasedAmount: 0,
        goldSoldAmount: 0,
        diamondPurchased: 0,
        diamondSold: 0,
        diamondBalance: 0,
        diamondPurchasedAmount: 0,
        diamondSoldAmount: 0,
      },
      inventorySectors: [] as {
        label: string;
        value: number;
        color: { color: string; darkColor: string };
      }[],
    };
  },
  async activated() {
    await this.loadDashboardData();
  },
  methods: {
    formatCurrency(value: number) {
      return fyo.format(getNumber(value ?? 0), 'Currency');
    },
    normalizeDate(value?: string | Date) {
      if (!value) {
        return '';
      }

      const parsed = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(parsed.valueOf())) {
        return '';
      }

      return parsed.toISOString().slice(0, 10);
    },
    async loadDashboardData() {
      const invoices = (await fyo.db.getAll(ModelNameEnum.JewelryInvoice, {
        fields: ['date', 'grandTotal', 'profitAmount'],
        orderBy: ['date'],
        order: 'asc',
      })) as InvoiceRow[];

      const items = (await fyo.db.getAll(ModelNameEnum.JewelryItem, {
        fields: ['metalType', 'weight', 'carat', 'status'],
      })) as JewelryItemRow[];

      const ledger = (await fyo.db.getAll(ModelNameEnum.JewelryStockLedger, {
        fields: ['date', 'entryType', 'metalType', 'weight', 'carat', 'amount'],
        orderBy: ['date', 'modified'],
        order: 'desc',
        limit: 2000,
      })) as {
        date?: string | Date;
        entryType?: string;
        metalType?: string;
        weight?: unknown;
        carat?: unknown;
        amount?: unknown;
      }[];

      const last7Days = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date.toISOString().slice(0, 10);
      });

      this.salesLabels = last7Days;
      this.salesPoints = last7Days.map((day) =>
        invoices
          .filter((row) => this.normalizeDate(row.date) === day)
          .reduce((sum, row) => sum + getNumber(row.grandTotal), 0)
      );

      const today = last7Days[last7Days.length - 1];
      this.kpis.dailySales = invoices
        .filter((row) => this.normalizeDate(row.date) === today)
        .reduce((sum, row) => sum + getNumber(row.grandTotal), 0);
      this.kpis.avgProfit =
        invoices.length > 0
          ? invoices.reduce((sum, row) => sum + getNumber(row.profitAmount), 0) /
            invoices.length
          : 0;
      this.kpis.goldStock = items
        .filter((row) => row.status === 'In Stock' && row.metalType !== 'Diamond')
        .reduce((sum, row) => sum + Number(row.weight ?? 0), 0);
      this.kpis.diamondStock = items
        .filter((row) => row.status === 'In Stock' && row.metalType === 'Diamond')
        .reduce((sum, row) => sum + Number(row.carat ?? 0), 0);

      this.inventorySectors = [
        {
          label: 'Gold/Silver (g)',
          value: this.kpis.goldStock,
          color: {
            color: uiColor('yellow', '400', '#EAB308'),
            darkColor: uiColor('yellow', '500', '#D1930D'),
          },
        },
        {
          label: 'Diamond (ct)',
          value: this.kpis.diamondStock,
          color: {
            color: uiColor('blue', '400', '#70B6F0'),
            darkColor: uiColor('blue', '500', '#33A1FF'),
          },
        },
      ];

      const months = Array.from({ length: 12 }).map((_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - index));
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      });
      this.monthlyLabels = months.map((m) => m);
      const monthIndex = new Map(months.map((m, idx) => [m, idx]));
      this.monthlyGoldIn = Array(months.length).fill(0);
      this.monthlyGoldOut = Array(months.length).fill(0);
      this.monthlyDiamondIn = Array(months.length).fill(0);
      this.monthlyDiamondOut = Array(months.length).fill(0);
      this.monthlyGoldInAmount = Array(months.length).fill(0);
      this.monthlyGoldOutAmount = Array(months.length).fill(0);
      this.monthlyDiamondInAmount = Array(months.length).fill(0);
      this.monthlyDiamondOutAmount = Array(months.length).fill(0);

      for (const row of ledger) {
        const day = this.normalizeDate(row.date);
        if (!day) {
          continue;
        }
        const monthKey = day.slice(0, 7);
        const idx = monthIndex.get(monthKey);
        if (idx === undefined) {
          continue;
        }

        const entryType = row.entryType;
        const metalType = row.metalType;
        const weight = getNumber(row.weight);
        const carat = getNumber(row.carat);
        const amount = getNumber(row.amount);

        const isIn = entryType === 'IN';
        const isOut = entryType === 'OUT';

        if (metalType === 'Diamond') {
          if (isIn) this.monthlyDiamondIn[idx] += carat;
          if (isOut) this.monthlyDiamondOut[idx] += carat;
          if (isIn) this.monthlyDiamondInAmount[idx] += amount;
          if (isOut) this.monthlyDiamondOutAmount[idx] += amount;
        } else {
          if (isIn) this.monthlyGoldIn[idx] += weight;
          if (isOut) this.monthlyGoldOut[idx] += weight;
          if (isIn) this.monthlyGoldInAmount[idx] += amount;
          if (isOut) this.monthlyGoldOutAmount[idx] += amount;
        }
      }

      const goldPurchased = ledger
        .filter((row) => row.entryType === 'IN' && row.metalType !== 'Diamond')
        .reduce((sum, row) => sum + getNumber(row.weight), 0);
      const goldSold = ledger
        .filter((row) => row.entryType === 'OUT' && row.metalType !== 'Diamond')
        .reduce((sum, row) => sum + getNumber(row.weight), 0);
      const diamondPurchased = ledger
        .filter((row) => row.entryType === 'IN' && row.metalType === 'Diamond')
        .reduce((sum, row) => sum + getNumber(row.carat), 0);
      const diamondSold = ledger
        .filter((row) => row.entryType === 'OUT' && row.metalType === 'Diamond')
        .reduce((sum, row) => sum + getNumber(row.carat), 0);

      this.kpis.goldPurchased = goldPurchased;
      this.kpis.goldSold = goldSold;
      this.kpis.goldBalance = goldPurchased - goldSold;
      this.kpis.goldPurchasedAmount = ledger
        .filter((row) => row.entryType === 'IN' && row.metalType !== 'Diamond')
        .reduce((sum, row) => sum + getNumber(row.amount), 0);
      this.kpis.goldSoldAmount = ledger
        .filter((row) => row.entryType === 'OUT' && row.metalType !== 'Diamond')
        .reduce((sum, row) => sum + getNumber(row.amount), 0);

      this.kpis.diamondPurchased = diamondPurchased;
      this.kpis.diamondSold = diamondSold;
      this.kpis.diamondBalance = diamondPurchased - diamondSold;
      this.kpis.diamondPurchasedAmount = ledger
        .filter((row) => row.entryType === 'IN' && row.metalType === 'Diamond')
        .reduce((sum, row) => sum + getNumber(row.amount), 0);
      this.kpis.diamondSoldAmount = ledger
        .filter((row) => row.entryType === 'OUT' && row.metalType === 'Diamond')
        .reduce((sum, row) => sum + getNumber(row.amount), 0);

      const todayKey = new Date().toISOString().slice(0, 10);
      const todayGoldOut = ledger
        .filter(
          (row) =>
            row.entryType === 'OUT' &&
            row.metalType !== 'Diamond' &&
            this.normalizeDate(row.date) === todayKey
        )
        .reduce(
          (acc, row) => ({
            qty: acc.qty + getNumber(row.weight),
            amount: acc.amount + getNumber(row.amount),
          }),
          { qty: 0, amount: 0 }
        );
      const todayDiamondOut = ledger
        .filter(
          (row) =>
            row.entryType === 'OUT' &&
            row.metalType === 'Diamond' &&
            this.normalizeDate(row.date) === todayKey
        )
        .reduce(
          (acc, row) => ({
            qty: acc.qty + getNumber(row.carat),
            amount: acc.amount + getNumber(row.amount),
          }),
          { qty: 0, amount: 0 }
        );

      this.today.goldSold = todayGoldOut.qty;
      this.today.diamondSold = todayDiamondOut.qty;
      this.today.goldAvgSaleRate =
        todayGoldOut.qty > 0 ? todayGoldOut.amount / todayGoldOut.qty : 0;
      this.today.diamondAvgSaleRate =
        todayDiamondOut.qty > 0 ? todayDiamondOut.amount / todayDiamondOut.qty : 0;

      this.today.goldPurchaseRate = (await getLatestGoldPurchaseRate(fyo, '22K')) ?? 0;
      this.today.diamondPurchaseRate = (await getLatestDiamondPurchaseRate(fyo)) ?? 0;
    },
  },
});
</script>
