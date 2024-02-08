import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IndividualService } from 'src/app/_services/Individual/individual.service';
import StringHelper from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IIndividualList } from 'src/app/_viewModels/IndividualViewModel';
import { IndividualModalComponent } from '../IndividualModal/individualmodal.component';
import { IndividualModalViewComponent } from '../IndividualModalView/individualmodalview.component';

@Component({
  selector: 'app-individuals',
  templateUrl: './individuals.component.html',
  styleUrls: ['./individuals.component.css'],
})
export class IndividualsComponent implements OnInit {
  IsLoading: boolean = false;

  IndividualColumnHeaders: string[] = [
    'FullName',
    'Gender',
    'HouseholdFamilyName',
    'Active',
    'Options',
  ];
  IndividualList: MatTableDataSource<IIndividualList> =
    new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) matPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort!: MatSort;

  SearchFilter: string = '';

  constructor(
    public dialog: MatDialog,
    public individualSvc: IndividualService
  ) {}

  ngOnInit(): void {
    this.GetList$();
  }

  applyFilter(e: any): void {
    this.IsLoading = true;

    const filterObj = {
      searchFilter: this.SearchFilter,
    };

    this.IndividualList.filter = JSON.stringify(filterObj);

    setTimeout(() => {
      this.IsLoading = false;
    }, 500);
  }

  AddIndividual(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeIndividualModal(StringHelper.EmptyGuid());
    }
  }

  EditIndividual(individualId: string): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeIndividualModal(individualId);
    }
  }

  ViewIndividual(individualId: string): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeIndividualModalView(individualId);
    }
  }

  private GetList$(): void {
    if (this.IndividualList.data.length > 0)
      this.IndividualList = new MatTableDataSource();

    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.individualSvc.GetList().subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          setTimeout(() => {
            this.IndividualList = new MatTableDataSource(response.Data);
            this.IndividualList.paginator = this.matPaginator;
            this.IndividualList.sort = this.matSort;
            this.IndividualList.filterPredicate = this.createFilterPredicate;

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

  private createFilterPredicate(data: IIndividualList, filter: string) {
    const filterObject = JSON.parse(filter);
    const sf = filterObject.searchFilter.toLowerCase().trim();

    if (sf.length === 0) return true;

    return (
      data.FullName.toLowerCase().indexOf(sf) !== -1 ||
      data.HouseholdFamilyName.toLowerCase().indexOf(sf) !== -1
    );
  }

  private InitializeIndividualModal(individualId: string): void {
    const dialogRef = this.dialog.open(IndividualModalComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: individualId,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.shouldRefresh) this.GetList$();
    });
  }

  private InitializeIndividualModalView(individualId: string): void {
    const dialogRef = this.dialog.open(IndividualModalViewComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: individualId,
    });
  }
}
