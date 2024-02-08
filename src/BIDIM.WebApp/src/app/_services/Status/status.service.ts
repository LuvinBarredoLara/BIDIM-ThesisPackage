import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { IStatus } from 'src/app/_viewModels/PatientViewModels';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  GetAllActiveDropdown(): Observable<IJsonResponse<IStatus[]>> {
    let url: string = environment.API_URL + '/Statuses/DropdownList';
    return this.httpClientUtils.getJSON<IJsonResponse<IStatus[]>>(url);
  }
}
