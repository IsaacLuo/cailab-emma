import { IPartsTableState, IAction } from './../../types';
import {SET_PARTS} from './actions';
export default function partsTableReducer(state: IPartsTableState = {
  parts: [],
  first: 10,
  offset: 0,
}, action: IAction) {
  switch (action.type) {
    case SET_PARTS:
      return {...state, parts:action.data};
  }
  return state;
}