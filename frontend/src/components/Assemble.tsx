import * as React from 'react'
import {Dropdown, Button, Table, Breadcrumb} from 'react-bootstrap';
import styled from 'styled-components';

import CONNECTORS from '../connectors.json'
import {IFeature, DNASeq} from '../gbGenerator';
import vectorReceiver from '../vectorReceiver.json';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IPartDetail, IProject, IPartSequence, IConnector } from '../types.js';
import { Dispatch } from 'redux';
import { 
  GET_PROJECT,
  SET_ASSEMBLY,
  SAVE_ASSEMBLY,
  GET_ALL_CONNECTORS,
} from '../redux/actions';
import { Link } from 'react-router-dom';
import qs from 'qs';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

const SelectionRow = styled.div`
  display:flex;
`;
const SVGIcon = styled.div`
  width:220px;
`;

const RedSpan = styled.span`
  color:red;
`;

interface IProps extends RouteComponentProps {
  selectedParts: any[],
  selectedShortcuts: any[],
  onLoadProject: (projectId: string) => void,
  onClickNext?: (selectedParts:any)=>void,
  setAssembly: (finalParts: IPartSequence[])=>void,
  saveAssembly: (projectId:string, finalParts: IPartSequence[])=>Promise<any>,
  dispatchGetAllConnectors:()=>void,
  project: IProject;
  assembly?: IPartSequence[];
  connectors: IConnector[];
}
interface IState {
  finalParts: IPartSequence[],
  genbank: string,
}

const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
  assembly: state.app.currentAssembly,
  connectors: state.app.connectors,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_PROJECT, data: projectId}),
  setAssembly: (finalParts:IPartSequence[])=> dispatch({type:SET_ASSEMBLY, data:finalParts}),
  saveAssembly: (projectId:string, finalParts:IPartSequence[]) => new Promise(
    resolve => dispatch({
      type:SAVE_ASSEMBLY, 
      data:{projectId, finalParts}, 
      cb: resolve,
    })),
  dispatchGetAllConnectors: ()=>dispatch({type:GET_ALL_CONNECTORS}),
});

class Assemble extends React.Component<IProps, IState> {
  public static getDerivedStateFromProps(props:IProps, state:IState) {
    // const shortCuts = props.project.connectorIndexes.map(v=>CONNECTORS[v]);
    const shortCuts = props.project.connectors;
    const selectedParts = props.project.parts.filter(part=>part.selected);
    // console.log(selectedParts);
    // merge sort
    let i=0;
    let j=0;
    const re:IPartSequence[] = [];

    while(i<shortCuts.length && j<selectedParts.length) {
      const idxI = shortCuts[i].posBegin;
      const idxJ = selectedParts[j].position;
      if (idxI < idxJ) {
        re.push({type: 'connector', _id:shortCuts[i]._id,  name: shortCuts[i].name, sequence: shortCuts[i].sequence})
        i++;
      } else {
        if(selectedParts[j].partDefinition) {
          re.push({type: 'part', _id:selectedParts[j].partDefinition!._id, name: selectedParts[j].partDefinition!.part.name, sequence: selectedParts[j].partDefinition!.part.sequence})
        }
        j++;
      }
    }
    if (i===shortCuts.length) {
      while (j < selectedParts.length) {
        // console.log(j);
        if(selectedParts[j].partDefinition) {
          re.push({type: 'part', _id:selectedParts[j].partDefinition!._id, name: selectedParts[j].partDefinition!.part.name, sequence: selectedParts[j].partDefinition!.part.sequence})
        }
        j++;
      }
    } else {
      while (i<shortCuts.length) {
        re.push({type: 'connector', _id:shortCuts[i]._id, name: shortCuts[i].name, sequence: shortCuts[i].sequence})
        i++;
      }
    }

    // console.log({re, shortCuts, selectedParts, project:props.project});
    return {finalParts: re};
  }
  constructor (props:IProps) {
    super(props); 

    const projectId = (this.props.match.params as any).id;
    if (projectId) {
      this.props.onLoadProject(projectId);
    }

    this.state = {
      finalParts: [],
      genbank: '',
    }

  }
  public render() {

    return <React.Fragment>
      <Breadcrumb>
        <Breadcrumb.Item href='/projects'>Home</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}`}>step 1</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}/step2`}>step 2</Breadcrumb.Item>
        <Breadcrumb.Item active>step 3: generate genbank ({this.props.project.name})</Breadcrumb.Item>
      </Breadcrumb>
    <Panel>


      {/* <div>{JSON.stringify(this.props.project.connectorIndexes)}</div>
      <div>{JSON.stringify(this.props.project.parts)}</div> */}
      <Table striped={true} bordered={true} hover={true}>
        <thead>
          <tr>
            <th>name</th>
            <th>sequence</th>
          </tr>
        </thead>
        <tbody>
          {this.state.finalParts.map((v,i)=>
            v.sequence ?
              <tr key={i}>
                <td>{v.name}</td>
                <td style={{wordBreak: 'break-all'}}>
                  <RedSpan>
                    {v.sequence.substr(0,4)}
                  </RedSpan>
                  {v.sequence.substring(4, v.sequence.length-4)}
                  <RedSpan>
                    {v.sequence.substr(v.sequence.length-4,4)}
                  </RedSpan>
                  </td>
              </tr>
            : <tr key={i}><td>{v.name}</td><td>no sequence</td></tr>
            )}
          <tr>
          </tr>
        </tbody>
      </Table>
      <div>
        <Button variant="primary" size="lg" onClick={this.downloadGenbank}>download genbank</Button>
        <Button variant="primary" size="lg" onClick={this.onClickManualProtocol}>Manual Protocol</Button>
        <Button variant="primary" size="lg" onClick={this.onClickAutoProtocol}>Automatic Protocol</Button>
      </div>
    </Panel>
    </React.Fragment>
  }

  private generateGenbank (parts:any[]) {
    const dnaSeq = new DNASeq({
      sequence: vectorReceiver.seqeunce,
      features: [...vectorReceiver.features],
    });

    // console.log(dnaSeq, parts);

    parts.forEach(part => {
      
      const sequence = part.sequence.substr(0,part.sequence.length-4);
      const begin = dnaSeq.sequence.length;

      dnaSeq.sequence += sequence;
      dnaSeq.features.push({
        from: begin+4,
        to: begin + sequence.length,
        strand: '.',
        ctype: 'misc_feature',
        label: part.name,
      });

    })

    return dnaSeq.toGenbank();
  }

  private downloadGenbank = () => {
    const genbank = this.generateGenbank(this.state.finalParts);
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([genbank], {type: 'text/plain'}));
    a.download = `${this.props.project.name}.gb`;

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
  }

  private onClickManualProtocol = () => {
    this.props.saveAssembly(this.props.project._id!, this.state.finalParts);
    this.props.setAssembly(this.state.finalParts);
    this.props.history.push(`/project/${this.props.project._id}/protocols/human/manual`);
  }

  private onClickAutoProtocol = () => {
    this.props.saveAssembly(this.props.project._id!, this.state.finalParts).then(
      ()=>{
        this.props.setAssembly(this.state.finalParts);
        this.props.history.push(`/generateProtocols?${qs.stringify({preselected: [this.props.project._id]})}`)
      }
    );
    
    
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Assemble));