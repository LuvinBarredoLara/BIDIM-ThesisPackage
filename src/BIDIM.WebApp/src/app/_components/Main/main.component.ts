import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IInfectiousDisease } from 'src/app/_viewModels/PatientViewModels';
import { IUserSession } from 'src/app/_viewModels/UserViewModels';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  IsLoading: boolean = false;
  UserPrincipal: IUserSession = {
    Username: '',
    Firstname: '',
    Lastname: '',
    Type: '',
    Token: '',
  };
  Diseases: IInfectiousDisease[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.SetUserPrincipal();
  }

  Logout(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      SweetAlerts.AskQuestion('Do you want to Log out?', '').then(
        (response) => {
          if (response.value) {
            this.ClearSession();
          }
        }
      );
    }
  }

  private SetUserPrincipal(): void {
    let session = localStorage.getItem('UserSession');
    if (session == undefined || session == null) return;

    if (session != null && session != undefined) {
      let sessionObj = JSON.parse(session) as IUserSession;
      this.UserPrincipal = {
        Username: sessionObj.Username,
        Firstname: sessionObj.Firstname,
        Lastname: sessionObj.Lastname,
        Type: sessionObj.Type,
        Token: sessionObj.Token,
      };
    } else {
      SweetAlerts.ShowErrorToast('Unauthorized user');
      setTimeout(() => {
        this.router.navigate(['Login']);
      }, 1000);
    }
  }

  private ClearSession(): void {
    let rememberMe = localStorage.getItem('RememberMe') ?? 'false';

    if (!JSON.parse(rememberMe)) {
      localStorage.removeItem('UserSession');
    }
    SweetAlerts.ShowSuccessToast('Logged out');
    setTimeout(() => {
      this.router.navigate(['Login']);
    }, 1000);
  }
}
