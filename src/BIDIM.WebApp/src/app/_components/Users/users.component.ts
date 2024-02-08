import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/_services/User/user.service';
import StringHelper from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IUserList } from 'src/app/_viewModels/UserViewModels';
import { UserModalComponent } from '../UserModal/usermodal.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  IsLoading: boolean = false;
  UserColumnHeaders: string[] = [
    'Username',
    'FirstName',
    'LastName',
    'UserType',
    'IsActive',
    'Options',
  ];
  UserList: MatTableDataSource<IUserList> = new MatTableDataSource();
  ResultsLength: number = 0;

  @ViewChild(MatPaginator, { static: true }) matPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort!: MatSort;

  SearchFilter: string = '';

  constructor(public dialog: MatDialog, public userSvc: UserService) {}

  ngOnInit(): void {
    this.GetList$();
  }

  applyFilter(event: any): void {
    this.IsLoading = true;

    const filterObj = {
      searchFilter: this.SearchFilter,
    };
    this.UserList.filter = JSON.stringify(filterObj);

    setTimeout(() => {
      this.IsLoading = false;
    }, 500);
  }

  AddUser(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeUserModal(StringHelper.EmptyGuid());
    }
  }

  EditUser(userId: string): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeUserModal(userId);
    }
  }

  private GetList$(): void {
    if (this.UserList.data.length > 0) this.UserList = new MatTableDataSource();

    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.userSvc.GetList().subscribe({
      next: (response) => {
        if (response.IsSuccess) {
          setTimeout(() => {
            this.UserList = new MatTableDataSource(response.Data);
            this.UserList.paginator = this.matPaginator;
            this.UserList.sort = this.matSort;
            this.UserList.filterPredicate = this.createFilterPredicate;
            this.ResultsLength = response.Data ? 0 : response.Data!.length;

            // If the user changes the sort order, reset back to the first page.
            this.matSort.sortChange.subscribe(
              () => (this.matPaginator.pageIndex = 0)
            );
          }, 500);
        } else {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
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

  private createFilterPredicate = (data: IUserList, filter: string) => {
    const filterObject = JSON.parse(filter);
    const sf = filterObject.searchFilter.toLowerCase().trim();

    if (sf.length === 0) return true;

    return (
      data.Username.toLowerCase().indexOf(sf) !== -1 ||
      data.FirstName.toLowerCase().indexOf(sf) !== -1 ||
      data.LastName.toLowerCase().indexOf(sf) !== -1 ||
      data.UserType.toLowerCase().indexOf(sf) !== -1
    );
  };

  private InitializeUserModal(userId: string): void {
    const dialogRef = this.dialog.open(UserModalComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: userId,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.shouldRefresh) this.GetList$();
    });
  }
}
