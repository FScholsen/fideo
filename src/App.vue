<template>
  <div class="app__wrapper">
    <Navbar />
    <Main />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from '@/components/Navbar/Navbar.vue';
import Main from '@/components/Main/Main.vue';

export default defineComponent({
  components: { Navbar, Main },
  setup() {
    return {};
  },
});
</script>

<style lang="scss">
@import '~@/styles/_base.scss';

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  width: 100%;
  height: 100%;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
}
.app__wrapper {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
