<template>
  <div class="flex flex-col h-full">
    <PageHeader title="Reports" />

    <div class="grid grid-cols-3 gap-4 px-4 py-3">
      <div class="rounded border p-4 dark:border-gray-800">
        <p class="text-xs text-gray-600 dark:text-gray-300">Today Sales</p>
        <p class="text-lg font-semibold">{{ formatCurrency(todaySales) }}</p>
      </div>
      <div class="rounded border p-4 dark:border-gray-800">
        <p class="text-xs text-gray-600 dark:text-gray-300">Gold Stock (g)</p>
        <p class="text-lg font-semibold">{{ goldStock.toFixed(3) }}</p>
      </div>
      <div class="rounded border p-4 dark:border-gray-800">
        <p class="text-xs text-gray-600 dark:text-gray-300">Diamond Stock (ct)</p>
        <p class="text-lg font-semibold">{{ diamondStock.toFixed(3) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 px-4 pb-4">
      <div class="rounded border p-4 dark:border-gray-800">
        <p class="font-semibold mb-3">Sales Reports</p>
        <button class="w-full text-left py-2" @click="go('/jewelry/dashboard')">
          Jewelry Dashboard (Daily Sales + Margin)
        </button>
        <button class="w-full text-left py-2" @click="go('/list/JewelryInvoice')">
          Invoices
        </button>
      </div>

      <div class="rounded border p-4 dark:border-gray-800">
        <p class="font-semibold mb-3">Inventory Reports</p>
        <button class="w-full text-left py-2" @click="go('/jewelry/inventory')">
          Inventory Overview
        </button>
        <button class="w-full text-left py-2" @click="go('/list/MetalPurchase')">
          Metal Purchases
        </button>
        <button class="w-full text-left py-2" @click="go('/list/JewelryStockLedger')">
          Stock Movements
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 px-4 pb-4">
      <div class="rounded border p-4 dark:border-gray-800">
        <p class="font-semibold mb-3">Rates</p>
        <button class="w-full text-left py-2" @click="go('/list/GoldRate')">
          Gold Rates
        </button>
        <button class="w-full text-left py-2" @click="go('/list/DiamondRate')">
          Diamond Rates
        </button>
      </div>

      <div class="rounded border p-4 dark:border-gray-800">
        <p class="font-semibold mb-3">GST Reports</p>
        <button class="w-full text-left py-2" @click="go('/report/GSTR1')">
          GSTR1
        </button>
        <button class="w-full text-left py-2" @click="go('/report/GSTR2')">
          GSTR2
        </button>
        <button class="w-full text-left py-2" @click="go('/list/Tax')">
          Tax Templates
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ModelNameEnum } from 'models/types';
import { getNumber } from 'models/inventory/jewelryCalculations';
import PageHeader from 'src/components/PageHeader.vue';
import { fyo } from 'src/initFyo';
import { routeTo } from 'src/utils/ui';
import { defineComponent } from 'vue';

interface InvoiceRow {
  date?: string | Date;
  grandTotal?: unknown;
}

export default defineComponent({
  name: 'JewelryReports',
  components: { PageHeader },
  data() {
    return {
      todaySales: 0,
      goldStock: 0,
      diamondStock: 0,
    };
  },
  async activated() {
    await this.loadSummary();
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
    async loadSummary() {
      const invoices = (await fyo.db.getAll(ModelNameEnum.JewelryInvoice, {
        fields: ['date', 'grandTotal'],
      })) as InvoiceRow[];
      const items = await fyo.db.getAll(ModelNameEnum.JewelryItem, {
        fields: ['metalType', 'weight', 'carat'],
      });

      const today = new Date().toISOString().slice(0, 10);
      this.todaySales = invoices
        .filter((row) => this.normalizeDate(row.date) === today)
        .reduce((sum, row) => sum + getNumber(row.grandTotal), 0);
      this.goldStock = items
        .filter((row) => row.metalType !== 'Diamond')
        .reduce((sum, row) => sum + Number(row.weight ?? 0), 0);
      this.diamondStock = items
        .filter((row) => row.metalType === 'Diamond')
        .reduce((sum, row) => sum + Number(row.carat ?? 0), 0);
    },
    async go(path: string) {
      await routeTo(path);
    },
  },
});
</script>
