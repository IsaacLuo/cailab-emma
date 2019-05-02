import { IUserInfo } from './../types';
import {combineReducers} from 'redux';

import {
  IStoreState,
  IAction,
  IAppState,
  IProject,
  } from '../types';

import {
  SET_CURRENT_USER,
  LOGOUT,
  SET_MY_PROJECTS,
  SET_CURRENT_PROJECT,
  SET_PART_DETAIL,
} from './actions';

const defaultUser: IUserInfo = {
          _id: '',
          fullName: 'guest',
          groups: ['guest'],
        };

const defaultCurrentProject: IProject = {
    name: `newProject_${new Date().toISOString()}`,
    parts: Array(26).fill({activated: false, selected: false}),
  };

const DEFAULT_STATE: IAppState = {
  currentUser: defaultUser,
  myProjects: [],
  currentProject: defaultCurrentProject,
};

function appReducer(state: IAppState = DEFAULT_STATE, action: IAction) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {...state, currentUser: action.data};
    case LOGOUT:
      return {...state, currentUser: defaultUser};
    case SET_MY_PROJECTS:
      return {...state, myProjects: action.data};
    case SET_CURRENT_PROJECT:
      return {...state, currentProject: action.data};
    case SET_PART_DETAIL:
      const {position, detail} = action.data;
      const currentProject = {
        ...state.currentProject,
        parts: [...state.currentProject.parts],
      }
      const {name, comment} = detail;
      currentProject.parts[position].partDetail = {name, comment};
      currentProject.parts[position].partName = name;
      return {...state, currentProject}
  }
  return state;
}

export default combineReducers({
  app: appReducer,
});
