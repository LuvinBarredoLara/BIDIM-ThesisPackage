export interface IPHRegion {
  id: number;
  psgcCode: string;
  regDesc: string;
  regCode: string;
}

export interface IPHProvince {
  id: number;
  psgcCode: string;
  provDesc: string;
  regCode: string;
  provCode: string;
}

export interface IPHCityMun {
  id: number;
  psgcCode: string;
  citymunDesc: string;
  regDesc: string;
  provCode: string;
  citymunCode: string;
}

export interface IPHBrgy {
  id: number;
  brgyCode: string;
  brgyDesc: string;
  regCode: string;
  provCode: string;
  citymunCode: string;
}
