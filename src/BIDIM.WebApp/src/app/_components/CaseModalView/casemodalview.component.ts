import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { CaseService } from 'src/app/_services/Case/case.service';
import { DiseaseService } from 'src/app/_services/Disease/disease.service';
import { IndividualService } from 'src/app/_services/Individual/individual.service';
import StringHelper, { DateHelper } from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import {
  ICaseMonitoringViewModel,
  ICaseViewModel,
} from 'src/app/_viewModels/CaseViewModels';
import { IIndividualDropdownList } from 'src/app/_viewModels/IndividualViewModel';
import { IInfectiousDisease } from 'src/app/_viewModels/InfectiousDiseaseViewModel';

@Component({
  selector: 'app-casemodalview',
  templateUrl: './casemodalview.component.html',
  styleUrls: ['./casemodalview.component.css'],
})
export class CaseModalViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public caseGuid: string,
    private dialogRef: MatDialogRef<CaseModalViewComponent>,
    private diseaseSvc: DiseaseService,
    private individualSvc: IndividualService,
    private caseSvc: CaseService,
    private fb: FormBuilder
  ) {}

  IsLoading: boolean = false;
  CaseInfo: ICaseViewModel = {
    Guid: StringHelper.EmptyGuid(),
    Id: '',
    Outcome: '',
    OutcomeDate: new Date(),
    IndividualId: StringHelper.EmptyGuid(),
    InfectiousDiseaseId: 1,
    IsActive: true,
    CaseMonitorings: [],
  };

  Diseases: IInfectiousDisease[] = [];
  Individuals: IIndividualDropdownList[] = [];
  CaseMonitoringColumnHeaders: string[] = ['Status', 'CreatedDate'];

  CaseMonitoringList: MatTableDataSource<ICaseMonitoringViewModel> =
    new MatTableDataSource();

  CaseOutcomeDate: string = DateHelper.FormatDateToShortDate(
    this.CaseInfo.OutcomeDate
  );

  CaseIndividual: string = '';

  CaseDisease: string = '';

  ngOnInit(): void {
    this.FetchData$();
  }

  private FetchData$(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.IsLoading = true;

      let Is200Fail: boolean = false;
      let d200FailMssg: string = '';

      forkJoin([
        this.diseaseSvc.GetAllActiveDropdown(),
        this.individualSvc.GetDropdownList(),
        this.caseSvc.GetCaseInfo(this.caseGuid),
      ]).subscribe({
        next: (response) => {
          if (
            !response[0].IsSuccess ||
            !response[1].IsSuccess ||
            !response[2].IsSuccess
          ) {
            Is200Fail = true;
            d200FailMssg =
              response[0].Message ??
              response[1].Message ??
              response[2].Message ??
              '';
          } else {
            this.Diseases = response[0].Data!;
            this.Individuals = response[1].Data!;
            this.CaseInfo = response[2].Data!;
            this.CaseMonitoringList = new MatTableDataSource(
              this.CaseInfo.CaseMonitorings
            );

            this.CaseIndividual =
              this.Individuals.find((i) => i.Id == this.CaseInfo.IndividualId)
                ?.FullNameHousehold ?? '';

            this.CaseDisease =
              this.Diseases.find(
                (d) => d.Id == this.CaseInfo.InfectiousDiseaseId
              )?.Name ?? '';
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
}
