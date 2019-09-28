
export interface IUserInfo {
  _id: string;
  fullName: string;
  groups: string[];
}

export interface IPartSequence {
  partId?: string,
  connectorId?: string,
  ctype: string,
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

export interface IPart {
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

export interface IPartDefinition {
  _id: string;
  owner: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
  permission: number;
  part: IPart;
}

export interface ISelectedPart {
  position: number;
  activated: boolean;
  selected: boolean;
  partDefinition?: IPartDefinition;
  
  selectedKey?: string;
  partName?: string;
  partDetail?: IPartDetail;
}

export interface IProject {
  _id?: string;
  name: string;
  version?: string;
  parts: ISelectedPart[];
  ignorePos8?: boolean;
  connectors: IConnector[];
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

export interface IPlateMapItem {
  _id:string;
  ctype: string;
  name: string;
  labName: string;
  wellId: number;
  wellName: string;
}

export interface IConnector {
  _id: string;
  name: string;
  posBegin: number;
  posEnd: number;
  sequence: string;
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
  currentPlateMap: IPlateMapItem[];
  currentAvailableParts: IPartDefinition[];
  connectors: IConnector[];
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
    _id: string,
    ctype: string,
    name: string,
    sequence: string,
    partId?: string,
    connectorId?: string,
  }>
}

export interface IPartDefinition {
  _id:string;
  owner: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
  permission: number;
  part: {
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
}

export interface IPlateContent {
  _id: string;
  ctype: string;
  part?: IPartDefinition;
  connector?: IConnector;
}

export interface IPlateDefinition {
  owner: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
  permission: number;
  plateType: '96'|'384';
  name: string;
  barcode: string;
  description:string;
  content: Array<IPlateContent>;
}