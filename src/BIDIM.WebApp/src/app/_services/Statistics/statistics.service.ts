import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { ISIRData, IStatisticsData } from 'src/app/_viewModels/SIRViewModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  GetSIRDataByFilter(
    diseaseId: number
  ): Observable<IJsonResponse<IStatisticsData>> {
    let url: string = environment.API_URL + '/Statistics/SIRData/' + diseaseId;
    return this.httpClientUtils.getJSON<IJsonResponse<IStatisticsData>>(url);
  }
}
