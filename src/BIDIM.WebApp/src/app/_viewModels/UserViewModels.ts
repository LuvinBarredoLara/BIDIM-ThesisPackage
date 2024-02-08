export interface IUserLogin {
  Username: string;
  Password: string;
}

export interface IUserSession {
  Username: string;
  Firstname: string;
  Lastname: string;
  Type: string;
  Token: string;
}

export interface IUserList {
  UserId: string;
  Username: string;
  FirstName: string;
  LastName: string;
  UserType: string;
  IsActive: string;
}

export interface IUserViewModel {
  UserId: string;
  Username: string;
  Password: string;
  ConfirmPassword: string;
  FirstName: string;
  LastName: string;
  UserTypeId: number;
  IsActive: boolean;
  PasswordUpdated: boolean;
}

export interface IUserType {
  Id: number;
  Name: string;
}
