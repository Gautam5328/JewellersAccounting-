<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
  >
    <div
      class="w-full max-w-sm rounded-lg border bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-890"
    >
      <p class="text-lg font-semibold">Enter PIN</p>
      <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
        This app is locked for this database.
      </p>

      <input
        v-model="pin"
        class="mt-4 w-full px-3 py-2 border rounded bg-transparent"
        type="password"
        inputmode="numeric"
        autocomplete="off"
        placeholder="PIN"
        @keydown.enter="unlock"
      />

      <p v-if="error" class="mt-2 text-xs text-red-600">{{ error }}</p>

      <div class="mt-4 flex justify-end gap-2">
        <button
          class="me-auto text-xs text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-25"
          @click="$emit('reset')"
        >
          Forgot PIN? Reset
        </button>
        <button
          class="px-3 py-2 text-sm rounded border dark:border-gray-800"
          @click="pin = ''"
        >
          Clear
        </button>
        <button
          class="px-3 py-2 text-sm rounded bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
          @click="unlock"
        >
          Unlock
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppLockOverlay',
  props: {
    expectedPin: { type: String, required: true },
  },
  emits: ['unlocked', 'reset'],
  data() {
    return {
      pin: '',
      error: '',
    };
  },
  methods: {
    unlock() {
      if (!this.expectedPin) {
        this.error = 'PIN is not set in Settings.';
        return;
      }

      if (String(this.pin).trim() === String(this.expectedPin).trim()) {
        this.error = '';
        this.$emit('unlocked');
        return;
      }

      this.error = 'Incorrect PIN';
    },
  },
});
</script>
