import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { IInfectiousDisease } from 'src/app/_viewModels/PatientViewModels';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DiseaseService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  GetAllActiveDropdown(): Observable<IJsonResponse<IInfectiousDisease[]>> {
    let url: string = environment.API_URL + '/Diseases/DropdownList';
    return this.httpClientUtils.getJSON<IJsonResponse<IInfectiousDisease[]>>(
      url
    );
  }
}
