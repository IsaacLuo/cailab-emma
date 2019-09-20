import { IPartsTableState, IAction } from './../../types';
import {SET_PARTS} from './actions';
export default function partsTableReducer(state: IPartsTableState = {
  parts: [],
  first: 10,
  offset: 0,
  count: 0,
}, action: IAction) {
  switch (action.type) {
    case SET_PARTS:
      return {...state, parts:action.data.parts, count: action.data.count, first: action.data.first, offset: action.data.offset};
  }
  return state;
}