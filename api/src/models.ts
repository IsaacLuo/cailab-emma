/// <reference path="@types/index.d.ts" />

import mongoose, { Model, Document } from 'mongoose'
import {Schema} from 'mongoose'

export const UserSchema = new Schema({
  email: String,
  name: String, // user's full name
  groups: [String], // array of group name, 'guest', 'users', 'visitors', or 'administrators'
  lastLogin: Date,
  lastIP: String,
});

export interface IUserModel extends IUser, Document{

}

export const User:Model<IUserModel> = mongoose.model('User', UserSchema, 'users');

export const PartDetailSchema = new Schema({
  name: String,
  comment: String,
}, {_id:false});


export const PartsSchema = new Schema({
  position: Number,
  activated: Boolean,
  selected: Boolean,
  partDefinition: {
    type: Schema.Types.ObjectId,
    ref: 'PartDefinition',
  },
}, {_id:false});

export const ConnectorSchema = new Schema({
  name: String,
  posBegin: Number,
  posEnd: Number,
  sequence: String,
  index: Number,
})

interface ConnectorSchema {
  _id: any;
  name: string;
  posBegin: number;
  posEnd: number;
  sequence: string;
  index: number
}

export interface IConnectorModel extends IConnector, Document {}
export const Connector:Model<IConnectorModel> = mongoose.model('Connector', ConnectorSchema, 'connectors');

export const ProjectSchema = new Schema({
  name: String,
  version: String,
  parts: [PartsSchema],
  connectors: [{
    type: Schema.Types.ObjectId,
    ref: 'Connector',
  }],
  // connectorIndexes: [Number],
  owner: {
    type:Schema.Types.ObjectId,
    ref: 'User'
  },
  group: String,
  permission: Number,
  createdAt: Date,
  updatedAt: Date,
  history: [Schema.Types.Mixed],
});

export interface IProjectModel extends IProject, Document{

}

export const Project:Model<IProjectModel> = mongoose.model('Project', ProjectSchema, 'projects');

export const AssemblySchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  finalParts: [{
    partId: {
      type: Schema.Types.ObjectId,
      ref: 'Part',
    },
    connectorId: {
      type: Schema.Types.ObjectId,
      ref: 'Connector',
    },
    ctype: String,
    name: String,
    sequence: String,
  }]
});

export interface IAssembly {
  project: string|IProjectModel,
  finalParts: Array<{
    partId: string;
    ctype: string;
    name: string,
    sequence: string,
  }>
}

export interface IAssemblyModel extends IAssembly, Document {}
export const Assembly:Model<IAssemblyModel> = mongoose.model('Assembly', AssemblySchema, 'assemblies');

export const AssemblyListSchema = new Schema({
  assemblies: [{
    type: Schema.Types.ObjectId,
    ref: 'Assembly',
  }],
  owner: Schema.Types.ObjectId,
  createdAt: Date,
})
export interface IAssemblyList {
  assemblies: Array<Model<IAssemblyModel>>|string[];
  owner: string;
  createdAt: Date;
}
export interface IAssemblyListModel extends IAssemblyList, Document {}
export const AssemblyList:Model<IAssemblyListModel> = mongoose.model('AssemblyList', AssemblyListSchema, 'assembly_lists');


export const PartDefinitionSchema = new Schema({
  owner: Schema.Types.ObjectId,
  group: String,
  createdAt: Date,
  updatedAt: Date,
  permission: Number,
  part: {
    position: String,
    len: Number,
    name: String,
    labName: String,
    category: String,
    subCategory: String,
    comment: String,
    sequence: String,
    plasmidLength: Number,
    backboneLength: Number,
  },
})

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
  owner: any;
  group: string;
  createdAt: Date;
  updatedAt: Date;
  permission: number;
  part: IPart;
}
export interface IPartDefinitionModel extends IPartDefinition, Document {}
export const PartDefinition:Model<IPartDefinitionModel> = mongoose.model('PartDefinition', PartDefinitionSchema, 'part_definitions');


export interface IPlateDefinitionContent {
  _id:string;
  ctype: string;
  part: IPartDefinition | string;
  connector: IConnector | string;
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
  description?:string;
  content: Array<IPlateDefinitionContent|string>;
}

export const PlateDefinitionSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  group: String,
  createdAt: Date,
  updatedAt: Date,
  permission: Number,
  plateType: String,
  name: String,
  barcode: String,
  description: String,
  content: [{
    _id: Schema.Types.ObjectId,
    ctype: String,
    part: {
      type: Schema.Types.ObjectId,
      ref: 'PartDefinition',
    }, 
    connector: {
      type: Schema.Types.ObjectId,
      ref: 'Connector',
    },
  }]
});

export interface IPlateDefinitionModel extends IPlateDefinition, Document {}
export const PlateDefinition:Model<IPlateDefinitionModel> = mongoose.model('PlateDefinition', PlateDefinitionSchema, 'plate_definitions');


