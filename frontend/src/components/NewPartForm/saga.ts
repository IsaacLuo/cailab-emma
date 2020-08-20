import { IAction } from './../../types';
import {NEW_PART, RESET_FORM} from './actions';
import {call,put, takeLatest} from 'redux-saga/effects';
import axios from 'axios';
import conf from '../../conf';
import { GET_PARTS } from '../PartsTable/actions';
import { notification} from 'antd';

export function* newPart(action:IAction) {
  try {
    const response = yield call(axios.post, conf.serverURL + `/api/partDefinition/item`, {part:action.data}, {withCredentials: true});
    yield put({type: GET_PARTS, data:response.data});
    yield put({type: RESET_FORM, data:true});
  } catch (error) {
    notification.error({message:'error in creating new parts', description:'could not send request to the server'});
    console.warn('error in creating new parts');
  }
}


export default function* watch() {
  yield takeLatest(NEW_PART, newPart);
}