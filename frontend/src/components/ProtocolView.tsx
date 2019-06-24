// step 4: generate protocol of manual or auto Emma Project
import * as React from 'react'
import {Dropdown, Button, Table, Breadcrumb} from 'react-bootstrap';
import styled from 'styled-components';

import CONNECTORS from '../connectors.json'
import {IFeature, DNASeq} from '../gbGenerator';
import vectorReceiver from '../vectorReceiver.json';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IPartDetail, IProject } from '../types.js';
import { Dispatch } from 'redux';
import { GET_PROJECT } from '../redux/actions';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

const Title1 = styled.h1`

`;

const Title2 = styled.h2`

`;

const Li = styled.li`
`;

interface IProps extends RouteComponentProps {
  project: IProject;
  onLoadProject: (projectId: string) => void,
  
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_PROJECT, data: projectId}),
});

class ProtocolView extends React.Component<IProps, IState> {
  // public static getDerivedStateFromProps(props:IProps, state:IState) {
  //   return {finalParts: re};
  // }

  constructor (props:IProps) {
    super(props); 

    const projectId = (this.props.match.params as any).id;
    if (projectId) {
      this.props.onLoadProject(projectId);
    }

    // this.state = {
    //   finalParts: [],
    //   genbank: '',
    // }

  }
  public render() {

    const sampleCount = this.props.project.parts.filter(v=>v.selected).length + this.props.project.connectorIndexes.length;

    return <React.Fragment>
      <Breadcrumb>
        <Breadcrumb.Item href='/projects'>Home</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}`}>step 1</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}/step2`}>step 2</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}/step3`}>step 2</Breadcrumb.Item>
        <Breadcrumb.Item active>step 4: generate protocol ({this.props.project.name})</Breadcrumb.Item>
      </Breadcrumb>
    <Panel>
      <Title1>
        EMMA - Assembly Golden Gate assembly reaction
      </Title1>
      <Title2>
        Equipment/Reagents:
      </Title2>
      <ul>
      <Li>Thermocycler</Li>
      <Li>T4 DNA ligase 400U/µL (NEB: M0202S)</Li>
      <Li>10X T4 ligase reaction buffer (included in NEB: M0202S)</Li>
      <Li>Bovine serum albumin (BSA) (NEB: B9000S)</Li>
      <Li>Fast digest Esp3I (Thermo Fisher Scientific: FD0454)</Li>
      <Li>Plasmid-Safe™ ATP-dependent DNase 10 U/µL (Epicenter: E3110K)</Li>
      <Li>ATP solution, 25 mM (included in Epicenter: E3110K)</Li>
      <Li>Part plasmids (50 ng/µL)</Li>
      <Li>Receiver plasmid (10 ng/µL)</Li>
      </ul>
      <ol>
        <Li>On ice, prepare a Golden Gate assembly MM. For each reaction, mix together
            1 µL 10X T4 DNA Ligase Reaction Buffer, 0.1 µL BSA, 0.5 µL FastDigest Esp3I
            and 0.25 µL T4 DNA ligase 400 U/µL. Multiply the volume for each component
            by the number of reactions. Mix the final solution gently.
        </Li>
        <Table bordered hover>
          <tr>
            <th></th>
            <th>volume per component</th>
            <th>volume for {sampleCount} items</th>
          </tr>
          <tr>
            <th>Reagent</th>
            <td>10μL reaction</td>
            <td>{sampleCount*10}μL reaction</td>
          </tr>
          <tr>
            <th>T4 Ligase Reaction Buffer</th>
            <td>1µL</td>
            <td>{sampleCount*1}μL</td>
          </tr>
          <tr>
            <th>BSA</th>
            <td>0.1µL</td>
            <td>{(sampleCount*0.1).toFixed(2)}μL</td>
          </tr>
          <tr>
            <th>Fast Digest Esp3I</th>
            <td>0.5µL</td>
            <td>{(sampleCount*0.5).toFixed(2)}μL</td>
          </tr>
          <tr>
            <th>T4 DNA Ligase</th>
            <td>0.25µL</td>
            <td>{(sampleCount*0.25).toFixed(2)}μL</td>
          </tr>
        </Table>
        <Li>
          Next, place on ice as many 0.2 mL PCR tubes as assemblies 
          to be carried out. To each tube, add an equimolar amount of 
          each part plasmid (13 fmol)
          and 0.5 µL of the receiver vector (10 ng/µL). 
          Add nuclease-free water to a final volume of 8.15 µL . 
        </Li>
      </ol>
    </Panel>
    </React.Fragment>
  }

  private calcDNAMass(mol:number, dnaLen:number) {
    return mol * dnaLen * 617.96 + 36.04;
  }

  private calcDNAVolume(mass:number) {
    return mass / 50;
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProtocolView));