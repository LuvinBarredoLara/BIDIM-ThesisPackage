import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import {
  IHouseholdDropdownList,
  IHouseholdList,
  IHouseholdViewModel,
} from 'src/app/_viewModels/HouseholdViewModel';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HouseholdService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  GetList(): Observable<IJsonResponse<IHouseholdList[]>> {
    let url: string = environment.API_URL + '/Households';
    return this.httpClientUtils.getJSON<IJsonResponse<IHouseholdList[]>>(url);
  }

  GetHousehold(
    householdId: number
  ): Observable<IJsonResponse<IHouseholdViewModel>> {
    let url: string = environment.API_URL + '/Household/' + householdId;
    return this.httpClientUtils.getJSON<IJsonResponse<IHouseholdViewModel>>(
      url
    );
  }

  Upsert(
    household: IHouseholdViewModel
  ): Observable<IJsonResponse<IHouseholdViewModel>> {
    let url: string = environment.API_URL + '/Household';
    return this.httpClientUtils.postJSON<IJsonResponse<IHouseholdViewModel>>(
      url,
      household
    );
  }

  GetDropdownList(): Observable<IJsonResponse<IHouseholdDropdownList[]>> {
    let url: string = environment.API_URL + '/Households/Dropdowns';
    return this.httpClientUtils.getJSON<
      IJsonResponse<IHouseholdDropdownList[]>
    >(url);
  }
}
