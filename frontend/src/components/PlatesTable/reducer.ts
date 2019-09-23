import { IPlatesTableState, IAction } from '../../types';
import {SET_PLATES} from './actions';
export default function plateTableReducer(state: IPlatesTableState = {
  plates: [],
  first: 10,
  offset: 0,
  count: 0,
}, action: IAction) {
  switch (action.type) {
    case SET_PLATES:
      return {...state, plates:action.data.plates, count: action.data.count, first: action.data.first, offset: action.data.offset};
  }
  return state;
}