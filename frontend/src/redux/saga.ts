import {
  IProject, IPartDetail,
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
  } catch (error) {
    console.warn('unable to logout');
  }
}

function fillProjectDetail(project:IProject) {
  project.parts.forEach((part, i) => {
    if (part.partName) {
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
    projects.forEach(v=>fillProjectDetail(v));
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


export function* saveProjectHistory(action: IAction) {
  try {
    const project:IProject = action.data;
    const response = yield call(axios.put, conf.serverURL + `/api/project/${project._id}`, project, {withCredentials: true});
    console.log(response);
  } catch (error) {
    console.warn('unable to logout');
  }
}

export function* watchUsers() {
  yield takeLatest(GET_CURENT_USER, getCurrentUser);
  yield takeLatest(LOGOUT, logout);
  yield takeLatest(GET_MY_PROJECTS, getMyProjects);
  yield takeLatest(GET_PROJECT, getProject);
  yield takeLatest(SAVE_PROJECT_HISTORY, saveProjectHistory);
}

export default function* rootSaga() {
  yield all([
    fork(watchUsers),
  ]);
}