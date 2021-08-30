import { IPartsTableState, IAction } from './../../types';
import {SET_PARTS, SET_ACTIVE_POSITION, SET_ACTIVE_CATEGORY} from './actions';
export default function partsTableReducer(state: IPartsTableState = {
  parts: [],
  first: 10,
  offset: 0,
  count: 0,
  posFilter: '1',
  categoryFilter: null,
}, action: IAction) {
  switch (action.type) {
    case SET_PARTS:
      return {...state, parts: action.data.parts, count: action.data.count, offset: action.data.offset};
    case SET_ACTIVE_POSITION:
      return {...state, posFilter: action.data, categoryFilter: null, offset:0};
    case SET_ACTIVE_CATEGORY:
      return {...state, categoryFilter: action.data, offset:0};
  }
  return state;
}