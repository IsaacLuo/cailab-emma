/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect, Link } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import { Table, Divider, Tag } from 'antd';
import { Form, Icon, Input, Button } from 'antd';

//my components
import NewPartForm from './NewPartForm'
import PartsTable from './PartsTable';
import { AnyARecord } from 'dns';

const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

const CloseButton = styled(Button)`
  margin-left:10px;
`;


const EditButton = styled.img`
  width:15px;
  height:15px;
  margin-left:5px;
  cursor:pointer;
`

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
      <Panel>
        <div style={{marginTop:30}}>
        <h3>create a project</h3>

        <NewPartForm/>
        <PartsTable/>
          
        </div>
      </Panel>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadParts));
