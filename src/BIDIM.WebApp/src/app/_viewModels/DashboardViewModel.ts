export interface IYearCasesPerMonth {
  Key: number;
  Value: number[];
}

export interface IDashboardData {
  Population: number;
  Infected: number;
  Recovered: number;
  Deceased: number;
  YearlyCasesPerMonth: IYearCasesPerMonth[];
  MaleCasesCount: number;
  FemaleCasesCount: number;
  IndividualsByAge: number[][];
}
