import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import StringHelper, {
  CommonHelper,
  DateHelper,
} from 'src/app/_shared/helpers';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import {
  ICaseMonitoringDialogueParams,
  ICaseMonitoringViewModel,
} from 'src/app/_viewModels/CaseViewModels';

@Component({
  selector: 'app-casemonitoringmodal',
  templateUrl: './casemonitoringmodal.component.html',
  styleUrls: ['./casemonitoringmodal.component.css'],
})
export class CaseMonitoringModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<CaseMonitoringModalComponent>,
    @Inject(MAT_DIALOG_DATA) public cmParams: ICaseMonitoringDialogueParams
  ) {}

  CaseMonitoringForm = this.fb.group({
    Status: new FormControl('', Validators.required),
    CreatedDate: new FormControl(new Date()),
    Symptoms: new FormControl(''),
    Remarks: new FormControl(''),
  });
  CMControls = this.CaseMonitoringForm.controls;
  CMFormSubmitted: boolean = false;

  ngOnInit(): void {
    this.SetCaseMonitoring();
  }

  CloseModal(): void {
    if (this.CaseMonitoringForm.dirty || this.CaseMonitoringForm.touched) {
      SweetAlerts.AskQuestion(
        'Changes made will not be saved',
        'Proceed?'
      ).then((response) => {
        if (response.value) {
          this.dialogRef.close({ data: this.cmParams });
        }
      });
    } else {
      this.dialogRef.close({ data: this.cmParams });
    }
  }

  Submit$(): void {
    this.CMFormSubmitted = true;

    if (!this.CaseMonitoringForm.valid) {
      SweetAlerts.ShowWarningToast('Errors found');
      return;
    } else {
      if (this.CaseMonitoringForm.dirty) {
        switch (this.CMControls.Status.value?.toLowerCase()) {
          case 'recovered':
            this.HandleRecovered();
            break;
          case 'deceased':
            this.HandleDeceased();
            break;
          default:
            this.HandleDefault();
            break;
        }
      }
    }
  }

  private SetCaseMonitoring(): void {
    if (this.cmParams.cmId !== 0 || this.cmParams.cmTempId !== 0) {
      let cmToEdit;
      if (this.cmParams.cmId !== 0) {
        cmToEdit = this.cmParams.cmList.find(
          (cm) => cm.Id === this.cmParams.cmId
        );
      } else {
        cmToEdit = this.cmParams.cmList.find(
          (cm) => cm.TempId === this.cmParams.cmTempId
        );
      }
      if (cmToEdit !== undefined) {
        this.CMControls.Status.setValue(cmToEdit.Status);
        this.CMControls.CreatedDate.setValue(new Date(cmToEdit.CreatedDate));
        this.CMControls.Symptoms.setValue(cmToEdit.Symptoms);
        this.CMControls.Remarks.setValue(cmToEdit.Remarks);
      }
    }
  }

  private InitializeCaseMonitoring(): ICaseMonitoringViewModel {
    let isNew: boolean =
      this.cmParams.cmId === 0 && this.cmParams.cmTempId === 0;

    if (isNew) {
      return {
        Id: 0,
        Symptoms: this.CMControls.Symptoms.value!,
        Remarks: this.CMControls.Remarks.value!,
        CreatedDate: DateHelper.FormatDateToShortDate(
          this.CMControls.CreatedDate.value!
        ),
        CaseGuid: StringHelper.EmptyGuid(),
        Status: this.CMControls.Status.value!,
        IsActive: true,
        TempId: CommonHelper.GetLatestTempId(this.cmParams.cmList),
      };
    } else {
      let oldcmObj = this.cmParams.cmList.find((cm) => {
        return this.cmParams.cmId === 0
          ? cm.TempId === this.cmParams.cmTempId
          : cm.Id === this.cmParams.cmId;
      });

      if (oldcmObj !== undefined) {
        return {
          Id: this.cmParams.cmId,
          Symptoms: this.CMControls.Symptoms.value!,
          Remarks: this.CMControls.Remarks.value!,
          CreatedDate: DateHelper.FormatDateToShortDate(
            this.CMControls.CreatedDate.value!
          ),
          CaseGuid: oldcmObj.CaseGuid,
          Status: this.CMControls.Status.value!,
          IsActive: oldcmObj.IsActive,
          TempId: this.cmParams.cmTempId,
        };
      } else {
        SweetAlerts.ShowWarningToast('Error Initializing Monitoring');
        return {
          Id: 0,
          Symptoms: this.CMControls.Symptoms.value!,
          Remarks: this.CMControls.Remarks.value!,
          CreatedDate: DateHelper.FormatDateToShortDate(
            this.CMControls.CreatedDate.value!
          ),
          CaseGuid: StringHelper.EmptyGuid(),
          Status: this.CMControls.Status.value!,
          IsActive: true,
          TempId: CommonHelper.GetLatestTempId(this.cmParams.cmList),
        };
      }
    }
  }

  private CheckMonitoringIfLatest(): boolean {
    let retVal: boolean = false;

    if (this.cmParams.cmList.length > 0) {
      let sortedListByDateAsc = this.cmParams.cmList.sort(
        (a, b) =>
          new Date(a.CreatedDate).setHours(0, 0, 0) -
          new Date(b.CreatedDate).setHours(0, 0, 0)
      );
      let latestObj = sortedListByDateAsc[sortedListByDateAsc.length - 1];

      let isNew = this.cmParams.cmId === 0 && this.cmParams.cmTempId === 0;

      if (isNew) {
        // Check if date is greater than latest object date
        if (
          this.CMControls.CreatedDate.value! > new Date(latestObj.CreatedDate)
        ) {
          retVal = true;
        } else {
          retVal = false;
        }
      } else {
        // Check if date is less than latest object date
        if (
          this.CMControls.CreatedDate.value! < new Date(latestObj.CreatedDate)
        ) {
          // Check if latest object is what we're currently editing
          if (
            latestObj.Id === this.cmParams.cmId &&
            latestObj.TempId === this.cmParams.cmTempId
          ) {
            retVal = true;
          } else {
            retVal = false;
          }
        } else {
          retVal = true;
        }
      }
    } else retVal = true;

    return retVal;
  }

  private HandleUpsert(): void {
    let upsertCm = this.InitializeCaseMonitoring();
    let isNew = this.cmParams.cmId === 0 && this.cmParams.cmTempId === 0;
    if (isNew) {
      this.cmParams.cmList.push(upsertCm);
    } else {
      let oldCm = this.cmParams.cmList.find((cm) => {
        return (
          cm.Id == this.cmParams.cmId && this.cmParams.cmTempId == cm.TempId
        );
      });
      let oldCmIndex = this.cmParams.cmList.indexOf(oldCm!);
      this.cmParams.cmList[oldCmIndex] = upsertCm;
    }

    this.cmParams.isUpdated = true;
  }

  private HandleDefault(): void {
    this.HandleUpsert();

    setTimeout(() => {
      SweetAlerts.ShowSuccessToast(
        'Monitoring ' + (this.cmParams.cmId == 0 && this.cmParams.cmTempId == 0)
          ? 'Added'
          : 'Saved'
      );
      this.cmParams.cmList = this.cmParams.cmList.sort(
        (a, b) =>
          new Date(a.CreatedDate).setHours(0, 0, 0) -
          new Date(b.CreatedDate).setHours(0, 0, 0)
      );
      this.dialogRef.close({ data: this.cmParams });
    }, 500);
  }

  private HandleRecovered(): void {
    // Check if latest
    if (this.CheckMonitoringIfLatest()) {
      SweetAlerts.AskQuestion(
        'This will mark the outcome Recovered',
        'Proceed?'
      ).then((response) => {
        if (response.value) {
          this.HandleUpsert();

          setTimeout(() => {
            SweetAlerts.ShowSuccessToast(
              'Monitoring ' +
                (this.cmParams.cmId == 0 && this.cmParams.cmTempId == 0)
                ? 'Added'
                : 'Saved'
            );
            this.cmParams.cmList = this.cmParams.cmList.sort(
              (a, b) =>
                new Date(a.CreatedDate).setHours(0, 0, 0) -
                new Date(b.CreatedDate).setHours(0, 0, 0)
            );
            this.dialogRef.close({ data: this.cmParams });
          }, 500);
        }
      });
    } else {
      this.HandleUpsert();

      setTimeout(() => {
        SweetAlerts.ShowSuccessToast(
          'Monitoring ' +
            (this.cmParams.cmId == 0 && this.cmParams.cmTempId == 0)
            ? 'Added'
            : 'Saved'
        );
        this.dialogRef.close({ data: this.cmParams });
      }, 500);
    }
  }

  private HandleDeceased(): void {
    // Check if latest
    if (this.CheckMonitoringIfLatest()) {
      SweetAlerts.AskQuestion(
        'This will mark the outcome Deceased\nand cannot add new Monitorings',
        'Proceed?'
      ).then((response) => {
        if (response.value) {
          this.HandleUpsert();

          setTimeout(() => {
            SweetAlerts.ShowSuccessToast(
              'Monitoring ' +
                (this.cmParams.cmId == 0 && this.cmParams.cmTempId == 0)
                ? 'Added'
                : 'Saved'
            );
            this.cmParams.cmList = this.cmParams.cmList.sort(
              (a, b) =>
                new Date(a.CreatedDate).setHours(0, 0, 0) -
                new Date(b.CreatedDate).setHours(0, 0, 0)
            );
            this.dialogRef.close({ data: this.cmParams });
          }, 500);
        }
      });
    } else {
      SweetAlerts.ShowMessage(
        'warning',
        'Deceased status with earlier date is invalid',
        ''
      );
      return;
    }
  }
}
