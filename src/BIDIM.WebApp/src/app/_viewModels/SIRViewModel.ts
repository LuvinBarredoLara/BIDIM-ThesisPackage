export interface ISIRData {
  Data: number[];
}

export interface IStatisticsData {
  SIRData: ISIRData[];
  SIRMonthProjections: string[];
  InfectionRate: number;
  RecoveryRate: number;
}
