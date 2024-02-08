import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { AuthService } from 'src/app/_services/Auth/auth.service';
import { IUserLogin, IUserSession } from 'src/app/_viewModels/UserViewModels';
import { ErrorMessages } from 'src/app/_shared/errMessageConstants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  isLoading: boolean = false;
  isLoginFormSubmitted: boolean = false;
  userLoginForm = this.fb.group({
    username: new FormControl(
      { value: '', disabled: this.isLoading },
      Validators.required
    ),
    password: new FormControl(
      { value: '', disabled: this.isLoading },
      Validators.required
    ),
  });
  rememberMe = new FormControl({ value: false, disabled: this.isLoading });
  loginFormControls = this.userLoginForm.controls;

  constructor(
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    public authSvc: AuthService
  ) {}

  ngOnInit(): void {
    this.InitializeRememberMeFromStorage$();

    if (this.rememberMe.value) {
      this.CheckSession$();
    }
  }

  InitializeRememberMeFromStorage$(): void {
    var localRememberMe = localStorage.getItem('RememberMe');
    if (localRememberMe) {
      this.rememberMe.setValue(JSON.parse(localRememberMe));
    }
  }

  CheckSession$(): void {
    if (this.isLoading) {
      SweetAlerts.ShowLoadingToast();
    } else {
      // For UI display only
      // password is not correct
      if (this.rememberMe.value) {
        let session = localStorage.getItem('UserSession');
        if (session) {
          let sessionObj = JSON.parse(session) as IUserSession;
          this.loginFormControls.username.setValue(sessionObj.Username);
          this.loginFormControls.password.setValue('password');
        }
      }
    }
  }

  DoLogin$(): void {
    if (this.isLoading) {
      SweetAlerts.ShowLoadingToast();
    } else {
      this.isLoginFormSubmitted = true;

      if (this.userLoginForm.invalid) {
        SweetAlerts.ShowWarningToast('Invalid entries found');
        return;
      }

      this.isLoading = true;
      let shouldRedirect: boolean = false;
      localStorage.setItem('RememberMe', JSON.stringify(this.rememberMe.value));
      let session = localStorage.getItem('UserSession');

      if (session && !this.userLoginForm.dirty) {
        let hasAuthSession: boolean = false;
        this.authSvc.Session().subscribe({
          next: (response) => {
            hasAuthSession = response.IsSuccess;

            if (!response.IsSuccess) {
              if (response.Status === 401) {
                SweetAlerts.ShowWarningToast('Session Expired - Login again');

                // Remove/reset local storage
                localStorage.removeItem('UserSession');
                this.rememberMe.setValue(false);
                localStorage.setItem(
                  'RememberMe',
                  JSON.stringify(this.rememberMe.value)
                );

                this.loginFormControls.username.setValue('');
                this.loginFormControls.password.setValue('');
              } else {
                SweetAlerts.ShowWarningToast(
                  response.Message ?? ErrorMessages.Client.ErrRequestFail
                );
              }
            } else {
              SweetAlerts.ShowSuccessToast(response.Message ?? 'Logged in');
            }
          },
          error: (err) => {
            this.isLoading = false;
            SweetAlerts.ShowErrorToast(err.message);
          },
          complete: () => {
            if (hasAuthSession) {
              setTimeout(() => {
                this.router.navigate(['Dashboard']);
              }, 500);
            } else {
              this.isLoading = false;
            }
          },
        });
      } else {
        this.authSvc
          .Login(
            this.userLoginForm.value as IUserLogin,
            this.rememberMe.value as boolean
          )
          .subscribe({
            next: (response) => {
              shouldRedirect = response.IsSuccess;
              if (response.IsSuccess) {
                localStorage.setItem(
                  'UserSession',
                  JSON.stringify(response.Data)
                );
              } else {
                SweetAlerts.ShowErrorToast(response.Message ?? '');
              }
            },
            error: (err) => {
              this.isLoading = false;
              SweetAlerts.ShowErrorToast(err.message);
            },
            complete: () => {
              if (shouldRedirect) {
                SweetAlerts.ShowSuccessToast('Logged in');
                setTimeout(() => {
                  this.router.navigate(['Dashboard']);
                }, 500);
              } else {
                this.isLoading = false;
              }
            },
          });
      }
    }
  }
}
