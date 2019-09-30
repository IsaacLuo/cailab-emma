import { IAction, IStoreState } from '../../types';
import { SET_PLATES, GET_PLATES} from './actions';
import {call, put, takeLatest, select} from 'redux-saga/effects';
import Axios from 'axios';
import conf from '../../conf';
function* getPlates(action:IAction) {
  let {offset, first} = action.data;
  if(offset === undefined) {
    offset = yield select((state:IStoreState)=>state.partsTable.offset);
  }
  if(first === undefined) {
    first = yield select((state:IStoreState)=>state.partsTable.first);
  }
  const result = yield call(Axios.post, conf.serverURL + '/graphql', {
    query: `query ($first: Int, $offset: Int){
      plateDefinitionCount
      plateDefinitions(pagination:{first:$first, offset:$offset}){
        _id
        name
        barcode
        description
        content {
          connector{
            name
          }
          part {
            part{
                name
                labName
            }
          }
        }
      }
  }`,
  variables: {
    first,
    offset,
  }
  }, {withCredentials: true});
  const {plateDefinitionCount, plateDefinitions} = result.data.data;
  yield put({type:SET_PLATES, data:{plates: plateDefinitions, count:plateDefinitionCount, first, offset}});
}

export default function* watch() {
  yield takeLatest(GET_PLATES, getPlates);
}