import Chart from 'chart.js/auto';
import { ISIRData } from '../_viewModels/SIRViewModel';

export default class ChartsHelper {
  static IndividualsByAge(element: any, data: number[][]) {
    let lbls = [
      '< 15 YRS OLD',
      '15-25 YRS OLD',
      '25-34 YRS OLD',
      '35-44 YRS OLD',
      '>= 45 YRS OLD',
    ];
    let male = [data[0][0], data[1][0], data[2][0], data[3][0], data[4][0]];
    let female = [data[0][1], data[1][1], data[2][1], data[3][1], data[4][1]];
    return new Chart(element, {
      type: 'bar',
      data: {
        labels: lbls,
        datasets: [
          {
            label: 'Male',
            data: male,
            borderColor: 'rgb(70,164,108,1)',
            backgroundColor: 'rgb(70,164,108,0.2)',
            borderWidth: 2,
            borderSkipped: false,
          },
          {
            label: 'Female',
            data: female,
            borderColor: 'rgb(129,122,243,1)',
            backgroundColor: 'rgb(129,122,243,0.2)',
            borderWidth: 2,
            borderSkipped: false,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              font: {
                size: 18,
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  static CasesPerMonth(element: any, data: number[]) {
    return new Chart(element, {
      type: 'line',
      data: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'June',
          'Jul',
          'Aug',
          'Sept',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            data: data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
            labels: {
              font: {
                size: 18,
              },
            },
          },
        },
      },
    });
  }

  static StatisticsChart(element: any, data: ISIRData[], months: string[]) {
    let days: number[] = [];
    for (let i = 1; i <= 100; i++) {
      days.push(i);
    }

    let monthsLabel =
      months.length > 0
        ? months
        : [
            'January 2023',
            'February 2023',
            'March 2023',
            'April 2023',
            'May 2023',
            'June 2023',
          ];

    // let sHolder: number[] = [];
    // for (let i = 0; i < 100; i++) {
    //   sHolder.push(data.length > 0 ? data[i].Data[0] : 0);
    // }

    let iHolder: number[] = [];
    for (let i = 0; i <= 5; i++) {
      iHolder.push(data.length > 0 ? data[i].Data[1] : 0);
    }

    // let rHolder: number[] = [];
    // for (let i = 0; i < 100; i++) {
    //   rHolder.push(data.length > 0 ? data[i].Data[2] : 0);
    // }

    // let s =
    //   data.length > 0
    //     ? [
    //         data[0].Data[0],
    //         data[1].Data[0],
    //         data[2].Data[0],
    //         data[3].Data[0],
    //         data[4].Data[0],
    //         data[5].Data[0],
    //         data[6].Data[0],
    //         data[7].Data[0],
    //         data[8].Data[0],
    //         data[9].Data[0],
    //         data[10].Data[0],
    //         data[11].Data[0],
    //       ]
    //     : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // let i =
    //   data.length > 0
    //     ? [
    //         data[0].Data[1],
    //         data[1].Data[1],
    //         data[2].Data[1],
    //         data[3].Data[1],
    //         data[4].Data[1],
    //         data[5].Data[1],
    //         data[6].Data[1],
    //         data[7].Data[1],
    //         data[8].Data[1],
    //         data[9].Data[1],
    //         data[10].Data[1],
    //         data[11].Data[1],
    //       ]
    //     : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // let r =
    //   data.length > 0
    //     ? [
    //         data[0].Data[2],
    //         data[1].Data[2],
    //         data[2].Data[2],
    //         data[3].Data[2],
    //         data[4].Data[2],
    //         data[5].Data[2],
    //         data[6].Data[2],
    //         data[7].Data[2],
    //         data[8].Data[2],
    //         data[9].Data[2],
    //         data[10].Data[2],
    //         data[11].Data[2],
    //       ]
    //     : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    return new Chart(element, {
      type: 'line',
      data: {
        // labels: [
        //   'Jan',
        //   'Feb',
        //   'Mar',
        //   'Apr',
        //   'May',
        //   'Jun',
        //   'Jul',
        //   'Aug',
        //   'Sept',
        //   'Oct',
        //   'Nov',
        //   'Dec',
        // ],
        labels: monthsLabel,
        datasets: [
          /*{
            label: 'Susceptible',
            data: sHolder,
            fill: false,
            borderColor: 'rgb(15, 10, 222)',
            tension: 0.1,
          },*/
          {
            label: 'Infected',
            data: iHolder,
            fill: false,
            borderColor: 'rgb(242, 38, 19)',
            tension: 0.1,
          },
          /*{
            label: 'Removed',
            data: rHolder,
            fill: false,
            borderColor: 'rgb(178, 222, 39)',
            tension: 0.1,
          },*/
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              font: {
                size: 18,
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Monthly Projection',
              font: {
                size: 15,
                weight: 'bold',
              },
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Active Cases',
              font: {
                size: 15,
                weight: 'bold',
              },
            },
          },
        },
      },
    });
  }
}
