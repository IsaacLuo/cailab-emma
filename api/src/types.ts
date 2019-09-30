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
  lastLogin?: Date,
  lastIP?: string,
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
  owner: any;
  group: string;
  permission: number;
  createdAt: Date;
  updatedAt: Date;
}