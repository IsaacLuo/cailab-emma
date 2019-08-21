/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect, Link } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import PartSelectSearchBox from './PartSelectSearchBox';
import { LOAD_ALL_PART_NAMES } from '../redux/actions';

const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
  loadAllPartNames: ()=>void;
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAllPartNames: ()=>dispatch({type:LOAD_ALL_PART_NAMES}),
});

class PlateMapEditor extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.props.loadAllPartNames();
    this.state = {
      projectName: `project ${new Date().toLocaleString()}`,
      editingProjectName: '',
    };
  }

  public render() {
    return (
      <Panel>
        <PartSelectSearchBox/>
      </Panel>
    );
  }

}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlateMapEditor));
