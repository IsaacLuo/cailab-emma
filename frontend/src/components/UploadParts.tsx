/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter} from 'react-router-dom';
import { IUserInfo,IStoreState } from '../types';

//my components
import NewPartForm from './NewPartForm'
import PartTabs from './PartTabs';
import { Breadcrumb } from 'react-bootstrap';

const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
});

class UploadParts extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.state = {
    };
  }

  public render() {
    return (
      <React.Fragment>
        <Breadcrumb>
          <Breadcrumb.Item href='/dashboard'>Home</Breadcrumb.Item>
          <Breadcrumb.Item href='/partsDecisions'>parts</Breadcrumb.Item>
          <Breadcrumb.Item active>new part</Breadcrumb.Item>
        </Breadcrumb>
      <Panel>
        <div style={{marginTop:30}}>
        <h3>create a new part</h3>

        <NewPartForm/>
        <PartTabs/>
          
        </div>
      </Panel>
      </React.Fragment>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadParts));
