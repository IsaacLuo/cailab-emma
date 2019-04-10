import { 
  IUser,
  IProject, 
} from './types';
import mongoose, { Model, Document } from 'mongoose'
import {Schema} from 'mongoose'

export const UserSchema = new Schema({
  email: String,
  passwordHash: String, // empty if user signed up using google account
  passwordSalt: String, // empty if user signed up using google account
  name: String, // user's full name
  groups: [String], // array of group name, 'guest', 'users', 'visitors', or 'administrators'
  createdAt: Date,
  updatedAt: Date,
});

export interface IUserModel extends IUser, Document{

}

export const User:Model<IUserModel> = mongoose.model('User', UserSchema, 'users');

export const PartsSchema = new Schema({
  activated: Boolean,
  selected: Boolean,
  selectedKey: String,
}, {_id:false});

export const ProjectSchema = new Schema({
  name: String,
  version: String,
  parts: [PartsSchema],
  owner: Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  history: [Schema.Types.Mixed],
});

export interface IProjectModel extends IProject, Document{

}

export const Project:Model<IProjectModel> = mongoose.model('Project', ProjectSchema, 'projects');