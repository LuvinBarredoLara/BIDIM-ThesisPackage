import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientUtils } from 'src/app/_shared/HttpClientUtils';
import { IJsonResponse } from 'src/app/_viewModels/JsonResponseViewModel';
import { IUserLogin, IUserSession } from 'src/app/_viewModels/UserViewModels';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public httpClientUtils: HttpClientUtils) {}

  Login(login: IUserLogin, rememberMe: boolean) {
    let url: string =
      environment.API_URL +
      '/Identity/Login' +
      (rememberMe ? '?rememberMe=true' : '');
    return this.httpClientUtils.postJSON<IJsonResponse<any>>(url, login);
  }

  Logout(): void {
    // let url: string = environment.API_URL + '/Identity/Logout';
    // return this.httpClientUtils.postJSON<IJsonResponse<any>>(url);
    localStorage.removeItem('UserSession');
  }

  Session(): Observable<IJsonResponse<any>> {
    let url: string = environment.API_URL + '/Identity/Session';
    return this.httpClientUtils.getJSON<IJsonResponse<any>>(url);
  }

  Token(): string {
    let session = localStorage.getItem('UserSession');
    return session == undefined || session == null
      ? ''
      : (JSON.parse(session) as IUserSession).Token;
  }

  UserType(): string {
    let session = localStorage.getItem('UserSession');
    return session == undefined || session == null
      ? ''
      : (JSON.parse(session) as IUserSession).Type;
  }

  IsAuth(): boolean {
    let session = localStorage.getItem('UserSession');

    if (session == undefined || session == null) return false;
    else {
      let us = JSON.parse(session) as IUserSession;
      return us.Token != '' && us.Type != '';
    }
  }
}
