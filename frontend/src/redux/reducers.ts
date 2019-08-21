import { IUserInfo, IPartSelectorState, IWizardState } from './../types';
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
  LOGOUT_DONE,
  PROJECT_DELETED,
  DELETE_PROJECT,
  SET_ASSEMBLY,
  SET_ASSEMBLY_LIST,
  SET_ASSEMBLY_LIST_ID,
  RENAME_PROJECT,
  SET_ALL_PART_NAMES,
} from './actions';

const defaultUser: IUserInfo = {
    _id: '',
    fullName: '',
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
  currentAssembly: undefined,
  stashHistory: undefined,
  assemblyListId: undefined,
  assemblyProjects: [],
  partNames: [],
};

function appReducer(state: IAppState = DEFAULT_STATE, action: IAction) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {...state, currentUser: action.data};
    case LOGOUT_DONE:
      return DEFAULT_STATE;
    case SET_MY_PROJECTS:
      return {...state, myProjects: action.data};
    case SET_CURRENT_PROJECT:
      {
        const project:IProject = action.data;
        const compactedParts = project.parts;
        project.parts = Array(26).fill(undefined).map((_,i)=>({activated: false, selected: false, position:i}));
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

      const ignorePos8 = (position === 7
        && detail.len === 2)
      const resetPost8 = (position === 7
        && (detail.len === undefined || detail.len === 1)
        && state.currentProject.parts[7] 
        && state.currentProject.parts[7].partDetail 
        && state.currentProject.parts[7].partDetail.len === 2)


      const currentProject = {
        ...state.currentProject,
        parts: [...state.currentProject.parts],
      }
      const {name, comment, len} = detail;
      currentProject.parts[position].partDetail = {name, comment, len:len||1};
      currentProject.parts[position].partName = name;

      if (ignorePos8) {
        currentProject.parts[8].partDetail = {name:'ignored', comment:'ignored', len:0, sequence: 'XXXXXXXX'};
        currentProject.parts[8].partName = 'ignored';
      } else if (resetPost8) {
        currentProject.parts[8].partDetail = undefined;
        currentProject.parts[8].partName = undefined;
      }

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
          currentProject.parts = Array(26).fill(undefined).map((v,i)=>({activated: false, selected: false, position:i}));
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
    case DELETE_PROJECT:
      {
        return {...state, myProjects: state.myProjects.filter(v=>v._id !== action.data)}
      }
    case SET_ASSEMBLY:
      return {...state, currentAssembly: action.data};
    case SET_ASSEMBLY_LIST_ID:
      return {...state, assemblyListId: action.data};
    case SET_ASSEMBLY_LIST:
      return {...state, assemblyProjects: action.data.assemblies};
    case RENAME_PROJECT:
      return {...state, myProjects: state.myProjects.map(v=>v._id === action.data._id ? {...v, name:action.data.name} : v)};
    case SET_ALL_PART_NAMES:
      return {...state, partNames: action.data};
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

// function wizardReducer(state: IWizardState = {projectName:'new project'}, action: IAction) {
//   switch (action.type) {
//     case SET_WIZARD_PROJECT_NAME:
//       return {...state, projectName: action.data};
//   }
//   return state;
// }

export default combineReducers({
  app: appReducer,
  partSelector: partSelectorReducer,
  // wizard: wizardReducer,
});
