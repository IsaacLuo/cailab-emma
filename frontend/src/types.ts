export interface IUserInfo {
  _id: string;
  fullName: string;
  groups: string[];
}

export interface ISelectedPart {
  activated: boolean;
  selected: boolean;
  selectedKey?: string;
}

export interface IProject {
  _id?: string;
  name: string;
  version?: string;
  parts: ISelectedPart[];
  history?: IProject[];
  createdAt?: Date;
  updatedAt?: Date;
}
