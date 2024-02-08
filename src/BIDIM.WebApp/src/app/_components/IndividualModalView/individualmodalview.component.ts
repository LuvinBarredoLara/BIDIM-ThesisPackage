import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { HouseholdService } from 'src/app/_services/Household/household.service';
import { IndividualService } from 'src/app/_services/Individual/individual.service';
import StringHelper, { DateHelper } from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IHouseholdDropdownList } from 'src/app/_viewModels/HouseholdViewModel';
import { IIndividualViewModel } from 'src/app/_viewModels/IndividualViewModel';

@Component({
  selector: 'app-individualmodalview',
  templateUrl: './individualmodalview.component.html',
  styleUrls: ['./individualmodalview.component.css'],
})
export class IndividualModalViewComponent implements OnInit {
  IsLoading: boolean = false;
  IndividualInfo: IIndividualViewModel = {
    Id: StringHelper.EmptyGuid(),
    FirstName: '',
    LastName: '',
    DoB: '01/01/2001',
    Age: 0,
    Gender: 'Male',
    ContactNumber: '',
    HouseholdId: 0,
    IsActive: true,
    IsDeceasedByDisease: false,
  };
  Households: IHouseholdDropdownList[] = [];
  DoB: string = '';
  SelectedHousehold: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public individualId: string,
    private dialogRef: MatDialogRef<IndividualModalViewComponent>,
    public householdSvc: HouseholdService,
    public individualSvc: IndividualService
  ) {}

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
        this.householdSvc.GetDropdownList(),
        this.individualSvc.GetIndividual(this.individualId),
      ]).subscribe({
        next: (response) => {
          if (!response[0].IsSuccess || !response[1].IsSuccess) {
            Is200Fail = true;
            d200FailMssg = response[0].Message ?? response[1].Message ?? '';
          } else {
            this.Households = response[0].Data!;
            this.IndividualInfo = response[1].Data!;

            this.SelectedHousehold =
              this.Households.find((h) => {
                return h.Id == this.IndividualInfo.HouseholdId;
              })?.FamilyName ?? '';

            this.DoB = DateHelper.FormatDateToShortDate(
              new Date(this.IndividualInfo.DoB)
            );
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
