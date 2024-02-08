import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/_services/Auth/auth.service';
import { CaseService } from 'src/app/_services/Case/case.service';
import { CaseHelper } from 'src/app/_shared/exportHelper';
import StringHelper, { DateHelper } from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { ICaseList } from 'src/app/_viewModels/CaseViewModels';
import { CaseModalComponent } from '../CaseModal/casemodal.component';
import { CaseModalViewComponent } from '../CaseModalView/casemodalview.component';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css'],
})
export class CasesComponent implements OnInit {
  IsLoading: boolean = false;

  CaseColumnHeaders: string[] = [
    'Id',
    'CreatedDate',
    'IndividualName',
    'InfectiousDisease',
    'Outcome',
    'OutcomeDate',
    'Options',
  ];

  CaseList: MatTableDataSource<ICaseList> = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) matPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort!: MatSort;

  SearchFilter: string = '';

  CanExport: boolean = false;

  constructor(
    public dialog: MatDialog,
    public caseSvc: CaseService,
    private authSvc: AuthService
  ) {}

  ngOnInit(): void {
    this.GetList$();
    this.InitializeCanExport();
  }

  AddCase(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeCaseModal(StringHelper.EmptyGuid());
    }
  }

  EditCase(caseGuid: string): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeCaseModal(caseGuid);
    }
  }

  ViewCase(caseGuid: string): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeCaseModalView(caseGuid);
    }
  }

  applyFilter(e: any): void {
    this.IsLoading = true;

    const filterObj = {
      searchFilter: this.SearchFilter,
    };

    this.CaseList.filter = JSON.stringify(filterObj);

    setTimeout(() => {
      this.IsLoading = false;
    }, 500);
  }

  ExportCases(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    }

    if (this.CaseList.data.length === 0) {
      SweetAlerts.ShowWarningToast('No data can be exported');
      return;
    }

    if (!this.CanExport) {
      SweetAlerts.ShowWarningToast('Unauthorized');
      return;
    }

    try {
      var docInfo = this.ConstructCasesDocInfo();
      var docDetail = this.ConstructCasesDocDetail();

      CaseHelper.PrintCases(docInfo, docDetail);
    } catch (error) {
      SweetAlerts.ShowWarningToast(
        'We encountered an error\nwhile exporting cases'
      );
      return;
    }
  }

  private GetList$(): void {
    if (this.CaseList.data.length > 0) this.CaseList = new MatTableDataSource();

    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.caseSvc.GetList().subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          setTimeout(() => {
            this.CaseList = new MatTableDataSource(response.Data);
            this.CaseList.paginator = this.matPaginator;
            this.CaseList.sort = this.matSort;
            this.CaseList.filterPredicate = this.createFilterPredicate;

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

  private createFilterPredicate(data: ICaseList, filter: string) {
    const filterObject = JSON.parse(filter);
    const sf = filterObject.searchFilter.toLowerCase().trim();

    if (sf.length === 0) return true;

    return (
      data.IndividualName.toLowerCase().indexOf(sf) !== -1 ||
      data.InfectiousDisease.toLowerCase().indexOf(sf) !== -1 ||
      data.Outcome.toLowerCase().indexOf(sf) !== -1
    );
  }

  private InitializeCaseModal(caseId: string): void {
    const dialogRef = this.dialog.open(CaseModalComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: caseId,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.shouldRefresh) this.GetList$();
    });
  }

  private InitializeCaseModalView(caseId: string): void {
    const dialogRef = this.dialog.open(CaseModalViewComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: caseId,
    });
  }

  private ConstructCasesDocInfo(): any {
    let date = new Date();
    return {
      title: 'CASES' + '_' + DateHelper.FormatDateToShortDatev2(date),
      author: 'Brgy. Infectious Diseases Information Management System',
      subject:
        'CASES' +
        '_' +
        `${date.getFullYear()}${date.getDate()}${date.getMonth()}`,
      keywords: 'CASES',
    };
  }

  private ConstructCasesDocDetail(): any {
    let docDetail = {
      body: [] as any[],
    };

    //----- Table -----//
    //-- Column Headers
    docDetail.body.push([
      { text: 'ID', style: 'tableHeader', margin: [0, 5, 0, 5] },
      { text: 'Individual', style: 'tableHeader', margin: [0, 5, 0, 5] },
      {
        text: 'Disease',
        style: 'tableHeader',
        margin: [0, 5, 0, 5],
      },
      { text: 'Outcome', style: 'tableHeader', margin: [0, 5, 0, 5] },
      { text: 'Date', style: 'tableHeader', margin: [0, 5, 0, 5] },
    ]);

    //-- Body
    this.CaseList.data.forEach((c) => {
      docDetail.body.push([
        { text: c.Id, style: 'tableData', margin: [0, 5, 0, 5] },
        { text: c.IndividualName, style: 'tableData', margin: [0, 5, 0, 5] },
        { text: c.InfectiousDisease, style: 'tableData', margin: [0, 5, 0, 5] },
        { text: c.Outcome, style: 'tableData', margin: [0, 5, 0, 5] },
        { text: c.OutcomeDate, style: 'tableData', margin: [0, 5, 0, 5] },
      ]);
    });

    return docDetail;
  }

  private InitializeCanExport(): void {
    let ut = this.authSvc.UserType().toLowerCase();

    this.CanExport =
      ut != '' && ut.length > 0 && (ut === 'admin' || ut === 'superadmin');
  }
}
