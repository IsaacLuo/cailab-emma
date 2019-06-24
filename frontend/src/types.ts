export interface IUserInfo {
  _id: string;
  fullName: string;
  groups: string[];
}

export interface IPartSequence {
  name:string,
  sequence: string,
}

export interface IPartDetail {
  name: string,
  // labName: string,
  // category: string,
  // subCategory: string,
  comment: string,
  sequence?: string,
  len?:number,
}

export interface ISelectedPart {
  position: number;
  activated: boolean;
  selected: boolean;
  selectedKey?: string;
  partName?: string;
  partDetail?: IPartDetail;
}

export interface IProject {
  _id?: string;
  name: string;
  version?: string;
  parts: ISelectedPart[];
  connectorIndexes: number[];
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
  stashHistory?: IProject;
  currentAssembly?: IPartSequence[];
}
export interface IPartSelectorState {
  resetCount: number;
}
export interface IWizardState {
  projectName: string;
}


export interface IStoreState {
  app: IAppState;
  partSelector: IPartSelectorState;
  wizard: IWizardState;
}

