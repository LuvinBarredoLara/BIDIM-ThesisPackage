import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HouseholdService } from 'src/app/_services/Household/household.service';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IHouseholdList } from 'src/app/_viewModels/HouseholdViewModel';
import { HouseholdModalComponent } from '../HouseholdModal/householdmodal.component';
import { HouseholdModalViewComponent } from '../HouseholdModalView/householdmodalview.component';

@Component({
  selector: 'app-households',
  templateUrl: './households.component.html',
  styleUrls: ['./households.component.css'],
})
export class HouseholdsComponent implements OnInit {
  IsLoading: boolean = false;

  HouseholdColumnHeaders: string[] = [
    'Id',
    'FamilyName',
    'MemberCount',
    'Options',
  ];
  HouseholdList: MatTableDataSource<IHouseholdList> = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) matPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort!: MatSort;

  SearchFilter: string = '';

  constructor(
    public dialog: MatDialog,
    public householdSvc: HouseholdService
  ) {}

  ngOnInit(): void {
    this.GetList$();
  }

  applyFilter(event: any): void {
    this.IsLoading = true;

    const filterObj = {
      searchFilter: this.SearchFilter,
    };
    this.HouseholdList.filter = JSON.stringify(filterObj);

    setTimeout(() => {
      this.IsLoading = false;
    }, 500);
  }

  AddHousehold(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeHouseholdModal(0);
    }
  }

  EditHousehold(householdId: number): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeHouseholdModal(householdId);
    }
  }

  Viewhousehold(householdId: number): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeHouseholdModalView(householdId);
    }
  }

  private createFilterPredicate(data: IHouseholdList, filter: string) {
    const filterObject = JSON.parse(filter);
    const sf = filterObject.searchFilter.toLowerCase().trim();

    if (sf.length === 0) return true;

    return data.FamilyName.toLowerCase().indexOf(sf) !== -1 || data.Id === sf;
  }

  private GetList$(): void {
    if (this.HouseholdList.data.length > 0)
      this.HouseholdList = new MatTableDataSource();

    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.householdSvc.GetList().subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          setTimeout(() => {
            this.HouseholdList = new MatTableDataSource(response.Data);
            this.HouseholdList.paginator = this.matPaginator;
            this.HouseholdList.sort = this.matSort;
            this.HouseholdList.filterPredicate = this.createFilterPredicate;

            // If the user changes the sort order, reset back to the first page.
            this.matSort.sortChange.subscribe(
              () => (this.matPaginator.pageIndex = 0)
            );
          }, 500);
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

  private InitializeHouseholdModal(householdId: number): void {
    const dialogRef = this.dialog.open(HouseholdModalComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: { householdId: householdId, createFromInd: false },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.shouldRefresh) this.GetList$();
    });
  }

  private InitializeHouseholdModalView(householdId: number): void {
    const dialogRef = this.dialog.open(HouseholdModalViewComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: householdId,
    });
  }
}
