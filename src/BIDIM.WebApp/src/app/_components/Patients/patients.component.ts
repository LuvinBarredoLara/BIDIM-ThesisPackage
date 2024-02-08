import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IPatientList } from 'src/app/_viewModels/PatientViewModels';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { ErrorMessages } from 'src/app/_shared/errMessageConstants';
import { MatDialog } from '@angular/material/dialog';
import { PatientmodalComponent } from '../PatientModal/patientmodal.component';
import { PatientService } from 'src/app/_services/Patient/patient.service';
import StringHelper from 'src/app/_shared/helpers';
import { PatientmodalviewComponent } from '../PatientModalView/patientmodalview.component';
import { IUserSession } from 'src/app/_viewModels/UserViewModels';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit {
  IsLoading: boolean = false;
  UserPrincipal!: IUserSession;
  PatientColumnHeaders: string[] = [
    'PatientId',
    'FullName',
    'Disease',
    'ContactNumber',
    'AdmissionDate',
    'Options',
  ];
  PatientList: MatTableDataSource<IPatientList> = new MatTableDataSource();
  ResultsLength: number = 0;

  @ViewChild(MatPaginator, { static: true }) matPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort!: MatSort;

  DiseaseFilter: string = '';
  SearchFilter: string = '';

  constructor(
    public dialog: MatDialog,
    public patientSvc: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.SetUserPrincipal();
    this.GetList$();
  }

  private SetUserPrincipal(): void {
    let session = localStorage.getItem('UserSession');

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

  applyFilter(event: any): void {
    this.IsLoading = true;

    const filterObj = {
      diseaseFilter: this.DiseaseFilter,
      searchFilter: this.SearchFilter,
    };
    this.PatientList.filter = JSON.stringify(filterObj);

    setTimeout(() => {
      this.IsLoading = false;
    }, 500);
  }

  AddPatient() {
    if (this.IsLoading) {
      SweetAlerts.ShowWarningToast(ErrorMessages.Client.PageLoading);
      return;
    } else {
      this.InitializePatientModal(StringHelper.EmptyGuid(), 0, false);
    }
  }

  EditPatient(patientGuid: string, recordId: number, forView: boolean) {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializePatientModal(patientGuid, recordId, forView);
    }
  }

  DeletePatient(patientGuid: string) {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      if (patientGuid === StringHelper.EmptyGuid()) {
        SweetAlerts.ShowWarningToast('Invalid Patient Data');
        return;
      }

      SweetAlerts.AskQuestion('This action cannot be undone', 'Proceed?').then(
        (response) => {
          if (response.value) {
            this.IsLoading = true;

            this.Delete$(patientGuid);
          }
        }
      );
    }
  }

  private Delete$(patientGuid: string): void {
    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';

    this.patientSvc.DeletePatient(patientGuid).subscribe({
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
        } else {
          SweetAlerts.ShowSuccessToast('Patient Info Deleted');
          this.GetList$();
        }
      },
    });
  }

  private GetList$(): void {
    if (this.PatientList.data.length > 0)
      this.PatientList = new MatTableDataSource();

    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.patientSvc.GetList().subscribe({
      next: (response) => {
        if (response.IsSuccess) {
          setTimeout(() => {
            this.PatientList = new MatTableDataSource(response.Data);
            this.PatientList.paginator = this.matPaginator;
            this.PatientList.sort = this.matSort;
            this.PatientList.filterPredicate = createFilterPredicate;
            this.ResultsLength = response.Data ? 0 : response.Data!.length;

            // If the user changes the sort order, reset back to the first page.
            this.matSort.sortChange.subscribe(
              () => (this.matPaginator.pageIndex = 0)
            );
          }, 1000);
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
          }, 1000);
        }
      },
    });
  }

  private InitializePatientModal(
    patientGuid: string,
    recordId: number,
    forView: boolean
  ) {
    const dialogRef = forView
      ? this.dialog.open(PatientmodalviewComponent, {
          disableClose: true,
          enterAnimationDuration: '300ms',
          exitAnimationDuration: '300ms',
          hasBackdrop: true,
          width: '700px',
          autoFocus: false,
          data: { PatientGuid: patientGuid, RecordId: recordId },
        })
      : this.dialog.open(PatientmodalComponent, {
          disableClose: true,
          enterAnimationDuration: '300ms',
          exitAnimationDuration: '300ms',
          hasBackdrop: true,
          width: '700px',
          autoFocus: false,
          data: { PatientGuid: patientGuid, RecordId: recordId },
        });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.shouldRefresh) this.GetList$();
    });
  }
}

const createFilterPredicate = (data: IPatientList, filter: string) => {
  const filterObject = JSON.parse(filter);
  const df = filterObject.diseaseFilter.toLowerCase().trim();
  const sf = filterObject.searchFilter.toLowerCase().trim();

  if (df.length === 0 && sf.length === 0) return true;

  if (df.length !== 0 && sf.length === 0) {
    return data.Disease.toLocaleLowerCase().indexOf(df) !== -1;
  }

  if (df.length === 0 && sf.length !== 0) {
    return (
      data.FullName.toLowerCase().indexOf(sf) !== -1 ||
      data.PatientId.toLowerCase().indexOf(sf) !== -1 ||
      data.ContactNumber.toLowerCase().indexOf(sf) !== -1
    );
  }

  return (
    data.Disease.toLowerCase().indexOf(df) !== -1 &&
    (data.FullName.toLowerCase().indexOf(sf) !== -1 ||
      data.PatientId.toLowerCase().indexOf(sf) !== -1 ||
      data.ContactNumber.toLowerCase().indexOf(sf) !== -1)
  );
};
