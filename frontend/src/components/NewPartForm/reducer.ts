import { INewPartFormState, IAction } from './../../types';
import {RESET_FORM} from './actions';
export default function (state: INewPartFormState = {
  resetForm: false
}, action: IAction) {
  switch (action.type) {
    case RESET_FORM:
      return {...state, resetForm:action.data};
  }
  return state;
}