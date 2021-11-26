import * as React from 'react'
import {Button, Table, Breadcrumb} from 'react-bootstrap';
import styled from 'styled-components';
import {DNASeq} from '../gbGenerator';
import vectorReceiver from '../vectorReceiver.json';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IProject, IPartSequence, IConnector } from '../types.js';
import { Dispatch } from 'redux';
import { 
  GET_PROJECT,
  SET_ASSEMBLY,
  SAVE_ASSEMBLY,
  GET_ALL_CONNECTORS,
  DOWNLOAD_CSV_MULTI,
} from '../redux/actions';
import qs from 'qs';
import conf from '../conf';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

const RedSpan = styled.span`
  color:red;
`;

interface IProps extends RouteComponentProps {
  selectedParts: any[],
  selectedShortcuts: any[],
  onLoadProject: (projectId: string) => void,
  onClickNext?: (selectedParts:any)=>void,
  dispatchGetAllConnectors:()=>void,
  dispatchDownloadCSV:(projectId: string) => void,
  project: IProject;
  assembly?: IPartSequence[];
  connectors: IConnector[];
}
interface IState {
  assembleCount: number;
}

const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
  assembly: state.app.currentAssembly,
  connectors: state.app.connectors,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_PROJECT, data: projectId}),
  dispatchGetAllConnectors: ()=>dispatch({type:GET_ALL_CONNECTORS}),
  dispatchDownloadCSV: (projectId: string)=>dispatch({type:DOWNLOAD_CSV_MULTI, data: projectId}),
});

class Assemble extends React.Component<IProps, IState> {
  public static getDerivedStateFromProps(props:IProps, state:IState) {
    let count = 1;
    for(const ids of props.project.partsMultiIds) {
      if(ids && ids.length>0) {
        count*=ids.length;
      }
    }
    return {assembleCount:count}
  }
  constructor (props:IProps) {
    super(props); 

    const projectId = (this.props.match.params as any).id;
    if (projectId) {
      this.props.onLoadProject(projectId);
    }

    this.state = {
      assembleCount:1,
    }

  }
  public render() {

    return <React.Fragment>
      <Breadcrumb>
        <Breadcrumb.Item href='/dashboard'>Home</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}`}>step 1</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}/step2B`}>step 2</Breadcrumb.Item>
        <Breadcrumb.Item active>step 3: generate genbank ({this.props.project.name})</Breadcrumb.Item>
      </Breadcrumb>
    <Panel>


      {/* <div>{JSON.stringify(this.props.project.connectorIndexes)}</div>
      <div>{JSON.stringify(this.props.project.parts)}</div> */}
      <p>{this.state.assembleCount} assemblies available</p>
      <div>
        {/* <Button variant="primary" size="lg" onClick={this.downloadGenbank}>download genbank</Button>
        &nbsp;
        <Button variant="primary" size="lg" onClick={this.onClickManualProtocol}>Manual Protocol</Button>
        &nbsp;
        <Button variant="primary" size="lg" onClick={this.onClickAutoProtocol}>Automatic Protocol</Button>
        &nbsp; */}
        <a href={`${conf.serverURL}/api/project/${this.props.project._id}/multiResults`}><Button variant="primary" size="lg">Download CSV</Button></a>
      </div>
    </Panel>
    </React.Fragment>
  }

  private generateGenbank (parts:any[]) {
  }

  private downloadGenbank = () => {
    
  }

  private onClickManualProtocol = () => {
  }

  private onClickAutoProtocol = () => {
  }

  private onClickCSV = ()=>{
    if (this.props.project._id) {
    this.props.dispatchDownloadCSV(this.props.project._id!)
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Assemble));