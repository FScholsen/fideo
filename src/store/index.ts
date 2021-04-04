import { createLogger, createStore } from 'vuex';

import { calls, CallsStore, CallsState } from '@/store/modules/calls';
// import { InjectionKey } from '@vue/runtime-core';

export type RootState = {
  calls: CallsState;
};

export type RootStore = CallsStore<Pick<RootState, 'calls'>>;

export const store = createStore<RootState>({
  plugins: [createLogger()],
  devtools: true,
  modules: {
    calls,
  },
});

// export const key: InjectionKey<Store<RootState>> = Symbol();

// // TODO define type of useCallsStore
// export function useStore(): RootStore {
//   return baseUseStore(key);
// }

export function useStore(): RootStore {
  return store as RootStore;
}
