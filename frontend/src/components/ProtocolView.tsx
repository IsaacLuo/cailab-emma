// step 4: generate protocol of manual or auto Emma Project
import * as React from 'react'
import {Dropdown, Button, Table, Breadcrumb} from 'react-bootstrap';
import styled from 'styled-components';

import CONNECTORS from '../connectors.json'
import {IFeature, DNASeq} from '../gbGenerator';
import vectorReceiver from '../vectorReceiver.json';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IPartDetail, IProject, IPartSequence } from '../types.js';
import { Dispatch } from 'redux';
import { GET_ASSEMBLY } from '../redux/actions';

const backboneLength = 1839;

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
  assembly?: IPartSequence[];
  onLoadProject: (projectId: string) => void,
  
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
  assembly: state.app.currentAssembly,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_ASSEMBLY, data: projectId}),
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

  }
  public render() {
    if (!this.props.assembly) {
      return <div>loading</div>
    }

    // const sampleCount = this.props.project.parts.filter(v=>v.selected).length + this.props.project.connectorIndexes.length;
    const sampleCount = this.props.assembly? this.props.assembly.length : 0;
    
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
          Next, place on ice {sampleCount} 0.2mL PCR tubes. To each tube, add an equimolar amount of 
          each part plasmid (13fmol)
          and 0.5µL of the receiver vector (10 ng/µL). 
          Add nuclease-free water to a final volume of 8.15µL. 
        </Li>
        <Table bordered hover>
          <tr>
            <th></th>
            <th>part</th>
            <th>length</th>
            <th>ng</th>
            <th>µL</th>
          </tr>
          {
            this.props.assembly!.map((v,i)=>{
              const vectorLen = v.sequence.length+backboneLength;
              const dnaMass = this.calcDNAMass(13, vectorLen);
              return <tr>
                <td>{i+1}</td>
                <td>{v.name}</td>
                <td>{vectorLen}</td>
                <td>{dnaMass.toFixed(3)}ng</td>
                <td>{this.calcDNAVolume(dnaMass).toFixed(3)}µL</td>
              </tr>})
          }
        </Table>
      </ol>
    </Panel>
    </React.Fragment>
  }

  /**
   * 
   * @param fmol 
   * @param dnaLen 
   * @return ng
   */
  private calcDNAMass(fmol:number, dnaLen:number) {
    return fmol * (dnaLen * 0.00061796 + 0.00003604);
  }

  /**
   * 
   * @param mass in ng
   * @return μL
   */
  private calcDNAVolume(mass:number) {
    return mass / 50;
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProtocolView));