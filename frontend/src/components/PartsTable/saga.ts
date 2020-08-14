import { IAction, IStoreState } from './../../types';
import {GET_PARTS, SET_PARTS, SET_ACTIVE_CATEGORY, SET_ACTIVE_POSITION} from './actions';
import {call, put, takeLatest, select} from 'redux-saga/effects';
import Axios from 'axios';
import conf from '../../conf';
function* getParts(action:IAction) {
  let {offset, first, posFilter, categoryFilter} = action.data;
  if(offset === undefined) {
    offset = yield select((state:IStoreState)=>state.partsTable.offset);
  }
  if(first === undefined) {
    first = yield select((state:IStoreState)=>state.partsTable.first);
  }
  const result = yield call(Axios.post, conf.serverURL + '/graphql', {
    query: `query ($first: Int, $offset: Int, $posFilter: String, $categoryFilter: String){
    partDefinitionCount
    partDefinitions(pagination:{first:$first, offset:$offset}, posFilter: $posFilter, categoryFilter: $categoryFilter)
{
  _id
  owner
  group
  permission
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
    posFilter,
    categoryFilter,
  }
  }, {withCredentials: true});
  const {partDefinitionCount, partDefinitions} = result.data.data;
  yield put({type:SET_PARTS, data:{parts: partDefinitions, count:partDefinitionCount, first, offset}});
}

function* refreshGetParts(action:IAction) {
  const partsTableState = yield select((state:IStoreState)=>state.partsTable);
  yield put({type:GET_PARTS, data:partsTableState});
}

export default function* watch() {
  yield takeLatest(GET_PARTS, getParts);
  yield takeLatest(SET_ACTIVE_POSITION, refreshGetParts);
  yield takeLatest(SET_ACTIVE_CATEGORY, refreshGetParts);
}