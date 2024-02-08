import { environment } from 'src/environments/environment';
const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

export class CaseHelper {
  private static GetBase64Image(url: string, callback: any): void {
    url += '/assets/images/logo_cropped.png';

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  public static PrintCases(docInfo: any, docDetail: any): void {
    this.GetBase64Image(
      environment.APP_URL + (environment.production ? '/BIDIMApp' : ''),
      (dataUrl: any) => {
        var docDefinition = {
          info: docInfo,
          pageMargins: [20, 20, 20, 175],
          pageSize: {
            width: 5.5 * 72,
            height: 8.5 * 72,
          },
          pageOrientation: 'portrait',
          footer: function (currentPage: number, pageCount: number) {
            return {
              columns: [
                {
                  text: 'Page ' + currentPage.toString() + ' of ' + pageCount,
                  fontSize: 8,
                  alignment: 'center',
                  margin: [0, 150, 0, 0],
                },
              ],
            };
          },
          watermark: {
            text: 'Confidential Data',
            color: 'black',
            opacity: 0.1,
            bold: true,
            italics: false,
            fontSize: 50,
            angle: 310,
          },
          content: [
            {
              image: dataUrl,
              width: 70,
              height: 70,
              alignment: 'center',
              margin: [0, 0, 0, 0],
            },
            {
              text: 'Brgy. Infectious Diseases\nManagement Information System',
              style: 'header',
              fontSize: 11,
              bold: true,
              alignment: 'center',
              margin: [0, 0, 0, 5],
            },
            {
              text: 'Cases',
              style: 'header',
              fontSize: 15,
              bold: true,
              alignment: 'center',
              margin: [0, 0, 0, 5],
            },
            {
              columns: [
                {
                  table: {
                    widths: ['13%', '40%', '17%', '15%', '15%'],
                    headerRows: 1,
                    body: docDetail.body,
                  },
                  layout: {
                    hLineWidth: function (i: number, node: any) {
                      return i === 0 || i === 1 ? 3 : 1;
                    },
                    hLineColor: function (i: number, node: any) {
                      return i === 0 || i === 1 ? 'black' : 'gray';
                    },
                    vLineWidth: function (i: number, node: any) {
                      return 0;
                    },
                    vLineColor: function (i: number, node: any) {
                      return 'white';
                    },
                  },
                },
              ],
            },
          ],
          styles: {
            tableHeader: {
              fontSize: 10,
              bold: true,
              alignment: 'center',
            },
            tableData: {
              fontSize: 7,
              alignment: 'center',
            },
          },
        };

        pdfMake.createPdf(docDefinition).print();
      }
    );
  }
}
