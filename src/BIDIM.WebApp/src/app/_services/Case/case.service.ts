import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import { ICaseList, ICaseViewModel } from 'src/app/_viewModels/CaseViewModels';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CaseService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  GetList(): Observable<IJsonResponse<ICaseList[]>> {
    let url: string = environment.API_URL + '/Cases';
    return this.httpClientUtils.getJSON<IJsonResponse<ICaseList[]>>(url);
  }

  GetCaseInfo(caseId: string): Observable<IJsonResponse<ICaseViewModel>> {
    let url: string = environment.API_URL + '/Case/' + caseId;
    return this.httpClientUtils.getJSON<IJsonResponse<ICaseViewModel>>(url);
  }

  Upsert(caseModel: ICaseViewModel): Observable<IJsonResponse<ICaseViewModel>> {
    let url: string = environment.API_URL + '/Case';
    return this.httpClientUtils.postJSON<IJsonResponse<ICaseViewModel>>(
      url,
      caseModel
    );
  }
}
