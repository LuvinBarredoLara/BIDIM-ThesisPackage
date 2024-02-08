import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { HouseholdService } from 'src/app/_services/Household/household.service';
import {
  IHouseholdDropdownList,
  IHouseholdViewModel,
} from 'src/app/_viewModels/HouseholdViewModel';
import { IPHBrgy, IPHCityMun } from 'src/app/_viewModels/PHLocsViewModel';
import PHCityMun from '../../../assets/phlocjson/refcitymun.json';
import PHBrgy from '../../../assets/phlocjson/refbrgy.json';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { MappingComponent } from '../Mapping/mapping.component';

@Component({
  selector: 'app-householdmodal',
  templateUrl: './householdmodal.component.html',
  styleUrls: ['./householdmodal.component.css'],
})
export class HouseholdModalComponent implements OnInit {
  IsLoading: boolean = false;

  // Locations
  CityMuns: IPHCityMun[] = PHCityMun.RECORDS.filter(
    (cm) => cm.provCode == '0630'
  );
  // Do not load brgys yet until user selects city
  Brgys: IPHBrgy[] = PHBrgy.RECORDS.filter((b) => b.citymunCode == '063043');

  HouseholdForm = this.fb.group({
    FamilyName: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    CityMun: new FormControl(
      {
        value: 'SANTA BARBARA',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    Brgy: new FormControl(
      {
        value: 'Balabag',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    Zone: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
    Street: new FormControl(
      {
        value: '',
        disabled: this.IsLoading,
      },
      Validators.required
    ),
  });
  HHControls = this.HouseholdForm.controls;
  HHFormSubmitted: boolean = false;

  HouseholdInfo: IHouseholdViewModel = this.NewHousehold();
  HouseholdCoordinates: number[] = [];

  HouseholdCoordinatesUpdated: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public householdSvc: HouseholdService,
    private dialogRef: MatDialogRef<HouseholdModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data.householdId !== 0) this.GetHousehold$();
  }

  CloseModal(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      if (
        this.HouseholdForm.dirty ||
        this.HouseholdForm.touched ||
        this.HouseholdCoordinatesUpdated
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

  OpenMapping(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      if (this.HHControls.CityMun.value === '') {
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
            CityMun: this.HHControls.CityMun.value,
            Brgy: this.HHControls.Brgy.value,
            HouseholdCoordinate: this.HouseholdCoordinates,
          },
        });

        dialogRef.afterClosed().subscribe((res) => {
          if (res) {
            this.HouseholdCoordinates = res.data;
            this.HouseholdCoordinatesUpdated = true;
          }
        });
      }
    }
  }

  Submit$(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.HHFormSubmitted = true;

      if (
        this.HouseholdForm.invalid ||
        this.HouseholdCoordinates.length === 0
      ) {
        SweetAlerts.ShowWarningToast('Errors found');
        return;
      } else {
        if (!this.HouseholdForm.dirty) {
          this.dialogRef.close({ shouldRefresh: false });
        } else {
          this.Upsert$();
        }
      }
    }
  }

  private GetHousehold$(): void {
    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.householdSvc.GetHousehold(this.data.householdId).subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          this.SetHousehold(response.Data!);
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

  private NewHousehold(): IHouseholdViewModel {
    return {
      Id: 0,
      FamilyName: '',
      CityMun: '',
      Brgy: '',
      Zone: '',
      Street: '',
      Long: 0,
      Lat: 0,
    };

    this.HouseholdCoordinates = [];
  }

  private SetHousehold(household: IHouseholdViewModel): void {
    this.HouseholdInfo = {
      Id: household.Id,
      FamilyName: household.FamilyName,
      CityMun: household.CityMun,
      Brgy: household.Brgy,
      Zone: household.Zone,
      Street: household.Street,
      Long: household.Long,
      Lat: household.Lat,
    };

    this.HHControls.FamilyName.setValue(household.FamilyName);
    this.HHControls.CityMun.setValue(household.CityMun);
    this.Brgys = PHBrgy.RECORDS.filter(
      (b) =>
        b.citymunCode ==
        this.CityMuns.find((cm) => {
          return cm.citymunDesc == household.CityMun;
        })?.citymunCode
    );
    this.HHControls.Brgy.setValue(household.Brgy);
    this.HHControls.Zone.setValue(household.Zone);
    this.HHControls.Street.setValue(household.Street);

    this.HouseholdCoordinates[0] = household.Long;
    this.HouseholdCoordinates[1] = household.Lat;
  }

  private Upsert$(): void {
    this.HouseholdInfo = {
      Id: this.data.householdId,
      FamilyName: this.HHControls.FamilyName.value!,
      CityMun: this.HHControls.CityMun.value!,
      Brgy: this.HHControls.Brgy.value!,
      Zone: this.HHControls.Zone.value!,
      Street: this.HHControls.Street.value!,
      Long: this.HouseholdCoordinates[0],
      Lat: this.HouseholdCoordinates[1],
    };

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    let upsertedHh: IHouseholdViewModel;

    this.IsLoading = true;
    this.householdSvc.Upsert(this.HouseholdInfo).subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          upsertedHh = response.Data!;
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
          SweetAlerts.ShowSuccessToast('Household Saved');

          if (this.data.createFromInd) {
            let hhIndObj: IHouseholdDropdownList = {
              Id: upsertedHh.Id,
              FamilyName: upsertedHh.FamilyName,
            };
            this.dialogRef.close({ data: hhIndObj });
          } else {
            this.dialogRef.close({ shouldRefresh: true });
          }
        }
      },
    });
  }

  FilterBrgyByCityMun(e: any): void {
    this.UpdateHHCoordsEvent();

    if (this.HHControls.CityMun.value === '') {
      this.Brgys = [];
      this.HHControls.Brgy.setValue('');
    } else {
      this.Brgys = PHBrgy.RECORDS.filter(
        (b) =>
          b.citymunCode ==
          this.CityMuns.find((cm) => {
            return cm.citymunDesc === this.HHControls.CityMun.value;
          })?.citymunCode
      );
      this.HHControls.Brgy.setValue(this.Brgys[0].brgyCode);
    }
  }

  UpdateHHCoordsEvent(): void {
    if (this.HouseholdCoordinates.length !== 0) {
      this.HouseholdCoordinates = [];
      this.HouseholdCoordinatesUpdated = true;
    }
  }
}
