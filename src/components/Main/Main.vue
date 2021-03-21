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
@import '~@/styles/_variables.scss';

.wrapper {
  display: flex;
  flex-direction: row;
  flex: 0 1 100%;
  height: 100%;
  overflow: hidden;
}

.main {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  height: $main-height;
  overflow: auto;
}
</style>
