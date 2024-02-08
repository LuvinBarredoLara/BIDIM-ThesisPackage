import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import {
  IIndividualDropdownList,
  IIndividualList,
  IIndividualViewModel,
} from 'src/app/_viewModels/IndividualViewModel';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IndividualService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  GetList(): Observable<IJsonResponse<IIndividualList[]>> {
    let url: string = environment.API_URL + '/Individuals';
    return this.httpClientUtils.getJSON<IJsonResponse<IIndividualList[]>>(url);
  }

  GetDropdownList(): Observable<IJsonResponse<IIndividualDropdownList[]>> {
    let url: string = environment.API_URL + '/Individuals/DropdownList';
    return this.httpClientUtils.getJSON<
      IJsonResponse<IIndividualDropdownList[]>
    >(url);
  }

  GetIndividual(
    individualId: string
  ): Observable<IJsonResponse<IIndividualViewModel>> {
    let url: string = environment.API_URL + '/Individual/' + individualId;
    return this.httpClientUtils.getJSON<IJsonResponse<IIndividualViewModel>>(
      url
    );
  }

  Upsert(
    individual: IIndividualViewModel
  ): Observable<IJsonResponse<IIndividualViewModel>> {
    let url: string = environment.API_URL + '/Individual';
    return this.httpClientUtils.postJSON<IJsonResponse<IIndividualViewModel>>(
      url,
      individual
    );
  }
}
