import { IUser } from './types';
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

export const ProjectSchema = new Schema({
  name: String,
  version: String,
  data: Schema.Types.Mixed,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: Date,
  updatedAt: Date,
  histroy: [Schema.Types.Mixed],
});