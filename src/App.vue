<template>
  <div id="app">
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
  // max-height: 100%;
  // max-width: 100%;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}

#nav {
  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
