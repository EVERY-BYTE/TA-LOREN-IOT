import { IRootModel } from "./rootModel";

export interface IUserModel extends IRootModel {
  userId: string;
  userName: string;
  userPassword: string;
  userRole: string;
}

export interface IUserCreateRequestModel {
  userName: string;
  userPassword: string;
  userRole: string;
}

export interface IUserUpdateRequestModel {
  userId: string;
  userName?: string;
  userPassword?: string;
  userRole?: string;
}

export interface IUserLoginRequestModel {
  userName: string;
  userPassword: string;
}

export interface ICurrentUserModel {
  email: string;
  uid: string;
}
