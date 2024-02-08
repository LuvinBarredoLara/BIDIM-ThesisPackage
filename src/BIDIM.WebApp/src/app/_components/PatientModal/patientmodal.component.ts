import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  IHouseholdInfo,
  IInfectiousDisease,
  IPatientInfo,
  IPatientInfoParameters,
  IPatientRecord,
  IStatus,
} from 'src/app/_viewModels/PatientViewModels';
import { IPHBrgy, IPHCityMun } from 'src/app/_viewModels/PHLocsViewModel';
import PHCityMun from '../../../assets/phlocjson/refcitymun.json';
import PHBrgy from '../../../assets/phlocjson/refbrgy.json';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { ErrorMessages } from 'src/app/_shared/errMessageConstants';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MappingComponent } from '../Mapping/mapping.component';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import StringHelper, { DateHelper } from 'src/app/_shared/helpers';
import { DiseaseService } from 'src/app/_services/Disease/disease.service';
import { forkJoin } from 'rxjs';
import { StatusService } from 'src/app/_services/Status/status.service';
import { PatientService } from 'src/app/_services/Patient/patient.service';

@Component({
  selector: 'app-patientmodal',
  templateUrl: './patientmodal.component.html',
  styleUrls: ['./patientmodal.component.css'],
})
export class PatientmodalComponent implements OnInit {
  IsLoading: boolean = false;

  // Locations
  CityMuns: IPHCityMun[] = [];
  // Do not load brgys yet until user selects city
  Brgys: IPHBrgy[] = [];

  // Pagination Properties
  @ViewChild(MatPaginator, { static: true }) matPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort!: MatSort;

  // PatientInfo Model
  PatientInfo!: IPatientInfo;
  PatientInfoForm = this.fb.group({
    PatientId: new FormControl(
      { value: '', disabled: this.IsLoading },
      Validators.required
    ),
    FirstName: new FormControl(
      { value: '', disabled: this.IsLoading },
      Validators.required
    ),
    LastName: new FormControl(
      { value: '', disabled: this.IsLoading },
      Validators.required
    ),
    DoB: new FormControl(new Date(), Validators.required),
    Age: new FormControl(
      { value: '0', disabled: this.IsLoading },
      Validators.required
    ),
    Sex: new FormControl(
      { value: 'Male', disabled: this.IsLoading },
      Validators.required
    ),
    ContactNumber: new FormControl(
      { value: '', disabled: this.IsLoading },
      Validators.required
    ),
    CityMun: new FormControl(
      { value: '', disabled: this.IsLoading },
      Validators.required
    ),
    Brgy: new FormControl(
      { value: '', disabled: this.IsLoading },
      Validators.required
    ),
    Zone: new FormControl({ value: '', disabled: this.IsLoading }),
    InfectiousDisease: new FormControl(
      { value: '', disabled: this.IsLoading },
      Validators.required
    ),
    Status: new FormControl(
      { value: '', disabled: this.IsLoading },
      Validators.required
    ),
    DateReported: new FormControl(new Date(), Validators.required),
  });
  PatientInfoControls = this.PatientInfoForm.controls;
  PatientHouseholdCoordinate: number[] = [];
  HouseholdCoordinateUpdated: boolean = false;
  Diseases: IInfectiousDisease[] = [];
  Statuses: IStatus[] = [];
  PatientInfoFormSubmitted: boolean = false;

  ModalTitle: string =
    this.patientInfoData.PatientGuid == undefined
      ? 'ADD PATIENT'
      : 'EDIT PATIENT';

  constructor(
    @Inject(MAT_DIALOG_DATA) public patientInfoData: IPatientInfoParameters,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PatientmodalComponent>,
    public diseaseSvc: DiseaseService,
    public statusSvc: StatusService,
    public patientSvc: PatientService
  ) {}

  ngOnInit(): void {
    // Load up locations
    this.CityMuns = PHCityMun.RECORDS.filter((cm) => cm.provCode == '0630');

    this.FetchData$();
  }

  private FetchData$(): void {
    this.IsLoading = true;
    forkJoin([
      this.diseaseSvc.GetAllActiveDropdown(),
      this.statusSvc.GetAllActiveDropdown(),
    ]).subscribe({
      next: (response) => {
        if (!response[0].IsSuccess)
          SweetAlerts.ShowErrorToast('Error retreiving Diseases');
        this.Diseases = response[0].Data ?? [];
        if (!response[1].IsSuccess)
          SweetAlerts.ShowErrorToast('Error retreiving Status');
        this.Statuses = response[1].Data ?? [];
      },
      error: (err) => {
        this.IsLoading = false;
        SweetAlerts.ShowErrorToast(err.message);
      },
      complete: () => {
        setTimeout(() => {
          this.IsLoading = false;
          if (
            this.patientInfoData.PatientGuid !== StringHelper.EmptyGuid() &&
            this.patientInfoData.PatientGuid != undefined
          ) {
            this.GetInfo$();
          }
        }, 500);
      },
    });
  }

