import { 
  IUserInfo, 
  IPartSelectorState, 
  IPlateContent,
  IAction,
  IAppState,
  IProject,
} from './../types';
import {combineReducers} from 'redux';

import {
  SET_CURRENT_USER,
  SET_MY_PROJECTS,
  SET_CURRENT_PROJECT,
  LOAD_HISTORY,
  SET_REMOVED_HISTORY,
  RESET_PROJECT,
  RESET_HISTORY_0,

  STASH_HISTORY,
  LOGOUT_DONE,

  DELETE_PROJECT,
  SET_ASSEMBLY,
  SET_ASSEMBLY_LIST,
  SET_ASSEMBLY_LIST_ID,
  RENAME_PROJECT,
  SET_ALL_PART_NAMES,
  SET_PLATES_LIST,
  SET_CURRENT_SELECTED_PLATE,
  SET_PART_DIFINITIONS,
  SET_ALL_CONNECTORS,
  SET_SHARED_PROJECTS,
  SET_PROJECT_PERMISSION,
  SHOW_TOOL_TIP,
  HIDE_TOOL_TIP,
} from './actions';

import partsTableReducer from '../components/PartsTable/reducer'
import newPartFormReducer from '../components/NewPartForm/reducer'
import platesTableReducer from '../components/PlatesTable/reducer'
import { PUT_PART_INTO_POSITION } from '../components/PartsDropDown/actions';
import { wellIdToWellName } from '../utilities/wellIdConverter';
import partsTransferReducer from '../components/PartsTransfer/reducer';
import { PUT_PART_LIST_INTO_POSITION } from '../components/PartsTransfer/actions';

const defaultUser: IUserInfo = {
    _id: '',
    fullName: '',
    groups: ['guest'],
  };

const defaultCurrentProject: IProject = {
    name: `empty project`,
    parts: Array(26).fill(undefined).map((v,i)=>({activated: false, selected: false, position:i})),
    partsMultiIds:[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],],
    connectors: [],
    ignorePos8: false,
    permission: 0x600,
  };

const DEFAULT_STATE: IAppState = {
  currentUser: defaultUser,
  myProjects: [],
  sharedProjects: [],
  currentProject: defaultCurrentProject,
  currentAssembly: undefined,
  stashHistory: undefined,
  assemblyListId: undefined,
  assemblyProjects: [],
  partNames: [],
  partDict: {},
  platesList: [],
  currentSelectedPlate: undefined,
  currentAvailableParts: [],
  currentPlateMap: [],
  connectors: [],
  tooltipIcon: undefined,
  tooltipTitle: undefined,
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
    case PUT_PART_INTO_POSITION: {
      const {position, id} = action.data;
      const partDefinition = state.currentAvailableParts.find(v=>v._id === id);
      if(!partDefinition) {
        return state;
      }

      const ignorePos8 = position === 7 ? (partDefinition.part.len === 2) : !!state.currentProject.ignorePos8;
      // console.log(partDefinition.part, ignorePos8);
      const currentProject = {
        ...state.currentProject,
        parts: [...state.currentProject.parts],
      }
      currentProject.parts[position].partDefinition = partDefinition;
      currentProject.ignorePos8 = ignorePos8;

      return {...state, currentProject}

    }
    case PUT_PART_LIST_INTO_POSITION: {
      const {position, ids}:{position: number, ids:string[]} = action.data;

      const partDefinitions = ids.map((id)=>state.currentAvailableParts.find(v=>v._id === id));
      console.log(partDefinitions);

      const ignorePos8 = position === 7 ? (partDefinitions.some(def=>def?.part?.len === 2)) : !!state.currentProject.ignorePos8;
      // console.log(partDefinition.part, ignorePos8);
      const currentProject = {
        ...state.currentProject,
        parts: [...state.currentProject.parts],
        partsMultiIds: state.currentProject.partsMultiIds ? [...state.currentProject.partsMultiIds]: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],],
      }
      currentProject.parts[position].partDefinition = partDefinitions?.[0];
      currentProject.ignorePos8 = ignorePos8;
      currentProject.partsMultiIds[position] = ids;

      return {...state, currentProject}
    }
      
    // case SET_PART_DETAIL:
    //   const {position, detail} = action.data;

    //   const ignorePos8 = (position === 7
    //     && detail.len === 2)
    //   const resetPost8 = (position === 7
    //     && (detail.len === undefined || detail.len === 1)
    //     && state.currentProject.parts[7] 
    //     && state.currentProject.parts[7].partDetail 
    //     && state.currentProject.parts[7].partDetail.len === 2)


    //   const currentProject = {
    //     ...state.currentProject,
    //     parts: [...state.currentProject.parts],
    //   }
    //   const {name, comment, len} = detail;
    //   currentProject.parts[position].partDetail = {name, comment, len:len||1};
    //   currentProject.parts[position].partName = name;

    //   if (ignorePos8) {
    //     currentProject.parts[8].partDetail = {name:'ignored', comment:'ignored', len:0, sequence: 'XXXXXXXX'};
    //     currentProject.parts[8].partName = 'ignored';
    //   } else if (resetPost8) {
    //     currentProject.parts[8].partDetail = undefined;
    //     currentProject.parts[8].partName = undefined;
    //   }

    //   return {...state, currentProject}
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
        break;
      }
    case SET_REMOVED_HISTORY:
      {
        if(state.currentProject.history) {
          const history = [...state.currentProject.history];
          history.splice(action.data,1);
          return {...state, currentProject: {...state.currentProject, history}}
        }
        break;
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
      const partDict:any = {};
      action.data.forEach((v:any)=>partDict[v._id] = v);
      return {...state, partNames: action.data, partDict };
    case SET_PLATES_LIST:
      return {...state, platesList: action.data};
    case SET_CURRENT_SELECTED_PLATE:{
      const currentSelectedPlate = action.data;
      const plateMap = currentSelectedPlate.content.map(
        (content:IPlateContent, wellId:number) => {
          if (content) {
          return {
            _id: content._id,
            ctype: content.ctype,
            name: content.ctype === 'connector'? content.connector!.name : content.part!.part.name,
            labName: content.ctype === 'connector'? 'connector' : content.part!.part.labName,
            wellId: wellId,
            wellName: wellIdToWellName(wellId),
          };
          } else {
            return undefined;
          }
        });
      return {
        ...state, 
        currentSelectedPlate: action.data,
        currentPlateMap: plateMap,
      };
    }
    case SET_PART_DIFINITIONS:
      return {
        ...state,
        currentAvailableParts: action.data,
      }
    case SET_ALL_CONNECTORS:
      return {
        ...state,
        connectors: action.data,
      }
    case SET_SHARED_PROJECTS:

      return {
        ...state,
        sharedProjects: action.data,
      };
    
    case SET_PROJECT_PERMISSION: {
      const {_id, val} = action.data;
      const myProjects = [...state.myProjects];
      myProjects.forEach(v=>{
        if (v._id === _id) {
          v.permission = val;
        }
      });
      return {
        ...state,
        myProjects,
      }
    }
    case SHOW_TOOL_TIP:
      const {icon, title} = action.data;
      return {
        ...state,
        tooltipIcon: icon,
        tooltipTitle: title,
      }
    case HIDE_TOOL_TIP:
      return {
        ...state,
        tooltipIcon: undefined,
        tooltipTitle: undefined,
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
  partsTable: partsTableReducer,
  platesTable: platesTableReducer,
  partsTransfer: partsTransferReducer,
  // wizard: wizardReducer,
  newPartForm: newPartFormReducer,
});
