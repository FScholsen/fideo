<template>
  <div class="wrapper">
    <main class="main" role="main">
      <router-view />
    </main>
    <Sidebar />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Sidebar from '@/components/Sidebar/Sidebar.vue';

export default defineComponent({
  components: { Sidebar },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 100%;
}
.main {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  height: 100%;
}
</style>
