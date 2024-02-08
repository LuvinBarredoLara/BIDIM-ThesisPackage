import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { CaseService } from 'src/app/_services/Case/case.service';
import { DiseaseService } from 'src/app/_services/Disease/disease.service';
import { IndividualService } from 'src/app/_services/Individual/individual.service';
import StringHelper, { DateHelper } from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import {
  ICaseMonitoringDialogueParams,
  ICaseMonitoringViewModel,
  ICaseViewModel,
} from 'src/app/_viewModels/CaseViewModels';
import { IIndividualDropdownList } from 'src/app/_viewModels/IndividualViewModel';
import { IInfectiousDisease } from 'src/app/_viewModels/InfectiousDiseaseViewModel';
import { CaseMonitoringModalComponent } from '../CaseMonitoringModal/casemonitoringmodal.component';

@Component({
  selector: 'app-casemodal',
  templateUrl: './casemodal.component.html',
  styleUrls: ['./casemodal.component.css'],
})
export class CaseModalComponent implements OnInit {
  IsLoading: boolean = false;

  CaseInfo: ICaseViewModel = this.NewCase();

  CaseForm = this.fb.group({
    Id: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    Outcome: new FormControl({
      value: 'NEW',
      disabled: this.IsLoading,
    }),
    OutcomeDate: new FormControl({
      value: DateHelper.FormatDateToShortDate(new Date()),
      disabled: this.IsLoading,
    }),
    Individual: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    InfectiousDisease: new FormControl(
      {
        value: 0,
        disabled: this.IsLoading,
      },
      Validators.min(1)
    ),
  });
  CaseControls = this.CaseForm.controls;
  CaseFormSubmitted: boolean = false;

  Individuals: IIndividualDropdownList[] = [];
  filteredIndividuals!: Observable<IIndividualDropdownList[]>;
  SelectedIndividualInvalid: boolean = true;

  Diseases: IInfectiousDisease[] = [];

  CaseMonitoringColumnHeaders: string[] = ['Status', 'CreatedDate', 'Options'];

