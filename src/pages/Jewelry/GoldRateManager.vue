<template>
  <div class="flex flex-col h-full">
    <PageHeader title="Rates">
      <Button type="primary" @click="saveRates">Save Daily Rates</Button>
    </PageHeader>

    <div class="grid grid-cols-2 gap-4 px-4 py-3">
      <div class="rounded border p-4 dark:border-gray-800">
        <p class="font-semibold mb-3">Gold Rates (₹ / g)</p>
        <div v-for="purity in ['18K', '22K', '24K']" :key="purity" class="mb-3">
          <label class="text-xs text-gray-600 dark:text-gray-300">{{ purity }}</label>
          <div class="grid grid-cols-2 gap-2 mt-1">
            <input
              v-model.number="goldRates[purity]"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Sell rate"
            />
            <input
              v-model.number="goldPurchaseRates[purity]"
              class="w-full px-2 py-1 border rounded bg-transparent"
              type="number"
              min="0"
              step="0.01"
              placeholder="Purchase rate"
            />
          </div>
        </div>
      </div>

      <div class="rounded border p-4 dark:border-gray-800">
        <p class="font-semibold mb-3">Diamond Rates (₹ / carat)</p>
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model.number="diamondRate"
            class="w-full px-2 py-1 border rounded bg-transparent"
            type="number"
            min="0"
            step="0.01"
            placeholder="Sell rate"
          />
          <input
            v-model.number="diamondPurchaseRate"
            class="w-full px-2 py-1 border rounded bg-transparent"
            type="number"
            min="0"
            step="0.01"
            placeholder="Purchase rate"
          />
        </div>
        <p class="font-semibold mb-3 mt-6">Recent Gold Rates</p>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b dark:border-gray-800">
              <th class="py-2">Date</th>
              <th class="py-2">Purity</th>
              <th class="py-2">Sell</th>
              <th class="py-2">Purchase</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in recentRates" :key="row.name" class="border-b dark:border-gray-800">
              <td class="py-2">{{ formatDate(row.date) }}</td>
              <td class="py-2">{{ row.purity }}</td>
              <td class="py-2">{{ formatCurrency(row.ratePerGram) }}</td>
              <td class="py-2">{{ formatCurrency(row.purchaseRatePerGram) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ModelNameEnum } from 'models/types';
import { getNumber } from 'models/inventory/jewelryCalculations';
import Button from 'src/components/Button.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { fyo } from 'src/initFyo';
import { showToast } from 'src/utils/interactive';
import { defineComponent } from 'vue';

interface GoldRateRow {
  name: string;
  date?: string | Date;
  purity: string;
  ratePerGram: unknown;
  purchaseRatePerGram?: unknown;
}

export default defineComponent({
  name: 'GoldRateManager',
  components: { PageHeader, Button },
  data() {
    return {
      goldRates: {
        '18K': null,
        '22K': null,
        '24K': null,
      } as Record<string, number | null>,
      goldPurchaseRates: {
        '18K': null,
        '22K': null,
        '24K': null,
      } as Record<string, number | null>,
      diamondRate: null as number | null,
      diamondPurchaseRate: null as number | null,
      recentRates: [] as GoldRateRow[],
    };
  },
  async activated() {
    await this.loadRates();
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
    getToday() {
      return new Date().toISOString().slice(0, 10);
    },
    async loadRates() {
      let rates: GoldRateRow[] = [];
      try {
        rates = (await fyo.db.getAll(ModelNameEnum.GoldRate, {
          fields: ['name', 'date', 'purity', 'ratePerGram', 'purchaseRatePerGram'],
          orderBy: ['date', 'modified'],
          order: 'desc',
          limit: 20,
        })) as GoldRateRow[];
      } catch {
        rates = (await fyo.db.getAll(ModelNameEnum.GoldRate, {
          fields: ['name', 'date', 'purity', 'ratePerGram'],
          orderBy: ['date', 'modified'],
          order: 'desc',
          limit: 20,
        })) as GoldRateRow[];
      }
      this.recentRates = rates;

      for (const purity of ['18K', '22K', '24K']) {
        const row = rates.find((rate) => rate.purity === purity);
        this.goldRates[purity] = row ? getNumber(row.ratePerGram) : null;
        this.goldPurchaseRates[purity] = row
          ? getNumber(row.purchaseRatePerGram)
          : null;
      }
    },
    async saveRates() {
      const date = this.getToday();
      for (const purity of Object.keys(this.goldRates)) {
        const rate = this.goldRates[purity];
        const purchaseRate = this.goldPurchaseRates[purity];
        if ((!rate || rate <= 0) && (!purchaseRate || purchaseRate <= 0)) {
          continue;
        }

        await fyo.doc
          .getNewDoc(ModelNameEnum.GoldRate, {
            date,
            purity,
            ...(rate && rate > 0 ? { ratePerGram: fyo.pesa(rate) } : {}),
            ...(purchaseRate && purchaseRate > 0
              ? { purchaseRatePerGram: fyo.pesa(purchaseRate) }
              : {}),
            isActive: true,
          })
          .sync()
          .catch(async (error: unknown) => {
            const message = String((error as any)?.message ?? error);
            if (!message.includes('purchaseRatePerGram')) {
              throw error;
            }

            // Backward compatible with older DBs missing the new column.
            await fyo.doc
              .getNewDoc(ModelNameEnum.GoldRate, {
                date,
                purity,
                ...(rate && rate > 0 ? { ratePerGram: fyo.pesa(rate) } : {}),
                isActive: true,
              })
              .sync();
          });
      }

      if (
        (this.diamondRate && this.diamondRate > 0) ||
        (this.diamondPurchaseRate && this.diamondPurchaseRate > 0)
      ) {
        await fyo.doc
          .getNewDoc(ModelNameEnum.DiamondRate, {
            date,
            ...(this.diamondRate && this.diamondRate > 0
              ? { ratePerCarat: fyo.pesa(this.diamondRate) }
              : {}),
            ...(this.diamondPurchaseRate && this.diamondPurchaseRate > 0
              ? { purchaseRatePerCarat: fyo.pesa(this.diamondPurchaseRate) }
              : {}),
            isActive: true,
          })
          .sync()
          .catch(async (error: unknown) => {
            const message = String((error as any)?.message ?? error);
            if (!message.includes('purchaseRatePerCarat')) {
              throw error;
            }

            // Backward compatible with older DBs missing the new column.
            await fyo.doc
              .getNewDoc(ModelNameEnum.DiamondRate, {
                date,
                ...(this.diamondRate && this.diamondRate > 0
                  ? { ratePerCarat: fyo.pesa(this.diamondRate) }
                  : {}),
                isActive: true,
              })
              .sync();
          });
      }

      await this.loadRates();
      showToast({ message: 'Daily rates saved' });
    },
  },
});
</script>
