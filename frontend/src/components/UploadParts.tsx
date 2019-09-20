/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect, Link } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import { 
  SET_CURRENT_PROJECT, 
  CREATE_PROJECT, 
  GET_MY_PROJECTS, 
  DELETE_PROJECT, 
  RENAME_PROJECT,
  NEW_PART,
} from '../redux/actions';
import ProjectWizard from './ProjectWizard';
import pencilSVG from '../icons/tiny-pencil.svg'

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

  dispatchNewPart: (form:any)=>void;
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchNewPart: (form:any)=>dispatch({type:NEW_PART, data:form})
});

class UploadParts extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      projectName: `project ${new Date().toLocaleString()}`,
      editingProjectName: '',
    };
  }

  public componentDidMount() {
  }

  public render() {

    const { Column, ColumnGroup } = Table;

const data = [
  {
    key: '1',
    firstName: 'John',
    lastName: 'Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    firstName: 'Jim',
    lastName: 'Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    firstName: 'Joe',
    lastName: 'Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

    return (
      <Panel>
        <div style={{marginTop:30}}>
        <h3>create a project</h3>
          <PartsTable/>

          <NewPartForm onSubmitData={this.handleSubmit}/>
        </div>
      </Panel>
    );
  }

  public componentWillUnmount() {
  }

  private handleSubmit = (form:any) => {
    this.props.dispatchNewPart(form);
  }


}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadParts));
