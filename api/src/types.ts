import { IConnector } from './../../frontend/src/types';
export interface IGLobalConfig {
  maxTubeDeleteLimit: number,
  host: string,
  port: number,
  publicURL?: string,
}

export interface IUserEssential {
  _id: any,
  email: string,
  name: string, // user's full name
  groups: string[], // array of group name, 'guest', 'users', 'visitors', or 'administrators'
}

export interface ITokenContent extends IUserEssential{
  iat:number,
  exp:number,
}

export interface IUser extends IUserEssential {
  createdAt?: Date,
  updatedAt?: Date,
  passwordHash?: string, // empty if user signed up using google account
  passwordSalt?: string, // empty if user signed up using google account
}

export interface ICustomState {
  user?: ITokenContent,
  data?: any,
}

export interface ISelectedPart {
  activated: boolean;
  selected: boolean;
  selectedKey?: string;
}

export interface IProject {
  _id: any;
  name: string;
  version: string,
  parts: ISelectedPart[];
  connectors: IConnector[];
  history: IProject[];
  createdAt: Date;
  updatedAt: Date;
}