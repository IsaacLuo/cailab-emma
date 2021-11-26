
declare interface IGLobalConfig {
  maxTubeDeleteLimit: number,
  host: string,
  port: number,
  publicURL?: string,
}

declare interface IUserEssential {
  _id?: any,
  email: string,
  name: string, // user's full name
  groups: string[], // array of group name, 'guest', 'users', 'visitors', or 'administrators'
}

declare interface ITokenContent extends IUserEssential{
  iat:number,
  exp:number,
}

declare interface IUser extends IUserEssential {
  lastLogin?: Date,
  lastIP?: string,
}

declare interface ICustomState {
  user?: ITokenContent,
  data?: any,
}

declare interface ISelectedPart {
  activated: boolean;
  selected: boolean;
  selectedKey?: string;
}

declare interface IConnector {
  _id?: any;
  name: string;
  posBegin: number;
  posEnd: number;
  sequence: string;
  index?:number;
}

declare interface IProject {
  _id?: any;
  name: string;
  version: string,
  parts: ISelectedPart[];
  partsMultiIds: string[][];
  connectors: IConnector[];
  history: IProject[];
  owner: any;
  group?: string;
  permission?: number;
  createdAt: Date;
  updatedAt: Date;
  index?: number;
}

declare interface IPart {
  pos:number;
  position: string;
  len:number|undefined;
  name: string;
  labName: string;
  category: string;
  subCategory: string;
  comment: string;
  sequence: string;
  plasmidLength: number;
  backboneLength: number;
}

declare interface IPartDefinition {
  owner: any;
  group: string;
  createdAt: Date;
  updatedAt: Date;
  permission: number;
  part: IPart;
}

declare interface IPlateDefinition {
  owner: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
  permission: number;
  plateType: '96'|'384';
  name: string;
  barcode: string;
  parts: any[];
}