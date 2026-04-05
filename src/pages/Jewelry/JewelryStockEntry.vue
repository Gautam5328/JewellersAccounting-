<template>
  <div class="flex flex-col h-full">
    <PageHeader title="Stock Entry">
      <Button @click="openStockLedger">Stock Movements</Button>
      <Button type="primary" @click="saveEntry">Save</Button>
    </PageHeader>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="grid grid-cols-12 gap-4 p-4">
        <div class="col-span-8 rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-3">Purchase / Adjustment</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Type</p>
              <select
                v-model="draft.entryType"
                class="w-full px-2 py-1 border rounded bg-transparent"
              >
                <option value="IN">Purchase (IN)</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>

            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Date</p>
              <input
                v-model="draft.date"
                class="w-full px-2 py-1 border rounded bg-transparent"
                type="date"
              />
            </div>

            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Metal Type</p>
              <select
                v-model="draft.metalType"
                class="w-full px-2 py-1 border rounded bg-transparent"
                @change="onMetalOrPurityChanged"
              >
                <option>Gold</option>
                <option>Silver</option>
                <option>Diamond</option>
              </select>
            </div>

            <div v-if="draft.metalType !== 'Diamond'">
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Purity</p>
              <select
                v-model="draft.purity"
                class="w-full px-2 py-1 border rounded bg-transparent"
                @change="onMetalOrPurityChanged"
              >
                <option>18K</option>
                <option>22K</option>
                <option>24K</option>
              </select>
            </div>

            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">
                Piece (optional)
              </p>
              <select
                v-model="draft.jewelryItem"
                class="w-full px-2 py-1 border rounded bg-transparent"
              >
                <option :value="null">Select Piece</option>
                <option v-for="piece in pieces" :key="piece" :value="piece">
                  {{ piece }}
                </option>
              </select>
            </div>

            <div v-if="draft.metalType !== 'Diamond'">
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Weight (g)</p>
              <input
                v-model.number="draft.weight"
                class="w-full px-2 py-1 border rounded bg-transparent"
                type="number"
                min="0"
                step="0.001"
                placeholder="Enter grams"
              />
            </div>

            <div v-else>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Carat</p>
              <input
                v-model.number="draft.carat"
                class="w-full px-2 py-1 border rounded bg-transparent"
                type="number"
                min="0"
                step="0.001"
                placeholder="Enter carats"
              />
            </div>

            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Rate (₹/unit)</p>
              <input
                v-model.number="draft.rate"
                class="w-full px-2 py-1 border rounded bg-transparent"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter purchase rate"
              />
            </div>

            <div class="col-span-2">
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Remarks</p>
              <input
                v-model="draft.remarks"
                class="w-full px-2 py-1 border rounded bg-transparent"
                type="text"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <div class="col-span-4 rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-3">Preview</p>
          <p class="text-sm py-1">
            Quantity:
            <span class="font-semibold">{{ preview.qty.toFixed(3) }}</span>
          </p>
          <p class="text-sm py-1">
            Amount:
            <span class="font-semibold">{{ formatCurrency(preview.amount) }}</span>
          </p>
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
import Button from 'src/components/Button.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { fyo } from 'src/initFyo';
import { showToast } from 'src/utils/interactive';
import { routeTo } from 'src/utils/ui';
import { defineComponent } from 'vue';

type NullableNumber = number | null;

export default defineComponent({
  name: 'JewelryStockEntry',
  components: { PageHeader, Button },
  data() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      pieces: [] as string[],
      draft: {
        entryType: 'IN' as 'IN' | 'ADJUSTMENT',
        date: today,
        metalType: 'Gold' as 'Gold' | 'Silver' | 'Diamond',
        purity: '22K' as '18K' | '22K' | '24K',
        jewelryItem: null as string | null,
        weight: null as NullableNumber,
        carat: null as NullableNumber,
        rate: null as NullableNumber,
        remarks: '' as string,
      },
    };
  },
  computed: {
    preview() {
      const rate = getNumber(this.draft.rate);
      const qty =
        this.draft.metalType === 'Diamond'
          ? getNumber(this.draft.carat)
          : getNumber(this.draft.weight);
      return {
        qty,
        amount: qty * rate,
      };
    },
  },
  async activated() {
    await this.loadPieces();
    await this.onMetalOrPurityChanged();
  },
  methods: {
    formatCurrency(value: unknown) {
      return fyo.format(getNumber(value), 'Currency');
    },
    async loadPieces() {
      const rows = await fyo.db.getAll(ModelNameEnum.JewelryItem, {
        fields: ['name'],
        orderBy: ['modified'],
        order: 'desc',
        limit: 200,
      });
      this.pieces = rows.map((r) => r.name as string);
    },
    async onMetalOrPurityChanged() {
      if (this.draft.rate && this.draft.rate > 0) {
        return;
      }

      if (this.draft.metalType === 'Diamond') {
        const latest = await getLatestDiamondPurchaseRate(fyo);
        if (latest !== undefined && latest > 0) {
          this.draft.rate = latest;
        }
        return;
      }

      const latest = await getLatestGoldPurchaseRate(fyo, this.draft.purity);
      if (latest !== undefined && latest > 0) {
        this.draft.rate = latest;
      }
    },
    async saveEntry() {
      const qty =
        this.draft.metalType === 'Diamond'
          ? getNumber(this.draft.carat)
          : getNumber(this.draft.weight);
      const rate = getNumber(this.draft.rate);

      if (!qty || qty <= 0 || !rate || rate <= 0) {
        showToast({ type: 'warning', message: 'Enter quantity and rate' });
        return;
      }

      const doc = fyo.doc.getNewDoc(ModelNameEnum.JewelryStockLedger, {
        date: new Date(this.draft.date),
        entryType: this.draft.entryType,
        metalType: this.draft.metalType,
        ...(this.draft.metalType !== 'Diamond' ? { purity: this.draft.purity } : {}),
        ...(this.draft.jewelryItem ? { jewelryItem: this.draft.jewelryItem } : {}),
        ...(this.draft.metalType === 'Diamond'
          ? { carat: qty }
          : { weight: qty }),
        rate: fyo.pesa(rate),
        referenceType: 'Manual',
        ...(this.draft.remarks ? { remarks: this.draft.remarks } : {}),
      });

      await doc.sync();
      showToast({ type: 'success', message: 'Stock entry saved' });

      this.draft.jewelryItem = null;
      this.draft.weight = null;
      this.draft.carat = null;
      this.draft.remarks = '';
    },
    async openStockLedger() {
      await routeTo('/list/JewelryStockLedger/Stock Movements');
    },
  },
});
</script>

