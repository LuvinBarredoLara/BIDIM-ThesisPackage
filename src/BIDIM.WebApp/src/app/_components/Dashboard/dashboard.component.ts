import { Component, OnInit } from '@angular/core';
import ChartsHelper from 'src/app/_shared/chartsHelper';
import { IInfectiousDisease } from 'src/app/_viewModels/PatientViewModels';
import { forkJoin } from 'rxjs';
import { DiseaseService } from 'src/app/_services/Disease/disease.service';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import {
  IDashboardData,
  IYearCasesPerMonth,
} from 'src/app/_viewModels/DashboardViewModel';
import { DashboardService } from 'src/app/_services/Dashboard/dashboard.service';
import Chart from 'chart.js/auto';
import { DateHelper } from 'src/app/_shared/helpers';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  IsLoading: boolean = false;
  Diseases: IInfectiousDisease[] = [];
  SelectedDisease = new FormControl(1);
  DashboardData: IDashboardData = {
    Population: 0,
    Infected: 0,
    Recovered: 0,
    Deceased: 0,
    YearlyCasesPerMonth: [
      { Key: 2022, Value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    ],
    MaleCasesCount: 0,
    FemaleCasesCount: 0,
    IndividualsByAge: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
  };
  individualsByAgeChart!: Chart;
  casesPerMonthChart!: Chart;
  CasePerMonthYear: number = new Date().getFullYear();
  CasePerMonthYearSelect: number[] = [];

  constructor(
    public diseaseSvc: DiseaseService,
    public dashboardSvc: DashboardService
  ) {}

  ngOnInit(): void {
    Chart.defaults.backgroundColor = '#9BD0F5';
    Chart.defaults.borderColor = '#36A2EB';
    Chart.defaults.color = '#FFFFFF';

    this.FetchData$();
  }

  private FetchData$(): void {
    this.IsLoading = true;

    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    forkJoin([
      this.diseaseSvc.GetAllActiveDropdown(),
      this.dashboardSvc.LoadDashboardData(this.SelectedDisease.value!),
    ]).subscribe({
      next: (response) => {
        if (!response[0].IsSuccess || !response[1].IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response[0].Message ?? response[1].Message ?? '';
        } else {
          this.Diseases = response[0].Data!;
          this.DashboardData = response[1].Data!;

          let ycpm = this.DashboardData.YearlyCasesPerMonth.length;
          if (ycpm > 0) {
            this.CasePerMonthYearSelect =
              this.DashboardData.YearlyCasesPerMonth.map((y) => y.Key).sort();
            this.CasePerMonthYear =
              this.DashboardData.YearlyCasesPerMonth[ycpm - 1].Key;
          }

          this.DashboardData.IndividualsByAge =
            response[1].Data!.IndividualsByAge;
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
          if (this.casesPerMonthChart) this.casesPerMonthChart.destroy();
          var patientPerMonthCanvas =
            document.getElementById('casesPerMonthChart');
          this.casesPerMonthChart = ChartsHelper.CasesPerMonth(
            patientPerMonthCanvas,
            this.DashboardData.YearlyCasesPerMonth.find(
              (ycpm) => ycpm.Key.toString() === this.CasePerMonthYear.toString()
            )!.Value
          );

          if (this.individualsByAgeChart) this.individualsByAgeChart.destroy();
          var individualByAgeCanvas = document.getElementById(
            'individualsByAgeChart'
          );
          let individualsByAgeData = this.DashboardData.IndividualsByAge;
          this.individualsByAgeChart = ChartsHelper.IndividualsByAge(
            individualByAgeCanvas,
            individualsByAgeData
          );
        }
      },
    });
  }

  ReloadDashboard(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.IsLoading = true;

      let Is200Fail: boolean = false;
      let d200FailMssg: string = '';

      this.dashboardSvc
        .LoadDashboardData(this.SelectedDisease.value!)
        .subscribe({
          next: (response) => {
            if (!response.IsSuccess) {
              Is200Fail = true;
              d200FailMssg = response.Message ?? '';
            } else {
              this.DashboardData = response.Data!;

              let ycpm = this.DashboardData.YearlyCasesPerMonth.length;
              if (ycpm > 0) {
                this.CasePerMonthYearSelect =
                  this.DashboardData.YearlyCasesPerMonth.map(
                    (y) => y.Key
                  ).sort();
                this.CasePerMonthYear =
                  this.DashboardData.YearlyCasesPerMonth[ycpm - 1].Key;
              }
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
              if (this.casesPerMonthChart) this.casesPerMonthChart.destroy();
              var patientPerMonthCanvas =
                document.getElementById('casesPerMonthChart');
              this.casesPerMonthChart = ChartsHelper.CasesPerMonth(
                patientPerMonthCanvas,
                this.DashboardData.YearlyCasesPerMonth.find(
                  (ycpm) =>
                    ycpm.Key.toString() === this.CasePerMonthYear.toString()
                )!.Value
              );

              if (this.individualsByAgeChart)
                this.individualsByAgeChart.destroy();
              var patientByAgeCanvas = document.getElementById(
                'individualsByAgeChart'
              );
              this.individualsByAgeChart = ChartsHelper.IndividualsByAge(
                patientByAgeCanvas,
                this.DashboardData.IndividualsByAge
              );
            }
          },
        });
    }
  }

  ReloadCasePerMonth(): void {
    var patientPerMonthCanvas = document.getElementById('casesPerMonthChart');
    if (this.casesPerMonthChart) this.casesPerMonthChart.destroy();
    this.casesPerMonthChart = ChartsHelper.CasesPerMonth(
      patientPerMonthCanvas,
      this.DashboardData.YearlyCasesPerMonth.find(
        (ycpm) => ycpm.Key.toString() === this.CasePerMonthYear.toString()
      )!.Value
    );
  }
}
