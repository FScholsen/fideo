<template>
  <div class="sidebar">
    <div>Sidebar</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  flex: 0 0 232px;
}
</style>
