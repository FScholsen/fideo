<template>
  <div class="sidebar">
    <div>Status: {{ isRegistered ? `Registered` : `Unregistered` }}</div>

    <button @click="register">register</button>
    <button @click="unregister">unregister</button>

    <span>in call: {{ isInCall }}</span>

    ----------------------------

    <div class="container">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sapien
      arcu, ornare sit amet elit in, sodales lacinia quam. Suspendisse nec
      ligula a est ultricies euismod sit amet ac neque. Aliquam tempus arcu nec
      elit pharetra egestas. Mauris lacus dolor, accumsan eu erat eu, commodo
      elementum massa. Proin vehicula, risus non congue iaculis, purus nunc
      tristique magna, sit amet luctus odio tellus sit amet lectus. Aenean
      pellentesque tempor tellus, et auctor ligula bibendum a. In tempus libero
      ac dictum ullamcorper. Nunc dapibus molestie lacus ac ultricies. Donec vel
      dui euismod, bibendum justo a, pharetra urna. Curabitur eu eros ac elit
      sollicitudin convallis a vel est. Duis turpis eros, dictum non feugiat at,
      hendrerit in magna. Class aptent taciti sociosqu ad litora torquent per
      conubia nostra, per inceptos himenaeos. Sed dignissim pellentesque augue
      in posuere. Duis eros felis, sagittis sed rhoncus ut, porttitor vitae
      nunc. Duis lectus leo, venenatis in nunc vitae, tristique maximus urna.
      Curabitur non quam nec nunc tincidunt finibus quis quis tellus. Curabitur
      imperdiet convallis est. Vivamus lobortis diam eget mollis euismod.
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames
      ac turpis egestas. Vivamus nisi mauris, porttitor ac risus et, vulputate
      interdum lectus. Sed non ultricies ante. Vestibulum mattis venenatis
      mauris eget lacinia. Cras vel turpis pharetra, consequat justo et, tempor
      turpis. Nulla vestibulum, neque id iaculis sagittis, odio nibh egestas
      lorem, eget bibendum dui nisi a eros. Cras mattis et sem ac pulvinar. Sed
      ut purus at est venenatis sodales. Maecenas a velit sed nibh viverra
      tincidunt nec sit amet mauris. Nunc faucibus laoreet nulla, in eleifend
      felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
      convallis lectus a erat finibus, nec malesuada ipsum euismod. Vestibulum
      id orci ultricies, tempor nisi non, posuere nulla. Maecenas ullamcorper
      convallis consectetur. Ut erat nunc, posuere eget erat ut, viverra
      venenatis risus. Fusce dignissim, velit id venenatis sagittis, nunc nibh
      vulputate nulla, eget semper libero magna tincidunt tortor. Interdum et
      malesuada fames ac ante ipsum primis in faucibus. Aenean elementum
      elementum tempor. Pellentesque vel sapien nec sapien sollicitudin
      consectetur id ut augue. In congue felis a ex vestibulum varius. Curabitur
      fermentum metus a posuere aliquam. In luctus ante in risus vehicula
      pellentesque.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from '@/store';

export default defineComponent({
  setup() {
    const store = useStore();

    // computed store state values
    const isRegistered = computed(() => store.getters['calls/isRegistered']);
    const isInCall = computed(() => store.state.calls.isInCall);
    const callStatus = computed(
      () => store.getters['calls/getCurrentCallStatus']
    );
    const serverStatus = computed(() => store.state.calls.serverStatus);

    // store actions
    const register = () => store.dispatch('calls/register');
    const unregister = () => store.dispatch('calls/unregister');

    /* example using commit */
    // store mutations
    // const register = () => store.commit('calls/SET_REGISTRATION_STATUS', true);
    // const unregister = () =>
    //   store.commit('calls/SET_REGISTRATION_STATUS', false);

    return {
      isRegistered,
      isInCall,
      callStatus,
      serverStatus,
      register,
      unregister,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/styles/_breakpoints.scss';
@import '~@/styles/_variables.scss';

.sidebar {
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 0;
  width: auto;
  height: $sidebar-height;
  overflow: auto;

  background-color: #f1f1f1;
  transition: flex 0.15s ease-in-out;

  & .container {
    display: flex;
    flex-direction: column;
  }
}

@media screen and (min-width: $breakpoint-sm) {
  .sidebar {
    flex-basis: 200px;
  }
}
</style>
