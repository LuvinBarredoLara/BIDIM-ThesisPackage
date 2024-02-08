export interface IPatientList {
  PatientId: string;
  FullName: string;
  Disease: string;
  ContactNumber: string;
  AdmissionDate: string;
  PatientGuid: string;
  RecordId: number;
}

export interface IPatientInfo {
  Id: string;
  PatientId: string;
  FirstName: string;
  LastName: string;
  DoB: string;
  Age: number;
  Sex: string;
  ContactNumber: string;
  HouseholdInfo: IHouseholdInfo;
  PatientRecord: IPatientRecord;
}

export interface IHouseholdInfo {
  Id: number;
  CityMun: string;
  Brgy: string;
  Zone: number;
  Long: number;
  Lat: number;
}

export interface IPatientRecord {
  Id: number;
  PatientGuid: string;
  StatusId: number;
  InfectiousDiseaseId: number;
  DateReported: string;
}

export interface IStatus {
  Id: number;
  Name: string;
}

export interface IPatientInfoParameters {
  PatientGuid: string;
  RecordId: number;
}

export interface IInfectiousDisease {
  Id: number;
  Name: string;
}
