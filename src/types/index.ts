export interface Participant {
  hireDate: string;
  employeeId: string;
  name: string;
}

export interface Winner extends Participant {
  prizeLevel: number;
}

export type PrizeLevel = 1 | 2 | 3 | 4 | 5;

export interface LotteryState {
  participants: Participant[];
  winners: Winner[];
  currentPrizeLevel: PrizeLevel;
  winnersPerDraw: number;
  isSpinning: boolean;
}
