import { MutationTree } from 'vuex';
import { CallsState } from '@/store/modules/calls';
import { CallsMutationTypes } from '@/store/modules/calls/mutations/types';

export type CallsMutations<S = CallsState> = {
  [CallsMutationTypes.SET_REGISTRATION_STATUS](
    state: S,
    payload: boolean
  ): void;
};

export const mutations: MutationTree<CallsState> & CallsMutations = {
  [CallsMutationTypes.SET_REGISTRATION_STATUS](
    state: CallsState,
    payload: boolean
  ) {
    state.isRegistered = payload;
  },
};
