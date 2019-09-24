import { IPartDefinition, IPlateDefinition } from './../../api/src/models';

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
  assemblies?: number;
}

export interface IAction {
  type: string;
  data: any;
  cb?: (...args: any[])=>void;
}

export interface IPartName {
  _id: string;
  name: string;
  labName: string;
}

export interface IPlatesListItem {
  _id:string;
  name:string;
  barcode:string;
  plateType:string;
  description:string;
}

export interface IPlatesListItemWithDetail extends IPlatesListItem{
  _id:string;
  name:string;
  barcode:string;
  plateType:string;
  description:string;
  parts?: IPartDefinition[];
}

export interface IAppState {
  // the app is initializing(fetching data from server first time)
  currentUser: IUserInfo;
  myProjects: IProject[];
  currentProject: IProject;
  stashHistory?: IProject;
  currentAssembly?: IPartSequence[];
  assemblyListId?: string;
  assemblyProjects: IAssembly[];
  partNames: IPartName[];
  partDict: any;
  platesList: IPlatesListItem[];
  currentSelectedPlate?: IPlatesListItemWithDetail;
  currentAvailableParts: IPartDefinition[];
}
export interface IPartSelectorState {
  resetCount: number;
}
export interface IWizardState {
  projectName: string;
}

export interface IPartsTableState {
  parts: IPartDefinition[];
  first: number;
  offset: number;
  count:number;
}

export interface IPlatesTableState {
  plates: IPlateDefinition[];
  first:number;
  offset:number;
  count:number;
}

export interface INewPartFormState {
  resetForm: boolean;
}


export interface IStoreState {
  app: IAppState;
  partSelector: IPartSelectorState;
  partsTable: IPartsTableState;
  platesTable: IPlatesTableState;
  wizard: IWizardState;
  newPartForm: INewPartFormState;
}

export interface IAssembly {
  project: string,
  finalParts: Array<{
    name: string,
    sequence: string,
  }>
}