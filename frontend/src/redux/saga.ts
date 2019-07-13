import {
  IProject, IPartDetail, IPartSequence,
} from '../types';
import {
  LOGIN,
GET_CURENT_USER,
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
PROJECT_DELETED,
GO_TO_STEP_3,
SAVE_ASSEMBLY,
GET_ASSEMBLY,
SET_ASSEMBLY,
POST_ASSEMBLY_LIST,
SET_ASSEMBLY_LIST,
GET_ASSEMBLY_LIST,
SET_ASSEMBLY_LIST_ID,
RENAME_PROJECT,
} from './actions';

import STORE_PARTS from '../parts.json';

import {IAction, IStoreState, IUserInfo} from '../types';
// redux saga
import {call, all, fork, put, takeLatest, select} from 'redux-saga/effects';
// redux actions

// other libs
import axios from 'axios';
import conf from '../conf';
import { eventChannel } from 'redux-saga';

import {NotificationManager} from 'react-notifications';

export function* getCurrentUser(action: IAction) {
  try {
    const res = yield call(axios.get, conf.authServerURL + '/api/user/current', {withCredentials: true});
    const currentUser: IUserInfo = yield select((state: IStoreState) => state.app.currentUser);
    if (currentUser._id !== res.data.user._id) {
      yield put({type: GET_MY_PROJECTS});
    }
    yield put({type: SET_CURRENT_USER, data: res.data.user});
  } catch (error) {
    yield put({type: SET_CURRENT_USER, data: {
      _id: '',
      fullName: 'guest',
      groups: ['guest'],
    }});
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
    const response = yield call(axios.delete, conf.serverURL + `/api/project/${projectId}/history/${historyIndex}?time=${historyTimeStamp}`, {withCredentials: true});
    // yield put({type: SET_CURRENT_PROJECT, data: response.data.project});
    yield put({type: SET_REMOVED_HISTORY, data: historyIndex});
  } catch (error) {
    console.warn('unable to ');
  }
}

export function* deleteProject(action: IAction) {
  try {
    const projectId = action.data;
    const response = yield call(axios.delete, conf.serverURL + `/api/project/${projectId}`, {withCredentials: true});    
  } catch (error) {
    NotificationManager.error(`unable to delete project`);
    yield put({type: GET_MY_PROJECTS});
  }
}

export function* gotoStep3(action:IAction) {
  try {
    const project:IProject = action.data.project;
    const callback:()=>{} = action.data.callback;
    const response = yield call(axios.put, conf.serverURL + `/api/project/${project._id}`, project, {withCredentials: true});
    callback();
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* saveAssembly(action:IAction) {
  try {
    const projectId:string = action.data.projectId;
    const finalParts:IPartSequence[] = action.data.finalParts;
    const response = yield call(axios.put, conf.serverURL + `/api/project/${projectId}/assembly`, finalParts, {withCredentials: true});
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
    const response2 = yield call(axios.put, conf.serverURL + `/api/project/${_id}`, project, {withCredentials: true});
    if (action.cb) {
      action.cb();
    }
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* watchUsers() {
  yield takeLatest(GET_CURENT_USER, getCurrentUser);
  yield takeLatest(LOGOUT, logout);
  yield takeLatest(GET_MY_PROJECTS, getMyProjects);
  yield takeLatest(GET_PROJECT, getProject);
  yield takeLatest(CREATE_PROJECT, createProject);
  yield takeLatest(SAVE_PROJECT_HISTORY, saveProjectHistory);
  yield takeLatest(DELETE_HISTORY, deleteHistory);
  yield takeLatest(DELETE_PROJECT, deleteProject);
  yield takeLatest(GO_TO_STEP_3, gotoStep3);
  yield takeLatest(SAVE_ASSEMBLY, saveAssembly);
  yield takeLatest(GET_ASSEMBLY, getAssembly);
  yield takeLatest(POST_ASSEMBLY_LIST, postAssemblyList);
  yield takeLatest(GET_ASSEMBLY_LIST, getAssemblyList);
  yield takeLatest(RENAME_PROJECT, renameProject);
}

export default function* rootSaga() {
  yield all([
    fork(watchUsers),
  ]);
}
