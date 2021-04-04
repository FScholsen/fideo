import { ActionTree, ActionContext } from 'vuex';
import { RootState } from '@/store';
import { CallsState } from '@/store/modules/calls';
import { CallsMutations } from '@/store/modules/calls/mutations';
import { CallsMutationTypes } from '@/store/modules/calls/mutations/types';
import { CallsActionTypes } from '@/store/modules/calls/actions/types';

// Declare actions types
type AugmentedActionContext = {
  commit<K extends keyof CallsMutations>(
    key: K,
    payload?: Parameters<CallsMutations[K]>[1]
  ): ReturnType<CallsMutations[K]>;
} & Omit<ActionContext<CallsState, RootState>, 'commit'>;

export interface CallsActions {
  [CallsActionTypes.REGISTER]({ commit }: AugmentedActionContext): void;
  [CallsActionTypes.UNREGISTER]({ commit }: AugmentedActionContext): void;
  'calls/test'({ commit }: AugmentedActionContext): void;
}

export const actions: ActionTree<CallsState, RootState> & CallsActions = {
  [CallsActionTypes.REGISTER]({
    commit,
    dispatch,
  }: AugmentedActionContext): void {
    dispatch('calls/test');
    commit(CallsMutationTypes.SET_REGISTRATION_STATUS, true);
  },
  [CallsActionTypes.UNREGISTER]({ commit }: AugmentedActionContext): void {
    commit(CallsMutationTypes.SET_REGISTRATION_STATUS, false);
  },
  'calls/test'(): void {
    console.log('test');
  },
};
