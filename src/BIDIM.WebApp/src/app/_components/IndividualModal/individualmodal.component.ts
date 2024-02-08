import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { HouseholdService } from 'src/app/_services/Household/household.service';
import { IndividualService } from 'src/app/_services/Individual/individual.service';
import StringHelper, { DateHelper } from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IHouseholdDropdownList } from 'src/app/_viewModels/HouseholdViewModel';
import { IIndividualViewModel } from 'src/app/_viewModels/IndividualViewModel';
import { HouseholdModalComponent } from '../HouseholdModal/householdmodal.component';

@Component({
  selector: 'app-individualmodal',
  templateUrl: './individualmodal.component.html',
  styleUrls: ['./individualmodal.component.css'],
})
export class IndividualModalComponent implements OnInit {
  IsLoading: boolean = false;

  IndividualInfo: IIndividualViewModel = this.NewIndividual();

  IndividualForm = this.fb.group({
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
    DoB: new FormControl(
      {
        value: new Date(),
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    Age: new FormControl(
      {
        value: 0,
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    Gender: new FormControl(
      {
        value: 'Male',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    ContactNumber: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    IsActive: new FormControl(
      {
        value: true,
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    IsDeceasedByDisease: new FormControl(
      {
        value: false,
        disabled: this.IsLoading,
      },
      Validators.required
    ),
  });
  IndControls = this.IndividualForm.controls;
  IndFormSubmitted: boolean = false;

  Households: IHouseholdDropdownList[] = [];

  SelectedHouseholdName = new FormControl(
    {
      value: '',
      disabled: this.IsLoading,
    },
    Validators.required
  );

  filteredHouseholds!: Observable<IHouseholdDropdownList[]>;

  SelectedHouseholdInvalid: boolean = true;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public individualSvc: IndividualService,
    public householdSvc: HouseholdService,
    private dialogRef: MatDialogRef<IndividualModalComponent>,
    @Inject(MAT_DIALOG_DATA) public individualId: string
  ) {}

  ngOnInit(): void {
    this.FetchData$();

    this.filteredHouseholds = this.SelectedHouseholdName.valueChanges.pipe(
      startWith(''),
      map((household) =>
        household
          ? this._filterHouseholds(household || '')
          : this.Households.slice()
      )
    );
  }

  CloseModal(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      if (
        this.IndividualForm.dirty ||
        this.IndividualForm.touched ||
        this.SelectedHouseholdName.dirty ||
        this.SelectedHouseholdName.touched
      ) {
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
      this.IndFormSubmitted = true;

      if (this.IndividualForm.invalid) {
        SweetAlerts.ShowWarningToast('Errors found');
        return;
      } else {
        if (!this.IndividualForm.dirty && !this.SelectedHouseholdName.dirty) {
          this.dialogRef.close({ shouldRefresh: false });
        } else {
          this.Upsert$();
        }
      }
    }
  }

  CalculateAge(event: MatDatepickerInputEvent<Date>): void {
    try {
      let timeDiff = Math.abs(Date.now() - new Date(event.value!).getTime());
      let age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
      this.IndControls.Age.setValue(age);
    } catch (error) {
      this.IndControls.Age.setValue(0);
    }
  }

  AddHousehold(): void {
    this.InitializeHouseholdModal();
  }

  UpdateByDiseaseCheckBox(): void {
    let iav = this.IndControls.IsActive.value ?? true;
    if (iav) this.IndControls.IsDeceasedByDisease.setValue(false);
  }

  UpdateIsActiveCheckBox(): void {
    let idbd = this.IndControls.IsDeceasedByDisease.value ?? true;
    if (idbd) this.IndControls.IsActive.setValue(false);
  }

  private FetchData$(): void {
    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.householdSvc.GetDropdownList().subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          this.Households = response.Data ?? [];
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
          if (this.individualId !== StringHelper.EmptyGuid())
            this.GetIndividual$();
        }
      },
    });
  }

  private GetIndividual$(): void {
    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.individualSvc.GetIndividual(this.individualId).subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          this.SetIndividual(response.Data!);
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
          this.dialogRef.close({ shouldRefresh: false });
        }
      },
    });
  }

  private Upsert$(): void {
    let selectedHouseholdObj = this.Households.find((h) => {
      return (
        this.SelectedHouseholdName.value?.toLowerCase() ===
        h.FamilyName.toLowerCase()
      );
    });

    if (selectedHouseholdObj === undefined) {
      SweetAlerts.ShowWarningToast('Invalid Household Selected');
      return;
    }

    this.IndividualInfo = {
      Id: this.individualId,
      FirstName: this.IndControls.FirstName.value!,
      LastName: this.IndControls.LastName.value!,
      DoB: DateHelper.FormatDateToShortDate(this.IndControls.DoB.value!),
      Age: this.IndControls.Age.value!,
      Gender: this.IndControls.Gender.value!,
      ContactNumber: this.IndControls.ContactNumber.value!,
      HouseholdId: selectedHouseholdObj.Id,
      IsActive: this.IndControls.IsActive.value!,
      IsDeceasedByDisease: this.IndControls.IsDeceasedByDisease.value!,
    };

    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.individualSvc.Upsert(this.IndividualInfo).subscribe({
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
          SweetAlerts.ShowSuccessToast('Individual Saved');
          this.dialogRef.close({ shouldRefresh: true });
        }
      },
    });
  }

  private NewIndividual(): IIndividualViewModel {
    return {
      Id: StringHelper.EmptyGuid(),
      FirstName: '',
      LastName: '',
      DoB: DateHelper.FormatDateToShortDate(new Date()),
      Age: 0,
      Gender: 'Male',
      ContactNumber: '',
      HouseholdId: 1,
      IsActive: true,
      IsDeceasedByDisease: false,
    };
  }

  private SetIndividual(ind: IIndividualViewModel): void {
    this.IndividualInfo = {
      Id: ind.Id,
      FirstName: ind.FirstName,
      LastName: ind.LastName,
      DoB: ind.DoB,
      Age: ind.Age,
      Gender: ind.Gender,
      ContactNumber: ind.ContactNumber,
      HouseholdId: ind.HouseholdId,
      IsActive: ind.IsActive,
      IsDeceasedByDisease: ind.IsDeceasedByDisease,
    };

    this.IndControls.FirstName.setValue(ind.FirstName);
    this.IndControls.LastName.setValue(ind.LastName);
    this.IndControls.DoB.setValue(new Date(ind.DoB));
    this.IndControls.Age.setValue(ind.Age);
    this.IndControls.Gender.setValue(ind.Gender);
    this.IndControls.ContactNumber.setValue(ind.ContactNumber);
    this.IndControls.IsActive.setValue(ind.IsActive);
    this.IndControls.IsDeceasedByDisease.setValue(ind.IsDeceasedByDisease);

    let selectedHouseholdObj = this.Households.find((h) => {
      return ind.HouseholdId === h.Id;
    });

    if (selectedHouseholdObj === undefined) {
      SweetAlerts.ShowWarningToast('Invalid Household Selected');
      return;
    }

    this.SelectedHouseholdName.setValue(selectedHouseholdObj.FamilyName);
  }

  private _filterHouseholds(value: string): IHouseholdDropdownList[] {
    const filterValue = value.toLowerCase().replace(/\s/g, '');

    return this.Households.filter((h) =>
      h.FamilyName.toLowerCase().replace(/\s/g, '').includes(filterValue)
    );
  }

  private InitializeHouseholdModal(): void {
    const dialogRef = this.dialog.open(HouseholdModalComponent, {
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      hasBackdrop: true,
      width: '700px',
      autoFocus: false,
      data: { householdId: 0, createFromInd: true },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.data !== undefined) {
        this.Households.push(res.data);

        this.SelectedHouseholdName.setValue(res.data.FamilyName);
      }
    });
  }
}
