import * as React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { IUserInfo } from '../types';
import {Button} from 'react-bootstrap';
import uuid from 'uuid/v1';
import Axios from 'axios';
import conf from '../conf';
import { getProjectById } from '../backendCalls';
import PartSelector from './PartsSelector';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  projectId: string;
  onProjectLoaded?: (project: any) => void;
}
interface IState {
  project: any;
}

class ProjectLodader extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      project: undefined,
    };
  }

  public render() {
    if (this.state.project === undefined) {
      return (
        <div> loading </div>
      );
    } else {
      return (
        <PartSelector projectId={this.props.projectId}/>
      );
    }
  }

  public async componentDidMount() {
    if (this.props.projectId) {
      try {
        const project = await getProjectById(this.props.projectId);
        this.setState({project});
        if (this.props.onProjectLoaded) {
          this.props.onProjectLoaded(project);
        }
      } catch (error) {
        this.setState({project: {}});
        if (this.props.onProjectLoaded) {
          this.props.onProjectLoaded({});
        }
      }
    }
  }
}

export default withRouter(ProjectLodader);
