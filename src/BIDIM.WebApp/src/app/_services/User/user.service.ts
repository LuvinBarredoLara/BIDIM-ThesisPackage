import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import {
  IUserViewModel,
  IUserList,
  IUserType,
} from 'src/app/_viewModels/UserViewModels';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  GetList(): Observable<IJsonResponse<IUserList[]>> {
    let url: string = environment.API_URL + '/Users';
    return this.httpClientUtils.getJSON<IJsonResponse<IUserList[]>>(url);
  }

  GetUserTypesDropdown(): Observable<IJsonResponse<IUserType[]>> {
    let url: string = environment.API_URL + '/User/Types';
    return this.httpClientUtils.getJSON<IJsonResponse<IUserType[]>>(url);
  }

  GetUserInfo(userId: string): Observable<IJsonResponse<IUserViewModel>> {
    let url: string = environment.API_URL + '/User/' + userId;
    return this.httpClientUtils.getJSON<IJsonResponse<IUserViewModel>>(url);
  }

  Upsert(userInfo: IUserViewModel): Observable<IJsonResponse<IUserViewModel>> {
    let url: string = environment.API_URL + '/User';
    return this.httpClientUtils.postJSON<IJsonResponse<IUserViewModel>>(
      url,
      userInfo
    );
  }
}
