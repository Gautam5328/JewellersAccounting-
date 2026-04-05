<template>
  <div class="flex flex-col h-full">
    <PageHeader title="Expenses">
      <Button type="primary" @click="saveExpense">Add</Button>
    </PageHeader>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="grid grid-cols-12 gap-4 p-4">
        <div class="col-span-4 rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-3">New Expense</p>
          <div class="grid grid-cols-1 gap-3">
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Date</p>
              <input
                v-model="draft.date"
                type="date"
                class="w-full px-2 py-1 border rounded bg-transparent"
              />
            </div>
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Title</p>
              <input
                v-model="draft.title"
                type="text"
                placeholder="Expense title"
                class="w-full px-2 py-1 border rounded bg-transparent"
              />
            </div>
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">Amount</p>
              <input
                v-model.number="draft.amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                class="w-full px-2 py-1 border rounded bg-transparent"
              />
            </div>
          </div>
        </div>

        <div class="col-span-8 rounded border p-4 dark:border-gray-800">
          <p class="font-semibold mb-3">Recent</p>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left border-y dark:border-gray-800">
                <th class="py-2">Date</th>
                <th class="py-2">Title</th>
                <th class="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in recent"
                :key="row.name"
                class="border-b dark:border-gray-800"
              >
                <td class="py-2">{{ formatDate(row.date) }}</td>
                <td class="py-2">{{ row.title }}</td>
                <td class="py-2 text-right">{{ formatCurrency(row.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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

interface ExpenseRow {
  name: string;
  date?: string | Date;
  title?: string;
  amount?: unknown;
}

export default defineComponent({
  name: 'JewelryExpensesPage',
  components: { PageHeader, Button },
  data() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      draft: {
        date: today,
        title: '',
        amount: null as number | null,
      },
      recent: [] as ExpenseRow[],
    };
  },
  async activated() {
    await this.loadRecent();
  },
  methods: {
    formatCurrency(value: unknown) {
      return fyo.format(getNumber(value), 'Currency');
    },
    formatDate(value?: string | Date) {
      if (!value) return '';
      const parsed = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(parsed.valueOf())) return '';
      return parsed.toISOString().slice(0, 10);
    },
    async loadRecent() {
      this.recent = (await fyo.db.getAll(ModelNameEnum.JewelryExpense, {
        fields: ['name', 'date', 'title', 'amount'],
        orderBy: ['date', 'modified'],
        order: 'desc',
        limit: 30,
      })) as ExpenseRow[];
    },
    async saveExpense() {
      const title = this.draft.title.trim();
      const amount = this.draft.amount ?? 0;
      if (!title || amount <= 0) {
        showToast({ type: 'warning', message: 'Enter title and amount' });
        return;
      }

      const doc = fyo.doc.getNewDoc(ModelNameEnum.JewelryExpense, {
        date: new Date(this.draft.date),
        title,
        amount: fyo.pesa(amount),
      });
      await doc.sync();
      showToast({ type: 'success', message: 'Expense saved' });
      this.draft.title = '';
      this.draft.amount = null;
      await this.loadRecent();
    },
  },
});
</script>

