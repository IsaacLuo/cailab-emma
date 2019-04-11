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

export interface IAction {
  type: string;
  data: any;
}


export interface IAppState {
  // the app is initializing(fetching data from server first time)
  currentUser: IUserInfo;
  myProjects: IProject[];
  currentProject: IProject;
}

export interface IStoreState {
  app: IAppState;
}
