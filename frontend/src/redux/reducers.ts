import { IUserInfo, IPartSelectorState } from './../types';
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
  SET_REMOVED_HISTORY,
  RESET_PROJECT,
  RESET_HISTORY_0,
  SAVE_PROJECT_HISTORY,
  STASH_HISTORY,
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
  stashHistory: undefined,
};

function appReducer(state: IAppState = DEFAULT_STATE, action: IAction) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {...state, currentUser: action.data};
    case LOGOUT:
      return DEFAULT_STATE;
    case SET_MY_PROJECTS:
      return {...state, myProjects: action.data};
    case SET_CURRENT_PROJECT:
      {
        const project:IProject = action.data;
        const compactedParts = project.parts;
        project.parts = Array(26).fill(undefined).map((v,i)=>({activated: false, selected: false, position:i})),
        compactedParts.forEach((v)=>project.parts[v.position] = v);
        const stashHistory = state.stashHistory === undefined ? {...project, history:[]} :state.stashHistory;
        return {...state, currentProject: project, stashHistory};
      }
    case STASH_HISTORY: {
      const stashHistory = action.data;
      return {...state, stashHistory};
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
          return {...state, currentProject,};
        }
      }
    case SET_REMOVED_HISTORY:
      {
        if(state.currentProject.history) {
          const history = [...state.currentProject.history];
          history.splice(action.data,1);
          return {...state, currentProject: {...state.currentProject, history}}
        }
      }
    case RESET_PROJECT:
      {
        return {...state, currentProject: {...state.currentProject}}
      }
    case RESET_HISTORY_0:
      {
        if (state.stashHistory) {
          return {...state, currentProject: {...state.stashHistory, history: state.currentProject.history}}
        } else {
          return {...state, currentProject: {...state.currentProject}, stashHistory: {...state.currentProject, history:[]}}
        }
      }
  }
  return state;
}

const DEFAULT_PART_SELECTOR_STATE: IPartSelectorState = {
  resetCount: 0,
}

function partSelectorReducer(state: IPartSelectorState = DEFAULT_PART_SELECTOR_STATE, action: IAction) {
  switch (action.type) {
    case RESET_PROJECT:
      return {...state, resetCount: state.resetCount+1};
  }
  return state;
}

export default combineReducers({
  app: appReducer,
  partSelector: partSelectorReducer,
});
