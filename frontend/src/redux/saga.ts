import {
  IProject, IPartDetail, IPartSequence,
} from '../types';
import {
GET_CURRENT_USER,
SET_CURRENT_USER,
LOGOUT,
GET_MY_PROJECTS,
SET_MY_PROJECTS,
GET_PROJECT,
SET_CURRENT_PROJECT,
SAVE_PROJECT_HISTORY,
CREATE_PROJECT,
DELETE_HISTORY,
SET_REMOVED_HISTORY,
STASH_HISTORY,
LOGOUT_DONE,
DELETE_PROJECT,
GO_TO_STEP_3,
SAVE_ASSEMBLY,
GET_ASSEMBLY,
SET_ASSEMBLY,
POST_ASSEMBLY_LIST,
SET_ASSEMBLY_LIST,
GET_ASSEMBLY_LIST,
SET_ASSEMBLY_LIST_ID,
RENAME_PROJECT,
LOAD_ALL_PART_NAMES,
SET_ALL_PART_NAMES,
SAVE_PLATE_DEFINITION,
SAVE_PLATE_DEFINITION_DONE,
GET_PLATE_LIST,
SET_PLATES_LIST,
GET_PLATE_DETAIL,
SET_CURRENT_SELECTED_PLATE,
GET_PART_DEFINITIONS,
SET_PART_DIFINITIONS,
GET_ALL_CONNECTORS,
SET_ALL_CONNECTORS,
CAILAB_INSTANCE_LOGIN,
GET_SHARED_PROJECTS,
SET_SHARED_PROJECTS,
CLONE_PROJECT,
SET_PROJECT_PERMISSION,
DELAY_SHOW_TOOL_TIP,
SHOW_TOOL_TIP,
GO_TO_STEP_3B,
DOWNLOAD_CSV_MULTI,
} from './actions';

import STORE_PARTS from '../parts.json';

import {IAction, IStoreState, IUserInfo} from '../types';
// redux saga
import {call, all, fork, put, takeLatest, select, delay} from 'redux-saga/effects';
// redux actions

// other saga
import watchPartsTable from '../components/PartsTable/saga';
import watchNewPartForm from '../components/NewPartForm/saga';
import watchPlatesTable from '../components/PlatesTable/saga';

// other libs
import axios from 'axios';
import conf from '../conf';

import {NotificationManager} from 'react-notifications';

export function* cailabInstanceLogin(action: IAction) {
  try {
    const res:any = yield call(axios.post, conf.serverURL + '/api/session', {}, {withCredentials: true});
    yield put({type: GET_CURRENT_USER, data: undefined});
  } catch (error) {
  }
}

export function* getCurrentUser(action: IAction) {
  if(process.env.NODE_ENV === 'development') {
    yield put({type: SET_CURRENT_USER, data: {
      _id: '5c88cea93c27125df4ff9f4a',
      fullName: 'Yisha Luo',
      groups: ["users","administrators","emma/users","lims/users"],
    }});
    return;
  }
  try {
    const res:any = yield call(axios.get, conf.authServerURL + '/api/user/current', {withCredentials: true});
    const currentUser: IUserInfo = yield select((state: IStoreState) => state.app.currentUser);
    if (currentUser._id !== res.data.user._id) {
      yield put({type: GET_MY_PROJECTS});
    }
    yield put({ type: SET_CURRENT_USER, data: res.data.user });
    if (window.location.pathname === '/')
      window.location.pathname = '/';
  } catch (error) {
    yield put({type: SET_CURRENT_USER, data: {
      _id: '',
      fullName: 'guest',
      groups: ['guest'],
    }});
    if (window.location.pathname!== '/')
      window.location.pathname = '/';
  }
}

export function* logout(action: IAction) {
  try {
    yield call(axios.delete, conf.authServerURL + '/api/session', {withCredentials: true});
    yield put({type: LOGOUT_DONE});
  } catch (error) {
    console.warn('unable to logout');
  }
}

