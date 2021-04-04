import { Module, Store, CommitOptions, DispatchOptions } from 'vuex';
import { RootState } from '@/store';
import { CallStatus } from '@/store/modules/calls/types';
import { actions, CallsActions } from '@/store/modules/calls/actions';
import { getters, CallsGetters } from '@/store/modules/calls/getters';
import { mutations, CallsMutations } from '@/store/modules/calls/mutations';

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
    K extends keyof CallsMutations,
    P extends Parameters<CallsMutations[K]>[1]
  >(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<CallsMutations[K]>;
} & {
  dispatch<K extends keyof CallsActions>(
    key: K,
    payload?: Parameters<CallsActions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<CallsActions[K]>;
} & {
  getters: {
    [K in keyof CallsGetters]: ReturnType<CallsGetters[K]>;
  };
};

// Calls store (module)
export const calls: Module<CallsState, RootState> = {
  // with namespaced true, dispatch and commit doesn't work, but getters and state work (and are namespaced correctly)
  // namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

/* TODO define type of useCallsStore */
// export default function useCallsStore(): Store<CallsState> {
//   return useStore(key);
// }
