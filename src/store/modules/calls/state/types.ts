/**
 * 0 = idle
 * 1 = incoming call pending
 * 2 = outgoing call pending
 * 3 = in call
 */
export type ValidCallStatusId = 0 | 1 | 2 | 3;

export type ValidCallStatusName =
  | 'idle'
  | 'incoming call pending'
  | 'outgoing call pending'
  | 'in call';

export type CallStatus = {
  id: ValidCallStatusId;
  name: ValidCallStatusName;
};
