import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import StringHelper from 'src/app/_shared/helpers';
import { environment } from 'src/environments/environment';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { IInfectedFilter } from 'src/app/_viewModels/MappingViewModels';

@Injectable({
  providedIn: 'root',
})
export class MappingService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  LookupLocStr(locQuery: string): Observable<any> {
    let url = this.buildUrl(locQuery);
    return this.httpClientUtils.getJSON<any>(url);
  }

  GetCoordinates(
    infectedFilter: IInfectedFilter
  ): Observable<IJsonResponse<number[][]>> {
    let url = environment.API_URL + '/Mapping/Infected';
    return this.httpClientUtils.postJSON<IJsonResponse<number[][]>>(
      url,
      infectedFilter
    );
  }

  private buildUrl(lq: string): string {
    return (
      environment.NOMINATUM_URL +
      '/search?q=' +
      lq +
      '&format=geojson&addressdetails=0&limit=2'
    );
  }
}
