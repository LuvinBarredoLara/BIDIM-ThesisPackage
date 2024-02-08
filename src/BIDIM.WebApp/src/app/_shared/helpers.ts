export default class StringHelper {
  static ReplaceNonAlphaNumericWithSpace(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, ' ').toLowerCase();
  }

  static EmptyGuid(): string {
    return '00000000-0000-0000-0000-000000000000';
  }
}

export class DateHelper {
  static FormatDateToShortDate(date: Date): string {
    return Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  static FormatDateToShortDatev2(date: Date): string {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();

    let retVal =
      year.toString() +
      (month < 10 ? `0${month}` : month.toString()) +
      (day < 10 ? `0${day}` : day.toString());

    return retVal;
  }

  static GetPastYearsFromYearNow(timetravel: number): number[] {
    let retVal: number[] = [];

    for (let i = 0; i < timetravel; i++) {
      retVal.push(new Date().getFullYear() - i);
    }

    return retVal.reverse();
  }
}

export class CommonHelper {
  static GetLatestTempId(list: any[]): number {
    if (list.length > 0) {
      let max: number = Math.max.apply(
        Math,
        list.map((i) => {
          return i.TempId;
        })
      );
      return max + 1;
    } else {
      return 1;
    }
  }
}