  FilterBrgyByCityMun(e: any): void {
    // Remove PatientInfoHousehold since location was updated
    if (this.PatientHouseholdCoordinate.length !== 0) {
      this.PatientHouseholdCoordinate = [];
      this.HouseholdCoordinateUpdated = true;
    }
    if (this.PatientInfoControls.CityMun.value === '') {
      this.Brgys = [];
      this.PatientInfoControls.Brgy.setValue('');
    } else {
      this.Brgys = PHBrgy.RECORDS.filter(
        (b) => b.citymunCode == this.PatientInfoControls.CityMun.value
      );
      this.PatientInfoControls.Brgy.setValue(this.Brgys[0].brgyCode);
    }
  }

  UpdateHouseholdCoord(): void {
    // Remove PatientInfoHousehold since location was updated
    if (this.PatientHouseholdCoordinate.length !== 0) {
      this.PatientHouseholdCoordinate = [];
      this.HouseholdCoordinateUpdated = true;
    }
  }

  CalculateAge(event: MatDatepickerInputEvent<Date>): void {
    try {
      let timeDiff = Math.abs(Date.now() - new Date(event.value!).getTime());
      let age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
      this.PatientInfoControls.Age.setValue(age.toString());
    } catch (error) {
      this.PatientInfoControls.Age.setValue('');
    }
  }

