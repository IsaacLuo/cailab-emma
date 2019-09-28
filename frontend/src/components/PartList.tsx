/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter} from 'react-router-dom';
import { IStoreState } from '../types';

//my components

import PartsTable from './PartsTable';


const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
});

class UploadParts extends React.Component<IProps, IState> {
  public render() {
    return (
      <Panel>
        <div style={{marginTop:30}}>
          <h3>Parts</h3>
          <PartsTable/>
        </div>
      </Panel>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadParts));
