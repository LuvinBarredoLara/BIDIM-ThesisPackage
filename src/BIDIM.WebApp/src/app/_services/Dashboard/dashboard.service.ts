import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import { IDashboardData } from 'src/app/_viewModels/DashboardViewModel';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  LoadDashboardData(
    diseaseId: number
  ): Observable<IJsonResponse<IDashboardData>> {
    let url: string =
      environment.API_URL + '/Dashboard/Data?diseaseId=' + diseaseId;
    return this.httpClientUtils.getJSON<IJsonResponse<IDashboardData>>(url);
  }
}
