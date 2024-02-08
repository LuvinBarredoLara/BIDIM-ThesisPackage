export interface IHouseholdList {
  Id: string;
  FamilyName: string;
  MemberCount: number;
}

export interface IHouseholdViewModel {
  Id: number;
  FamilyName: string;
  CityMun: string;
  Brgy: string;
  Zone: string;
  Street: string;
  Long: number;
  Lat: number;
}

export interface IHouseholdDropdownList {
  Id: number;
  FamilyName: string;
}
