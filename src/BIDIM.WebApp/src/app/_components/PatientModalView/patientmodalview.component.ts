import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiseaseService } from 'src/app/_services/Disease/disease.service';
import { PatientService } from 'src/app/_services/Patient/patient.service';
import { StatusService } from 'src/app/_services/Status/status.service';
import {
  IInfectiousDisease,
  IPatientInfo,
  IPatientInfoParameters,
  IStatus,
} from 'src/app/_viewModels/PatientViewModels';
import { IPHBrgy, IPHCityMun } from 'src/app/_viewModels/PHLocsViewModel';
import PHCityMun from '../../../assets/phlocjson/refcitymun.json';
import PHBrgy from '../../../assets/phlocjson/refbrgy.json';
import { forkJoin } from 'rxjs';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import StringHelper, { DateHelper } from 'src/app/_shared/helpers';

@Component({
  selector: 'app-patientmodalview',
  templateUrl: './patientmodalview.component.html',
  styleUrls: ['./patientmodalview.component.css'],
})
export class PatientmodalviewComponent implements OnInit {
  IsLoading: boolean = false;

  // Locations
  CityMuns: IPHCityMun[] = [];
  // Do not load brgys yet until user selects city
  Brgys: IPHBrgy[] = [];

  Diseases: IInfectiousDisease[] = [];
  Statuses: IStatus[] = [];

  PatientDoB: string = '';
  PatientFullAddress: string = '';
  PatientDisease: string = '';
  PatientStatus: string = '';
  PatientRecordDateReported: string = '';

  // PatientInfo Model
  PatientInfo!: IPatientInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) public patientInfoData: IPatientInfoParameters,
    private dialogRef: MatDialogRef<PatientmodalviewComponent>,
    public diseaseSvc: DiseaseService,
    public statusSvc: StatusService,
    public patientSvc: PatientService
  ) {}

  ngOnInit(): void {
    // Load up locations
    this.CityMuns = PHCityMun.RECORDS.filter((cm) => cm.provCode == '0630');

    this.IsLoading = true;

    this.PatientInfo = {
      Id: StringHelper.EmptyGuid(),
      PatientId: '',
      FirstName: '',
      LastName: '',
      DoB: '',
      Age: 0,
      Sex: '',
      ContactNumber: '',
      // household info
      HouseholdInfo: {
        Id: 0,
        CityMun: '',
        Brgy: '',
        Zone: 0,
        Long: 0,
        Lat: 0,
      },
      // patient record
      PatientRecord: {
        Id: 0,
        PatientGuid: StringHelper.EmptyGuid(),
        StatusId: 0,
        InfectiousDiseaseId: 0,
        DateReported: '',
      },
    };

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
          SweetAlerts.ShowErrorToast('Error retreiving Diseases');
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

  private GetInfo$(): void {
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

    this.PatientDoB = DateHelper.FormatDateToShortDate(
      new Date(this.PatientInfo.DoB)
    );

    let cityMun =
      PHCityMun.RECORDS.find((cm) => {
        return cm.citymunCode == this.PatientInfo.HouseholdInfo.CityMun;
      })?.citymunDesc ?? '';
    let brgy =
      PHBrgy.RECORDS.find((b) => {
        return b.brgyCode == this.PatientInfo.HouseholdInfo.Brgy;
      })?.brgyDesc ?? '';
    let zone = this.PatientInfo.HouseholdInfo.Zone ?? '';

    this.PatientFullAddress = (
      (zone != 0 ? 'Zone ' + zone + ', ' : '') +
      (brgy.length > 0 ? brgy + ', ' : '') +
      (cityMun.length > 0 ? cityMun + ', Iloilo' : '')
    ).trim();

    let disease =
      this.Diseases.find((d) => {
        return d.Id == this.PatientInfo.PatientRecord.InfectiousDiseaseId;
      })?.Name ?? '';
    this.PatientDisease = disease.length > 0 ? disease : '';
    let status =
      this.Statuses.find((s) => {
        return s.Id == this.PatientInfo.PatientRecord.StatusId;
      })?.Name ?? '';
    this.PatientStatus = status.length > 0 ? status : '';
    this.PatientRecordDateReported = DateHelper.FormatDateToShortDate(
      new Date(this.PatientInfo.PatientRecord.DateReported)
    );
  }
}
