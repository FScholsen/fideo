<template>
  <nav id="nav" class="navbar">
    <router-link to="/">Home</router-link> |
    <router-link to="/conference">Conference</router-link>
  </nav>
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
@import '~@/styles/_variables.scss';

.navbar {
  display: flex;
  flex-direction: row;
  flex: 0 0 $nav-height;
  // height: $nav-height;
  font-size: 1.25rem;
  background-color: #e1e1e1;

  & a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
