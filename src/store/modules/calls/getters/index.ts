import { GetterTree } from 'vuex';
import { RootState } from '@/store';
import { CallsState } from '@/store/modules/calls';
import { CallsGetterTypes } from '@/store/modules/calls/getters/types';

export type CallsGetters = {
  [CallsGetterTypes.isRegistered](state: CallsState): boolean;
  [CallsGetterTypes.getCurrentCallStatus](state: CallsState): string;
};

export const getters: GetterTree<CallsState, RootState> & CallsGetters = {
  [CallsGetterTypes.isRegistered]: (state): boolean => state.isRegistered,
  [CallsGetterTypes.getCurrentCallStatus]: (state): string => {
    return state.isInCall
      ? `${state.currentCallStatus.id} - ${state.currentCallStatus.name}`
      : `free`;
  },
};
