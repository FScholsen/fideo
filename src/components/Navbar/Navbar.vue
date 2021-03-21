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
}
</style>