  OpenMapping(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowWarningToast(ErrorMessages.Client.PageLoading);
      return;
    } else {
      if (this.PatientInfoControls.CityMun.value === '') {
        SweetAlerts.ShowWarningToast('Please select a Municipality');
        return;
      } else {
        const dialogRef = this.dialog.open(MappingComponent, {
          disableClose: true,
          enterAnimationDuration: '300ms',
          exitAnimationDuration: '300ms',
          hasBackdrop: true,
          width: '1000px',
          data: {
            CityMun:
              this.PatientInfoControls.CityMun.value == '063022'
                ? 'iloilo city'
                : this.CityMuns.find((cm) => {
                    return (
                      cm.citymunCode == this.PatientInfoControls.CityMun.value
                    );
                  })?.citymunDesc,
            Brgy: this.Brgys.find((b) => {
              return b.brgyCode == this.PatientInfoControls.Brgy.value;
            })?.brgyDesc,
            HouseholdCoordinate: this.PatientHouseholdCoordinate,
          },
        });

        dialogRef.afterClosed().subscribe((res) => {
          if (res) {
            this.PatientHouseholdCoordinate = res.data;
            this.HouseholdCoordinateUpdated = true;
          }
        });
      }
    }
  }

  CloseModal(): void {
    if (
      this.PatientInfoForm.dirty ||
      this.HouseholdCoordinateUpdated ||
      this.PatientInfoForm.touched
    ) {
      SweetAlerts.AskQuestion(
        'Changes made will not be saved',
        'Proceed?'
      ).then((response) => {
        if (response.value) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }

  GetInfo$(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.IsLoading = true;

      let Is200Fail: boolean = false;
      let d200FailMssg: string = '';
      this.patientSvc
        .GetPatient(
          this.patientInfoData.PatientGuid,
          this.patientInfoData.RecordId
        )
        .subscribe({
          next: (response) => {
            if (response.IsSuccess) {
              this.SetPatientInfo(response.Data!);
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
              this.dialogRef.close();
            } else {
              setTimeout(() => {
                this.IsLoading = false;
              }, 500);
            }
          },
        });
    }
  }

  private SetPatientInfo(data: IPatientInfo) {
    this.PatientInfo = {
      Id: data.Id,
      PatientId: data.PatientId,
      FirstName: data.FirstName,
      LastName: data.LastName,
      DoB: data.DoB,
      Age: data.Age,
      Sex: data.Sex,
      ContactNumber: data.ContactNumber,
      // household info
      HouseholdInfo: {
        Id: data.HouseholdInfo.Id,
        CityMun: data.HouseholdInfo.CityMun,
        Brgy: data.HouseholdInfo.Brgy,
        Zone: data.HouseholdInfo.Zone,
        Long: data.HouseholdInfo.Long,
        Lat: data.HouseholdInfo.Lat,
      },
      // patient record
      PatientRecord: {
        Id: data.PatientRecord.Id,
        PatientGuid: data.Id,
        StatusId: data.PatientRecord.StatusId,
        InfectiousDiseaseId: data.PatientRecord.InfectiousDiseaseId,
        DateReported: data.PatientRecord.DateReported,
      },
    };

    this.PatientInfoControls.PatientId.setValue(this.PatientInfo.PatientId);
    this.PatientInfoControls.FirstName.setValue(this.PatientInfo.FirstName);
    this.PatientInfoControls.LastName.setValue(this.PatientInfo.LastName);
    this.PatientInfoControls.DoB.setValue(new Date(this.PatientInfo.DoB));
    this.PatientInfoControls.Age.setValue(this.PatientInfo.Age.toString());
    this.PatientInfoControls.Sex.setValue(this.PatientInfo.Sex);
    this.PatientInfoControls.ContactNumber.setValue(
      this.PatientInfo.ContactNumber
    );
    // household info
    this.PatientInfoControls.CityMun.setValue(
      this.PatientInfo.HouseholdInfo.CityMun
    );
    this.FilterBrgyByCityMun(null);
    this.PatientInfoControls.Brgy.setValue(this.PatientInfo.HouseholdInfo.Brgy);
    this.PatientInfoControls.Zone.setValue(
      this.PatientInfo.HouseholdInfo.Zone == 0
        ? ''
        : this.PatientInfo.HouseholdInfo.Zone.toString()
    );
    this.PatientHouseholdCoordinate = [
      this.PatientInfo.HouseholdInfo.Long,
      this.PatientInfo.HouseholdInfo.Lat,
    ];
    // patientrecord
    this.PatientInfoControls.InfectiousDisease.setValue(
      this.PatientInfo.PatientRecord.InfectiousDiseaseId.toString()
    );
    this.PatientInfoControls.Status.setValue(
      this.PatientInfo.PatientRecord.StatusId.toString()
    );
    this.PatientInfoControls.DateReported.setValue(
      new Date(this.PatientInfo.PatientRecord.DateReported)
    );

    this.PatientInfoForm.markAsPristine();
    this.HouseholdCoordinateUpdated = false;
  }

  Submit$(): void {
    this.PatientInfoFormSubmitted = true;

    if (this.PatientInfoForm.invalid) {
      SweetAlerts.ShowErrorToast('Errors found');
      return;
    } else {
      // Check if form was modified
      if (!this.PatientInfoForm.dirty && !this.HouseholdCoordinateUpdated) {
        this.dialogRef.close({ shouldRefresh: false });
      } else {
        this.IsLoading = true;

        this.Upsert$();
      }
    }
  }

  private Upsert$(): void {
    // #region > Build patient info model
    this.PatientInfo = {
      Id: this.patientInfoData.PatientGuid,
      PatientId: this.PatientInfoControls.PatientId.value!,
      FirstName: this.PatientInfoControls.FirstName.value!,
      LastName: this.PatientInfoControls.LastName.value!,
      DoB: DateHelper.FormatDateToShortDate(
        new Date(this.PatientInfoControls.DoB.value!)
      ),
      Age: parseInt(this.PatientInfoControls.Age.value!),
      Sex: this.PatientInfoControls.Sex.value!,
      ContactNumber: this.PatientInfoControls.ContactNumber.value!,

      // household info
      HouseholdInfo: {
        Id: this.PatientInfo?.HouseholdInfo?.Id ?? 0,
        CityMun: this.PatientInfoControls.CityMun.value!,
        Brgy: this.PatientInfoControls.Brgy.value!,
        Zone:
          this.PatientInfoControls.Zone.value!.length === 0
            ? 0
            : parseInt(this.PatientInfoControls.Zone.value!),
        Long: this.PatientHouseholdCoordinate[0],
        Lat: this.PatientHouseholdCoordinate[1],
      },

      // patient record
      PatientRecord: {
        Id: this.patientInfoData.RecordId ?? 0,
        PatientGuid: StringHelper.EmptyGuid(),
        StatusId: parseInt(this.PatientInfoControls.Status.value!),
        InfectiousDiseaseId: parseInt(
          this.PatientInfoControls.InfectiousDisease.value!
        ),
        DateReported: DateHelper.FormatDateToShortDate(
          new Date(this.PatientInfoControls.DateReported.value!)
        ),
      },
    };
    // #endregion

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';

    this.patientSvc.UpsertPatient(this.PatientInfo).subscribe({
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
          this.dialogRef.close({ shouldRefresh: true });
          SweetAlerts.ShowSuccessToast('Patient Info Saved');
        }
      },
    });
  }
}