  CaseMonitoringList: MatTableDataSource<ICaseMonitoringViewModel> =
    new MatTableDataSource();

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public caseSvc: CaseService,
    public individualSvc: IndividualService,
    public infectiousDiseaseSvc: DiseaseService,
    private dialogRef: MatDialogRef<CaseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public caseId: string
  ) {}

  ngOnInit(): void {
    this.FetchData$();

    this.filteredIndividuals = this.CaseControls.Individual.valueChanges.pipe(
      startWith(''),
      map((individual) =>
        individual
          ? this._filterIndividuals(individual || '')
          : this.Individuals.slice()
      )
    );
  }

  CloseModal(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      if (this.CaseForm.dirty || this.CaseForm.touched) {
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
      this.CaseFormSubmitted = true;

      if (this.CaseForm.invalid) {
        SweetAlerts.ShowWarningToast('Errors found');
        return;
      } else {
        if (!this.CaseForm.dirty) {
          this.dialogRef.close({ shouldRefresh: false });
        } else {
          this.Upsert$();
        }
      }
    }
  }

  private FetchData$(): void {
    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    forkJoin([
      this.infectiousDiseaseSvc.GetAllActiveDropdown(),
      this.individualSvc.GetDropdownList(),
    ]).subscribe({
      next: (response) => {
        if (!response[0].IsSuccess || !response[1].IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response[0].Message ?? response[1].Message ?? '';
        } else {
          this.Diseases = response[0].Data!;
          this.Individuals = response[1].Data!;
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
          this.dialogRef.close();
        } else {
          if (this.caseId !== StringHelper.EmptyGuid()) this.GetCaseInfo$();
        }
      },
    });
  }

  private GetCaseInfo$(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.IsLoading = true;

      let Is200Fail = false;
      let d200FailMssg = '';
      this.caseSvc.GetCaseInfo(this.caseId).subscribe({
        next: (response) => {
          if (!response.IsSuccess) {
            Is200Fail = true;
            d200FailMssg = response.Message ?? '';
          } else {
            this.SetCase(response.Data!);
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

  private Upsert$(): void {
    let selectedIndividual = this.Individuals.find((i) => {
      return (
        i.FullNameHousehold.toLowerCase().replace(/\s/g, '') ===
        this.CaseControls.Individual.value?.toLowerCase().replace(/\s/g, '')
      );
    });

    if (selectedIndividual === undefined) {
      SweetAlerts.ShowWarningToast('Invalid Individual Selected');
      return;
    }

    if (this.CaseMonitoringList.data.length === 0) {
      SweetAlerts.ShowWarningToast('No Monitorings Recorded');
      return;
    }

    this.CaseInfo = {
      Guid: this.caseId,
      Id: this.CaseControls.Id.value!,
      Outcome: '', // Will set in backend
      OutcomeDate: new Date(), // Will set in backend
      IndividualId: selectedIndividual.Id,
      InfectiousDiseaseId: this.CaseControls.InfectiousDisease.value!,
      IsActive: true,
      CaseMonitorings: this.CaseMonitoringList.data,
    };

    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.caseSvc.Upsert(this.CaseInfo).subscribe({
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
          SweetAlerts.ShowWarningToast(d200FailMssg);
          return;
        } else {
          SweetAlerts.ShowSuccessToast(
            this.caseId === StringHelper.EmptyGuid()
              ? 'Case Recorded'
              : 'Case Updated'
          );
          this.dialogRef.close({ shouldRefresh: true });
        }
      },
    });
  }

  private NewCase(): ICaseViewModel {
    return {
      Guid: StringHelper.EmptyGuid(),
      Id: '',
      Outcome: '',
      OutcomeDate: new Date(),
      IndividualId: StringHelper.EmptyGuid(),
      InfectiousDiseaseId: 1,
      IsActive: true,
      CaseMonitorings: [],
    };
  }

  private SetCase(caseInfo: ICaseViewModel): void {
    this.CaseInfo = {
      Guid: caseInfo.Guid,
      Id: caseInfo.Id,
      Outcome: caseInfo.Outcome,
      OutcomeDate: caseInfo.OutcomeDate,
      IndividualId: caseInfo.IndividualId,
      InfectiousDiseaseId: caseInfo.InfectiousDiseaseId,
      IsActive: caseInfo.IsActive,
      CaseMonitorings: caseInfo.CaseMonitorings,
    };

    this.CaseControls.Id.setValue(caseInfo.Id);
    this.CaseControls.Outcome.setValue(caseInfo.Outcome);
    this.CaseControls.OutcomeDate.setValue(
      DateHelper.FormatDateToShortDate(new Date(caseInfo.OutcomeDate))
    );

    let selectedIndividual = this.Individuals.find((i) => {
      return i.Id == caseInfo.IndividualId;
    });

    if (selectedIndividual !== undefined)
      this.CaseControls.Individual.setValue(
        selectedIndividual.FullNameHousehold
      );

    this.CaseControls.InfectiousDisease.setValue(caseInfo.InfectiousDiseaseId);

    let caseMonitorings: ICaseMonitoringViewModel[] = [];
    caseInfo.CaseMonitorings.forEach((cm) => {
      caseMonitorings.push({
        Id: cm.Id,
        Symptoms: cm.Symptoms,
        Remarks: cm.Remarks,
        CreatedDate: cm.CreatedDate,
        CaseGuid: cm.CaseGuid,
        Status: cm.Status,
        IsActive: cm.IsActive,
        TempId: 0,
      });
    });
    if (caseMonitorings.length > 0)
      this.CaseMonitoringList = new MatTableDataSource(caseMonitorings);
  }

  private _filterIndividuals(value: string): IIndividualDropdownList[] {
    const filterValue = value.toLowerCase().replace(/\s/g, '');

    return this.Individuals.filter((i) =>
      i.FullNameHousehold.toLowerCase().replace(/\s/g, '').includes(filterValue)
    );
  }

  AddCaseMonitoring(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      let exists = this.CaseMonitoringList.data.some(
        (cm) => cm.Status.toLowerCase() === 'deceased'
      );
      if (exists) {
        SweetAlerts.ShowMessage(
          'warning',
          'Case outcome was marked as Deceased',
          ''
        );
        return;
      } else {
        this.InitializeCaseMonitoringModal(0, 0);
      }
    }
  }

  EditCaseMonitoring(cmId: number, cmTempId: number): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.InitializeCaseMonitoringModal(cmId, cmTempId);
    }
  }

  private InitializeCaseMonitoringModal(cmId: number, cmTempId: number): void {
    // Init object to pass into cm dialogue
    let cmParamsObj: ICaseMonitoringDialogueParams = {
      cmList: this.CaseMonitoringList.data,
      cmId: cmId,
      cmTempId: cmTempId,
      isUpdated: false,
    };

    const dialogRef = this.dialog.open(CaseMonitoringModalComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: cmParamsObj,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.data.isUpdated) {
        this.CaseForm.markAsDirty();
        this.CaseMonitoringList = new MatTableDataSource(res.data.cmList);
      }
    });
  }
}
