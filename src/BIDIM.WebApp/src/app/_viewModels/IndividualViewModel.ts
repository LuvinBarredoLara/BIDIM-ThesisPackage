export interface IIndividualList {
  Id: string;
  FullName: string;
  Gender: string;
  HouseholdFamilyName: string;
  IsActive: string;
}

export interface IIndividualViewModel {
  Id: string;
  FirstName: string;
  LastName: string;
  DoB: string;
  Age: number;
  Gender: string;
  ContactNumber: string;
  HouseholdId: number;
  IsActive: boolean;
  IsDeceasedByDisease: boolean;
}

export interface IIndividualDropdownList {
  Id: string;
  FullNameHousehold: string;
}
