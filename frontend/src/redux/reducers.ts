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
  LOAD_HISTORY,
} from './actions';

const defaultUser: IUserInfo = {
    _id: '',
    fullName: 'guest',
    groups: ['guest'],
  };

const defaultCurrentProject: IProject = {
    name: `empty project`,
    parts: Array(26).fill(undefined).map((v,i)=>({activated: false, selected: false, position:i})),
    connectorIndexes: [],
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
      {
        const project:IProject = action.data;
        const compactedParts = project.parts;
        project.parts = Array(26).fill(undefined).map((v,i)=>({activated: false, selected: false, position:i})),
        compactedParts.forEach((v)=>project.parts[v.position] = v);
        return {...state, currentProject: project};
      }
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
    case LOAD_HISTORY: 
      {
        if (state.currentProject.history) {
          const history = state.currentProject.history;
          const index:number = action.data;
          const currentProject = {
            ...state.currentProject.history[index],
            history,
          }
          const compactedParts = currentProject.parts;
          currentProject.parts = Array(26).fill(undefined).map((v,i)=>({activated: false, selected: false, position:i})),
          compactedParts.forEach((v)=>currentProject.parts[v.position] = v);          
          return {...state, currentProject}
        }
      }
  }
  return state;
}

export default combineReducers({
  app: appReducer,
});