function fillProjectDetail(project:IProject) {
  project.parts.forEach((part, i) => {
    if (part.partName) {
      // if (part.partName === 'ignored') {
      //   part.partDetail = {
      //       name: 'ignored',
      //       comment: 'ignored',
      //       sequence: '',
      //   }
      // }
      const storeParts = STORE_PARTS[i].parts as IPartDetail[];
      part.partDetail = storeParts.find(v=>v.name === part.partName)
    }
  });
}

export function* getMyProjects(action: IAction) {
  try {
    const response = yield call(axios.get, conf.serverURL + `/api/projects/`, {withCredentials: true});
    const projects: IProject[] = response.data.map(
      (v: any) => ({
        ...v, 
        createdAt: new Date(v.createdAt), 
        updatedAt: new Date(v.updatedAt),
        }),
    );
    // projects.forEach(v=>fillProjectDetail(v));
    yield put({type: SET_MY_PROJECTS, data: projects});
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* getProject(action: IAction) {
  try {
    const response = yield call(axios.get, conf.serverURL + `/api/project/${action.data}`, {withCredentials: true});
    const project: IProject = {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      };
    fillProjectDetail(project);
    yield put({type: SET_CURRENT_PROJECT, data: project});
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* createProject(action:IAction) {
  try {
    const {name, presetIndexes, mapDef, history} = action.data;
    const response = yield call(axios.post, conf.serverURL + `/api/project`, {name, presetIndexes, mapDef}, {withCredentials: true});
    const {project} = response.data;
    yield put({type: SET_CURRENT_PROJECT, data: project});
    if (history) {
      history.push(`/project/${project._id}`);
    }
  } catch (error) {
    console.warn('unable to logout');
  }
}


export function* saveProjectHistory(action: IAction) {
  try {
    const project:IProject = action.data;
    const response = yield call(axios.put, conf.serverURL + `/api/project/${project._id}`, project, {withCredentials: true});
    console.log(response.data);
    yield put({type: SET_CURRENT_PROJECT, data: response.data.project});
    yield put({type: STASH_HISTORY, data:response.data.project});
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* deleteHistory(action: IAction) {
  try {
    const {projectId, historyIndex, historyTimeStamp} = action.data;
    yield call(axios.delete, conf.serverURL + `/api/project/${projectId}/history/${historyIndex}?time=${historyTimeStamp}`, {withCredentials: true});
    // yield put({type: SET_CURRENT_PROJECT, data: response.data.project});
    yield put({type: SET_REMOVED_HISTORY, data: historyIndex});
  } catch (error) {
    console.warn('unable to ');
  }
}

export function* deleteProject(action: IAction) {
  try {
    const projectId = action.data;
    yield call(axios.delete, conf.serverURL + `/api/project/${projectId}`, {withCredentials: true});    
  } catch (error) {
    NotificationManager.error(`unable to delete project`);
    yield put({type: GET_MY_PROJECTS});
  }
}

export function* gotoStep3(action:IAction) {
  try {
    const project:IProject = action.data.project;
    const callback:()=>{} = action.data.callback;

    //check position 9
    // project.

    yield call(axios.put, conf.serverURL + `/api/project/${project._id}`, project, {withCredentials: true});
    callback();
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* gotoStep3B(action:IAction) {
  try {
    const project:IProject = action.data.project;
    const callback:()=>{} = action.data.callback;

    //check position 9
    // project.

    yield call(axios.put, conf.serverURL + `/api/project/${project._id}`, project, {withCredentials: true});
    callback();
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* saveAssembly(action:IAction) {
  try {
    const projectId:string = action.data.projectId;
    const finalParts:IPartSequence[] = action.data.finalParts;
    yield call(axios.put, conf.serverURL + `/api/project/${projectId}/assembly`, finalParts, {withCredentials: true});
    yield put({type:GET_MY_PROJECTS, data:undefined});
    if (action.cb) {
      action.cb();
    }
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* getAssembly(action:IAction) {
  try {
    const projectId:string = action.data;
    const response = yield call(axios.get, conf.serverURL + `/api/project/${projectId}/assembly`, {withCredentials: true});
    yield put({type: SET_ASSEMBLY, data:response.data});
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* postAssemblyList(action:IAction) {
  try {
    const projectIds = action.data;
    const response = yield call(axios.post, conf.serverURL + `/api/assemblyList`, projectIds, {withCredentials: true});
    const assemblyList = response.data;
    yield put({type: SET_ASSEMBLY_LIST_ID, data: assemblyList._id});
    if (action.cb) {
      action.cb(assemblyList._id);
    }
  } catch (error) {
    console.warn('unable to save assemblyList');
  }
}

export function* getAssemblyList(action:IAction) {
  try {
    const id = action.data;
    const response = yield call(axios.get, conf.serverURL + `/api/assemblyList/${id}`, {withCredentials: true});
    const assemblyList = response.data;
    yield put({type: SET_ASSEMBLY_LIST, data: assemblyList});
    if (action.cb) {
      action.cb(assemblyList._id);
    }
  } catch (error) {
    console.warn('unable to save assemblyList');
  }
}

export function* renameProject(action:IAction) {
  try {
    const {_id, name} = action.data;
    const response = yield call(axios.get, conf.serverURL + `/api/project/${_id}`, {withCredentials: true});
    const project = response.data;
    project.name = name;
    yield call(axios.put, conf.serverURL + `/api/project/${_id}`, project, {withCredentials: true});
    if (action.cb) {
      action.cb();
    }
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* loadAllPartNames(action:IAction) {
  try {
    const response = yield call(axios.get, conf.serverURL + `/api/partNames/`, {withCredentials: true});
    yield put({type: SET_ALL_PART_NAMES, data:response.data});
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* savePlateDefinition(action:IAction) {
  try {
    const response = yield call(axios.post, conf.serverURL + `/api/plateDefinition`, action.data, {withCredentials: true});
    yield put({type: SAVE_PLATE_DEFINITION_DONE, data:response.data});
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* getPlateList(action:IAction) {
  try {
    const result = yield call(axios.post, conf.serverURL + '/graphql', {
      query: `query{
        plateDefinitionList {
            _id
            name
            barcode
            description
            plateType
        }
    }`,
    variables: {}
    }, {withCredentials: true});
    yield put({type:SET_PLATES_LIST, data:result.data.data.plateDefinitionList});
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* getPlateDetail(action:IAction) {
  try {
    const result = yield call(axios.post, conf.serverURL + '/graphql', {
      query: `query ($id: ID!){
        plateDefinition (id:$id){
            _id
            name
            barcode
            description
            plateType
            content {
              _id
              ctype
              part {
                part{
                  name
                  labName
                }
              }
              connector {
                name
              }
            }
        }
    }`,
    variables: {
      id: action.data,
    }
    }, {withCredentials: true});
    console.log(result.data);
    yield put({type:SET_CURRENT_SELECTED_PLATE, data:result.data.data.plateDefinition});
  } catch (error) {
    console.warn('failed querying getPlateDeatail', error);
  }
}

export function* getPartDefinitions(action:IAction) {
  try {
    const result = yield call(axios.post, conf.serverURL + '/graphql', {
      query: `query{
        partDefinitions(pagination:{first:9999999}) {
          _id
          owner
          group
          permission
          part {
            position
            len
            name
            labName
            category
            subCategory
            comment
            plasmidLength
            backboneLength
          }
        }
    }`,
    variables: {
      id: action.data,
    }
    }, {withCredentials: true});
    yield put({type:SET_PART_DIFINITIONS, data:result.data.data.partDefinitions});
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* getAllConnectors(action:IAction) {
  try {
    const result = yield call(axios.post, conf.serverURL + '/graphql', {
      query: `query{
        connectors {
          _id
          name
          posBegin
          posEnd
          sequence
        }
    }`,
    variables: {
    }
    }, {withCredentials: true});
    yield put({type:SET_ALL_CONNECTORS, data:result.data.data.connectors});
  } catch (error) {
    console.warn(error);
  }
}

export function* getSharedProjects(action:IAction) {
  try {
    const response = yield call(axios.get, conf.serverURL + `/api/sharedProjects`, {withCredentials: true});
    const projects: IProject[] = response.data.map(
      (v: any) => ({
        ...v, 
        createdAt: new Date(v.createdAt), 
        updatedAt: new Date(v.updatedAt),
        }),
    );
    yield put({type: SET_SHARED_PROJECTS, data:projects});
  } catch (error) {
    console.warn('unable to get shared projects', error);
  }
}
export function* cloneProject(action:IAction) {
  const {_id, cb} = action.data;
  try {
    const response = yield call(axios.post, conf.serverURL + `/api/project/${_id}/clone`, {}, {withCredentials: true});
    yield call(cb, response.data._id);
  } catch (error) {
    console.warn('unable clone project', error);
  }
}

export function* setProjectPermission(action:IAction) {
  const {_id, val} = action.data;
  try {
    yield call(axios.put, conf.serverURL + `/api/project/${_id}/permission`, {permission:val}, {withCredentials: true});
  } catch (error) {
    console.warn('unable set permission', error);
  }
}

export function* downloadCsvMulti(action:IAction) {
  const _id = action.data;
  try {
    const response = yield call(axios.get, conf.serverURL + `/api/project/${_id}/multiResults`, {withCredentials: true});
    console.log(response);
  } catch (error) {
    console.warn('unable set permission', error);
  }
}

export function* watchUsers() {
  yield takeLatest(CAILAB_INSTANCE_LOGIN, cailabInstanceLogin);
  yield takeLatest(GET_CURRENT_USER, getCurrentUser);
  yield takeLatest(LOGOUT, logout);
  yield takeLatest(GET_MY_PROJECTS, getMyProjects);
  yield takeLatest(GET_PROJECT, getProject);
  yield takeLatest(CREATE_PROJECT, createProject);
  yield takeLatest(SAVE_PROJECT_HISTORY, saveProjectHistory);
  yield takeLatest(DELETE_HISTORY, deleteHistory);
  yield takeLatest(DELETE_PROJECT, deleteProject);
  yield takeLatest(GO_TO_STEP_3, gotoStep3);
  yield takeLatest(GO_TO_STEP_3B, gotoStep3B);
  yield takeLatest(SAVE_ASSEMBLY, saveAssembly);
  yield takeLatest(GET_ASSEMBLY, getAssembly);
  yield takeLatest(POST_ASSEMBLY_LIST, postAssemblyList);
  yield takeLatest(GET_ASSEMBLY_LIST, getAssemblyList);
  yield takeLatest(RENAME_PROJECT, renameProject);
  yield takeLatest(LOAD_ALL_PART_NAMES, loadAllPartNames);
  yield takeLatest(SAVE_PLATE_DEFINITION, savePlateDefinition);
  yield takeLatest(GET_PLATE_LIST, getPlateList);
  yield takeLatest(GET_PLATE_DETAIL, getPlateDetail);
  yield takeLatest(GET_PART_DEFINITIONS, getPartDefinitions);
  yield takeLatest(GET_ALL_CONNECTORS, getAllConnectors);
  yield takeLatest(GET_SHARED_PROJECTS, getSharedProjects);
  yield takeLatest(CLONE_PROJECT, cloneProject);
  yield takeLatest(SET_PROJECT_PERMISSION, setProjectPermission);
  yield takeLatest(DOWNLOAD_CSV_MULTI, downloadCsvMulti);
}

export function* delayShowTooltip(action:IAction) {
  yield delay(500);
  yield put({type:SHOW_TOOL_TIP, data:action.data});
}

export function* watchPartSelector() {
  yield takeLatest(DELAY_SHOW_TOOL_TIP, delayShowTooltip);
  
}

export default function* rootSaga() {
  yield all([
    fork(watchUsers),
    fork(watchPartsTable),
    fork(watchPlatesTable),
    fork(watchNewPartForm),
    fork(watchPartSelector),
  ]);
}
