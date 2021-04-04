import { CallStatus } from '@/store/modules/calls/state/types';

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
  isInCall: false,
  currentCallStatus: {
    id: 0,
    name: 'idle',
  },
  serverStatus: 'online',
  clientVersion: '1.0.0',
};
