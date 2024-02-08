import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HouseholdService } from 'src/app/_services/Household/household.service';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IHouseholdViewModel } from 'src/app/_viewModels/HouseholdViewModel';

@Component({
  selector: 'app-householdmodalview',
  templateUrl: './householdmodalview.component.html',
  styleUrls: ['./householdmodalview.component.css'],
})
export class HouseholdModalViewComponent implements OnInit {
  IsLoading: boolean = false;
  HouseholdInfo: IHouseholdViewModel = {
    Id: 0,
    FamilyName: '',
    CityMun: '',
    Brgy: '',
    Zone: '',
    Street: '',
    Long: 0,
    Lat: 0,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public householdId: number,
    private dialogRef: MatDialogRef<HouseholdModalViewComponent>,
    public householdSvc: HouseholdService
  ) {}

  ngOnInit(): void {
    this.GetInfo$();
  }

  private GetInfo$(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.IsLoading = true;

      let Is200Fail: boolean = false;
      let d200FailMssg: string = '';
      this.householdSvc.GetHousehold(this.householdId).subscribe({
        next: (response) => {
          if (!response.IsSuccess) {
            Is200Fail = true;
            d200FailMssg = response.Message ?? '';
          } else {
            this.HouseholdInfo = response.Data!;
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
