import { createLogger, createStore } from 'vuex';
import { calls, CallsStore, CallsState } from '@/store/modules/calls';

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

export function useStore(): RootStore {
  return store as RootStore;
}
