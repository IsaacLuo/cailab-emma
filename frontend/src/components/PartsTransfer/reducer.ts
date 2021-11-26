import { IPartsTransferState, IAction } from './../../types';
import {PUT_PART_LIST_INTO_POSITION} from './actions';
export default function partsTransferReducer(state: IPartsTransferState = {
 targetKeys:[]
}, action: IAction) {
  switch (action.type) {
    case PUT_PART_LIST_INTO_POSITION:
      const {position, ids} = action.data;
      const newTargetKeys = [...state.targetKeys];
      newTargetKeys[position] = ids;
      return {...state, targetKeys: newTargetKeys};
  }
  return state;
}