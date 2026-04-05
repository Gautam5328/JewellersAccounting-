<template>
  <div class="flex flex-col h-full">
    <PageHeader title="Metal Purchase">
      <Button type="primary" @click="save">Save</Button>
    </PageHeader>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="grid grid-cols-12 gap-4 p-4">
        <div class="col-span-8 rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-3">Purchase Details</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Date</p>
              <input v-model="draft.date" type="date" class="w-full px-2 py-1 border rounded bg-transparent" />
            </div>

            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Supplier</p>
              <AutoComplete
                :df="{
                  fieldtype: 'AutoComplete',
                  fieldname: 'supplier',
                  label: 'Supplier',
                  options: suppliers.map((name) => ({ label: name, value: name })),
                }"
                input-class="text-base py-0 h-8"
                class="w-full"
                :value="draft.supplier ?? ''"
                @change="(value) => (draft.supplier = value?.value ?? null)"
              />
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
                <option>18K</option>
                <option>22K</option>
                <option>24K</option>
              </select>
            </div>

            <div v-if="draft.metalType !== 'Diamond'">
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Weight (g)</p>
              <input
                v-model.number="draft.grams"
                type="number"
                min="0"
                step="0.001"
                placeholder="Metal grams"
                class="w-full px-2 py-1 border rounded bg-transparent"
              />
            </div>

            <div v-else>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Carats</p>
              <input
                v-model.number="draft.carats"
                type="number"
                min="0"
                step="0.001"
                placeholder="Carats"
                class="w-full px-2 py-1 border rounded bg-transparent"
              />
            </div>

            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Rate / Unit</p>
              <input
                v-model.number="draft.ratePerUnit"
                type="number"
                min="0"
                step="0.01"
                placeholder="₹ per unit"
                class="w-full px-2 py-1 border rounded bg-transparent"
              />
            </div>

            <div class="col-span-2">
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Remarks</p>
              <input
                v-model="draft.remarks"
                type="text"
                placeholder="Optional"
                class="w-full px-2 py-1 border rounded bg-transparent"
              />
            </div>
          </div>
        </div>

        <div class="col-span-4 rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-3">Summary</p>
          <p class="text-sm py-1">
            Quantity:
            <span class="font-semibold">{{ formatQty(computedQty) }}</span>
          </p>
          <p class="text-sm py-1">
            Amount:
            <span class="font-semibold">{{ formatCurrency(computedAmount) }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AutoComplete from 'src/components/Controls/AutoComplete.vue';
import Button from 'src/components/Button.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { ModelNameEnum } from 'models/types';
import { fyo } from 'src/initFyo';
import { showToast } from 'src/utils/interactive';
import { routeTo } from 'src/utils/ui';
import { defineComponent } from 'vue';

type MetalType = 'Gold' | 'Silver' | 'Diamond';

export default defineComponent({
  name: 'MetalPurchasePage',
  components: { PageHeader, Button, AutoComplete },
  data() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      suppliers: [] as string[],
      draft: {
        date: today,
        supplier: null as string | null,
        metalType: 'Gold' as MetalType,
        purity: '22K' as '18K' | '22K' | '24K',
        grams: null as number | null,
        carats: null as number | null,
        ratePerUnit: null as number | null,
        remarks: '',
      },
    };
  },
  computed: {
    computedQty(): number {
      return this.draft.metalType === 'Diamond'
        ? this.draft.carats ?? 0
        : this.draft.grams ?? 0;
    },
    computedAmount(): number {
      const rate = this.draft.ratePerUnit ?? 0;
      const qty = this.computedQty;
      return rate * qty;
    },
  },
  async activated() {
    const rows = await fyo.db.getAll(ModelNameEnum.Party, {
      fields: ['name'],
      filters: { role: ['in', ['Supplier', 'Both']] },
    });
    this.suppliers = rows.map((row) => row.name as string);
  },
  methods: {
    formatCurrency(value: number) {
      return fyo.format(value, 'Currency');
    },
    formatQty(value: number) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return '0.000';
      }
      return value.toFixed(3);
    },
    async save() {
      const qty = this.computedQty;
      const rate = this.draft.ratePerUnit ?? 0;
      if (qty <= 0 || rate <= 0) {
        showToast({ type: 'warning', message: 'Enter quantity and rate' });
        return;
      }

      const doc = fyo.doc.getNewDoc(ModelNameEnum.MetalPurchase, {
        date: new Date(this.draft.date),
        supplier: this.draft.supplier,
        metalType: this.draft.metalType,
        purity: this.draft.purity,
        ...(this.draft.metalType === 'Diamond'
          ? { carats: qty }
          : { grams: qty }),
        ratePerUnit: fyo.pesa(rate),
        ...(this.draft.remarks ? { remarks: this.draft.remarks } : {}),
      });

      await doc.sync();
      showToast({ type: 'success', message: 'Metal purchase recorded' });
      this.resetDraft();
      await routeTo('/list/MetalPurchase/Metal Purchases');
    },
    resetDraft() {
      const today = new Date().toISOString().slice(0, 10);
      this.draft = {
        date: today,
        supplier: null,
        metalType: 'Gold',
        purity: '22K',
        grams: null,
        carats: null,
        ratePerUnit: null,
        remarks: '',
      };
    },
  },
});
</script>
