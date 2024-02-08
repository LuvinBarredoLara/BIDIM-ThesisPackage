export interface ICaseList {
  Guid: string;
  Id: string;
  CreatedDate: string;
  IndividualName: string;
  InfectiousDisease: string;
  Outcome: string;
  OutcomeDate: string;
}

export interface ICaseMonitoringViewModel {
  Id: number;
  Symptoms: string;
  Remarks: string;
  CreatedDate: string;
  CaseGuid: string;
  Status: string;
  IsActive: boolean;
  TempId: number;
}

export interface ICaseViewModel {
  Guid: string;
  Id: string;
  Outcome: string;
  OutcomeDate: Date;
  IndividualId: string;
  InfectiousDiseaseId: number;
  IsActive: boolean;
  CaseMonitorings: ICaseMonitoringViewModel[];
}

export interface ICaseMonitoringDialogueParams {
  cmList: ICaseMonitoringViewModel[];
  cmId: number;
  cmTempId: number;
  isUpdated: boolean;
}
