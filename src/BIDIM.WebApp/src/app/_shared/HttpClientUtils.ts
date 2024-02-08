import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ErrorMessages } from './errMessageConstants';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
    }),
    withCredentials: true
};

@Injectable({
    providedIn: 'root'
  })
export class HttpClientUtils {

    constructor(private httpclient: HttpClient){ }

    getJSON<T>(url: string) {
        return this.httpclient.get<T>(url)
            .pipe(
                retry(2), // retry request 2 times if still erroring out
                catchError(this.handleError)
            );
    }

    postJSON<T>(url: string, data?: any) {
        return this.httpclient.post<T>(url, data, httpOptions)
            .pipe(
                retry(2), // retry request 2 times if still erroring out
                catchError(this.handleError)
            );
    }

    handleError(err: HttpErrorResponse) {
        var errMssg: string = err.status === 0 ? // 0 if network related errors
            ErrorMessages.Client.ErrConnectingServer :
            ErrorMessages.Client.ErrRequestFail;

        return throwError(() => new Error(errMssg));
    }
}