import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { UserService } from 'src/app/_services/User/user.service';
import StringHelper from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IUserViewModel, IUserType } from 'src/app/_viewModels/UserViewModels';

@Component({
  selector: 'app-usermodal',
  templateUrl: './usermodal.component.html',
  styleUrls: ['./usermodal.component.css'],
})
export class UserModalComponent implements OnInit {
  IsLoading: boolean = false;

  UserForm = this.fb.group({
    Username: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    Password: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      [Validators.required, Validators.minLength(4)]
    ),
    ConfirmPassword: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      [Validators.required, Validators.minLength(4)]
    ),
    FirstName: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    LastName: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    UserType: new FormControl(
      {
        value: 3,
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    Status: new FormControl(
      {
        value: true,
        disabled: this.IsLoading,
      },
      Validators.required
    ),
  });
  UserFormControls = this.UserForm.controls;
  UserFormSubmitted: boolean = false;

  UserInfo: IUserViewModel = this.NewUser();

  UserTypes: IUserType[] = [];

  UserModalTitle: string =
    this.UserInfo.UserId === StringHelper.EmptyGuid()
      ? 'ADD USER'
      : 'EDIT USER';

  private PasswordUpdated: boolean = false;

  constructor(
    private fb: FormBuilder,
    public userSvc: UserService,
    private dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public userId: string
  ) {}

  ngOnInit(): void {
    this.FetchData$();
  }

  CloseModal(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      if (this.UserForm.dirty || this.UserForm.touched) {
        SweetAlerts.AskQuestion(
          'Changes made will not be saved',
          'Proceed?'
        ).then((response) => {
          if (response.value) {
            this.dialogRef.close({ shouldRefresh: false });
          }
        });
      } else {
        this.dialogRef.close({ shouldRefresh: false });
      }
    }
  }

  Submit$(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.UserFormSubmitted = true;

      if (this.UserForm.invalid) {
        SweetAlerts.ShowErrorToast('Errors found');
        return;
      } else {
        if (!this.UserForm.dirty) {
          this.dialogRef.close({ shouldRefresh: false });
        } else {
          this.Upsert$();
        }
      }
    }
  }

  private Upsert$(): void {
    this.UserInfo = {
      UserId: this.userId,
      Username: this.UserFormControls.Username.value!,
      Password: this.UserFormControls.Password.value!,
      ConfirmPassword: this.UserFormControls.ConfirmPassword.value!,
      FirstName: this.UserFormControls.FirstName.value!,
      LastName: this.UserFormControls.LastName.value!,
      UserTypeId: this.UserFormControls.UserType.value!,
      IsActive: this.UserFormControls.Status.value!,
      PasswordUpdated: this.PasswordUpdated,
    };

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';

    this.IsLoading = true;
    this.userSvc.Upsert(this.UserInfo).subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        }
      },
      error: (err) => {
        this.IsLoading = false;
        SweetAlerts.ShowErrorToast(err.message);
      },
      complete: () => {
        this.IsLoading = false;
        if (Is200Fail) {
          SweetAlerts.ShowErrorToast(d200FailMssg);
          return;
        } else {
          SweetAlerts.ShowInfoToast('User saved');
          this.dialogRef.close({ shouldRefresh: true });
        }
      },
    });
  }

  private FetchData$(): void {
    this.IsLoading = true;

    let is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.userSvc.GetUserTypesDropdown().subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          this.UserTypes = response.Data ?? [];
        }
      },
      error: (err) => {
        this.IsLoading = false;
        SweetAlerts.ShowErrorToast(err.message);
      },
      complete: () => {
        this.IsLoading = false;
        if (is200Fail) {
          SweetAlerts.ShowErrorToast(d200FailMssg);
          return;
        } else {
          if (this.userId !== StringHelper.EmptyGuid()) {
            this.GetUserInfo$();
          }
        }
      },
    });
  }

  private GetUserInfo$(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.IsLoading = true;

      let Is200Fail = false;
      let d200FailMssg = '';
      this.userSvc.GetUserInfo(this.userId).subscribe({
        next: (response) => {
          if (!response.IsSuccess) {
            Is200Fail = true;
            d200FailMssg = response.Message ?? '';
          } else {
            this.SetUser(response.Data!);
          }
        },
        error: (err) => {
          this.IsLoading = false;
          SweetAlerts.ShowErrorToast(err.message);
        },
        complete: () => {
          if (Is200Fail) {
            this.IsLoading = false;
            SweetAlerts.ShowErrorToast(d200FailMssg);
          } else {
            setTimeout(() => {
              this.IsLoading = false;
            }, 500);
          }
        },
      });
    }
  }

  private NewUser(): IUserViewModel {
    return {
      UserId: StringHelper.EmptyGuid(),
      Username: '',
      Password: '',
      ConfirmPassword: '',
      FirstName: '',
      LastName: '',
      UserTypeId: 1,
      IsActive: true,
      PasswordUpdated: false,
    };
  }

  private SetUser(userInfo: IUserViewModel): void {
    this.UserInfo = {
      UserId: userInfo.UserId,
      Username: userInfo.Username,
      Password: userInfo.Password, // These are hashed password
      ConfirmPassword: userInfo.ConfirmPassword, // These are hashed password
      FirstName: userInfo.FirstName,
      LastName: userInfo.LastName,
      UserTypeId: userInfo.UserTypeId,
      IsActive: userInfo.IsActive,
      PasswordUpdated: userInfo.PasswordUpdated,
    };

    this.UserFormControls.Username.setValue(userInfo.Username);
    this.UserFormControls.Password.setValue('password'); // set dummy password for display
    this.UserFormControls.ConfirmPassword.setValue('password'); // set dummy password for display
    this.UserFormControls.FirstName.setValue(userInfo.FirstName);
    this.UserFormControls.LastName.setValue(userInfo.LastName);
    this.UserFormControls.UserType.setValue(userInfo.UserTypeId);
    this.UserFormControls.Status.setValue(userInfo.IsActive);
  }

  SetPasswordUpdated(): void {
    if (!this.PasswordUpdated) this.PasswordUpdated = true;

    if (this.UserFormControls.ConfirmPassword.value !== '')
      this.UserFormControls.ConfirmPassword.setValue(''); // clear confirm password when detect changes in password
  }
}
