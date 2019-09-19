import { IAction } from './../../types';
import {GET_PARTS, SET_PARTS} from './actions';
import {call, all, fork, put, takeLatest, select} from 'redux-saga/effects';
import Axios from 'axios';
import conf from '../../conf';
function* getParts(action:IAction) {
  const {offset, first} = action.data;
  const result = yield call(Axios.post, conf.serverURL + '/graphql', {
    query: `query ($first: Int, $offset: Int){
    partDefinitionCount
    partDefinitions(pagination:{first:$first, offset:$offset)
{
  _id
  part {
    position
    name
    labName
    category
    subCategory
    comment
	}
}}`,
  variables: {
    first,
    offset,
  }
  }, {withCredentials: true});
  const {partDefinitionCount, partDefinitions} = result.data.data;
  yield put({type:SET_PARTS, data:{parts: partDefinitions, count:partDefinitionCount, first, offset}});
}

export default function* watch() {
  yield takeLatest(GET_PARTS, getParts);
}