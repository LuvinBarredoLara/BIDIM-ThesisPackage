import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { forkJoin } from 'rxjs';
import { DiseaseService } from 'src/app/_services/Disease/disease.service';
import { StatisticsService } from 'src/app/_services/Statistics/statistics.service';
import ChartsHelper from 'src/app/_shared/chartsHelper';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { IInfectiousDisease } from 'src/app/_viewModels/PatientViewModels';
import { ISIRData, IStatisticsData } from 'src/app/_viewModels/SIRViewModel';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit {
  IsLoading: boolean = false;
  SelectedYear: number = 2022;
  Diseases: IInfectiousDisease[] = [];
  SelectedDiseaseId: number = 1;
  StatisticsData: IStatisticsData = {
    SIRData: [],
    SIRMonthProjections: [],
    InfectionRate: 0,
    RecoveryRate: 0,
  };
  private StatisticsChart!: Chart;

  constructor(
    public diseaseSvc: DiseaseService,
    public statsSvc: StatisticsService
  ) {}

  ngOnInit(): void {
    Chart.defaults.backgroundColor = '#9BD0F5';
    Chart.defaults.borderColor = '#36A2EB';
    Chart.defaults.color = '#FFFFFF';

    // Load up diseases dropdown
    this.IsLoading = true;
    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    forkJoin([
      this.diseaseSvc.GetAllActiveDropdown(),
      this.statsSvc.GetSIRDataByFilter(this.SelectedDiseaseId),
    ]).subscribe({
      next: (response) => {
        if (!response[0].IsSuccess || !response[1].IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response[0].Message ?? response[1].Message ?? '';
        } else {
          this.Diseases = response[0].Data!;
          this.StatisticsData = response[1].Data!;
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
          this.SetData(
            this.StatisticsData.SIRData,
            this.StatisticsData.SIRMonthProjections
          );
        }
      },
    });
  }

  LoadData$(): void {
    if (this.IsLoading) {
      SweetAlerts.ShowLoadingToast();
      return;
    } else {
      this.IsLoading = true;
      let Is200Fail: boolean = false;
      let d200FailMssg: string = '';
      // Get statistics data
      this.statsSvc.GetSIRDataByFilter(this.SelectedDiseaseId).subscribe({
        next: (response) => {
          if (!response.IsSuccess) {
            Is200Fail = true;
            d200FailMssg = response.Message ?? '';
          } else {
            this.StatisticsData = response.Data!;
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
            this.SetData(
              this.StatisticsData.SIRData,
              this.StatisticsData.SIRMonthProjections
            );
          }
        },
      });
    }
  }

  private SetData(data: ISIRData[], months: string[]): void {
    var statisticsChart = document.getElementById('statisticsChart');
    if (this.StatisticsChart) this.StatisticsChart.destroy();
    this.StatisticsChart = ChartsHelper.StatisticsChart(
      statisticsChart,
      data,
      months
    );
  }
}
