import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanDeactivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/Auth/auth.service';
import SweetAlerts from '../_shared/sweetAlerts';
import { IUserSession } from '../_viewModels/UserViewModels';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard
  implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad
{
  constructor(private authSvc: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkUserLogin(route, state.url);
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkUserLogin(childRoute, state.url);
  }
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return true;
  }

  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {
    let retVal = false;

    let isAuth: boolean = this.authSvc.IsAuth();

    if (!isAuth) {
      SweetAlerts.ShowWarningToast('Unauthorized');
      this.router.navigate(['Login']);
      return false;
    } else {
      let userSession = localStorage.getItem('UserSession');

      if (userSession === null || userSession === undefined) {
        SweetAlerts.ShowWarningToast('Unauthorized');
        this.router.navigate(['Login']);
        return false;
      } else {
        let us = JSON.parse(userSession) as IUserSession;
        let roles: string[] = route.data['expectedRole'];

        if (roles.includes(us.Type.toLowerCase())) return true;
        else {
          SweetAlerts.ShowWarningToast('Unauthorized');
          this.router.navigate(['Login']);
          return false;
        }
      }
    }
  }
}
