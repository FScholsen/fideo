import { Module, Store, CommitOptions, DispatchOptions } from 'vuex';
import { RootState } from '@/store';
import { CallStatus } from '@/store/modules/calls/types';
import { actions, CallsActions } from '@/store/modules/calls/actions';
import { getters, CallsGetters } from '@/store/modules/calls/getters';
import { mutations, CallsMutations } from '@/store/modules/calls/mutations';

type Namespaced<T, N extends string> = {
  [P in keyof T & string as `${N}/${P}`]: T[P];
};
type NamespacedMutations = Namespaced<CallsMutations, 'calls'>;

type NamespacedActions = Namespaced<CallsActions, 'calls'>;

type NamespacedGetters = Namespaced<CallsGetters, 'calls'>;

// Calls state type
export type CallsState = {
  isRegistered: boolean;
  isInCall: boolean;
  currentCallStatus: CallStatus;
  serverStatus: string;
  clientVersion: string;
};

// Calls state
export const state: CallsState = {
  isRegistered: false,
  isInCall: true,
  currentCallStatus: {
    id: 0,
    name: 'idle',
  },
  serverStatus: 'online',
  clientVersion: '1.0.0',
};

// Calls store type
export type CallsStore<S = CallsState> = Omit<
  Store<S>,
  'getters' | 'commit' | 'dispatch'
> & {
  commit<
    K extends keyof NamespacedMutations,
    P extends Parameters<NamespacedMutations[K]>[1]
  >(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<NamespacedMutations[K]>;
} & {
  dispatch<K extends keyof NamespacedActions>(
    key: K,
    payload?: Parameters<NamespacedActions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<NamespacedActions[K]>;
} & {
  getters: {
    [K in keyof NamespacedGetters]: ReturnType<NamespacedGetters[K]>;
  };
};

// Calls store (module)
export const calls: Module<CallsState, RootState> = {
  // with namespaced true, dispatch and commit doesn't work, but getters and state work (and are namespaced correctly)
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

/* TODO define type of useCallsStore */
// export default function useCallsStore(): Store<CallsState> {
//   return useStore(key);
// }
