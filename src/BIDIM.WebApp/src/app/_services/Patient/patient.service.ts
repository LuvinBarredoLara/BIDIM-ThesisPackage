import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import {
  IPatientInfo,
  IPatientList,
} from 'src/app/_viewModels/PatientViewModels';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  GetList(): Observable<IJsonResponse<IPatientList[]>> {
    let url: string = environment.API_URL + '/Patients';
    return this.httpClientUtils.getJSON<IJsonResponse<IPatientList[]>>(url);
  }

  GetPatient(
    patientGuid: string,
    recordId: number
  ): Observable<IJsonResponse<IPatientInfo>> {
    let url: string =
      environment.API_URL + '/Patient/' + patientGuid + '/' + recordId;
    return this.httpClientUtils.getJSON<IJsonResponse<IPatientInfo>>(url);
  }

  UpsertPatient(
    patientInfo: IPatientInfo
  ): Observable<IJsonResponse<IPatientInfo>> {
    let url: string = environment.API_URL + '/Patient';
    return this.httpClientUtils.postJSON<IJsonResponse<IPatientInfo>>(
      url,
      patientInfo
    );
  }

  CreatePatient(
    patientInfo: IPatientInfo
  ): Observable<IJsonResponse<IPatientInfo>> {
    let url: string = environment.API_URL + '/Patient';
    return this.httpClientUtils.postJSON<IJsonResponse<IPatientInfo>>(
      url,
      patientInfo
    );
  }

  UpdatePatient(
    patientInfo: IPatientInfo
  ): Observable<IJsonResponse<IPatientInfo>> {
    let url: string = environment.API_URL + '/Patient';
    return this.httpClientUtils.postJSON<IJsonResponse<IPatientInfo>>(
      url,
      patientInfo
    );
  }

  DeletePatient(patientGuid: string): Observable<IJsonResponse<boolean>> {
    let url: string = environment.API_URL + '/Patient/Delete/' + patientGuid;
    return this.httpClientUtils.postJSON<IJsonResponse<boolean>>(url);
  }
}
