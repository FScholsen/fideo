import { createLogger, createStore } from 'vuex';
/* modules */
import { calls, CallsStore, CallsState } from '@/store/modules/calls';

export type RootState = {
  calls: CallsState;
};

export type RootStore = CallsStore<Pick<RootState, 'calls'>>;

const store = createStore<RootState>({
  plugins: [createLogger()],
  devtools: true,
  modules: {
    calls,
  },
});

export function useStore(): RootStore {
  return store as RootStore;
}

export default store;
