export interface Participant {
  entryDate: string;  // YYYY-MM-DD
  employeeId: string;
  name: string;
  _ineligibleForTopPrizes?: boolean;
}

export type PrizeTier = '1' | '2' | '3' | '4' | '5';
export type WinnerCount = '1' | '2' | '3' | '4';

export interface Winner extends Participant {
  prizeTier: PrizeTier;
  drawTime: string;
}
