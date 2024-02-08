export interface IMappingDialogData {
  CityMun: string;
  Brgy: string;
  HouseholdCoordinate: number[];
}

export interface IInfectedFilter {
  DateFrom: string;
  DateTo: string;
  InfectiousDiseaseId: number;
}
