<template>
  <nav id="nav" class="navbar">
    <router-link to="/">Home</router-link> |
    <router-link to="/conference">About</router-link>
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
.navbar {
  display: flex;
  flex-direction: row;
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
