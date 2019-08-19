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
import NumericInput from "react-numeric-input";

// const backboneLength = 1839;
const backboneLength = 1840;

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

const Calced = styled.span`
  text-decoration:underline;
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
  preparedMasterMixVolume: number;
  sampleCount: number;
}

const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
  assembly: state.app.currentAssembly,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_ASSEMBLY, data: projectId}),
});

class ManualProtocolView extends React.Component<IProps, IState> {
  // public static getDerivedStateFromProps(props:IProps, state:IState) {
  //   return {finalParts: re};
  // }

  constructor (props:IProps) {
    super(props); 

    const projectId = (this.props.match.params as any).id;
    if (projectId) {
      this.props.onLoadProject(projectId);
    }

    this.state = {
      preparedMasterMixVolume: 10,
      sampleCount: 1,
    }

  }
  public render() {
    if (!this.props.assembly) {
      return <div>loading</div>
    }

    // const sampleCount = this.props.project.parts.filter(v=>v.selected).length + this.props.project.connectorIndexes.length;
    const sampleCount = this.props.assembly? this.props.assembly.length : 0;

    const dnaVolumeSum = this.props.assembly!.reduce((sum,v,i)=>{
      const vectorLen = v.sequence.length+backboneLength;
      const dnaMass = this.calcDNAMass(13, vectorLen);
      const dnaVolume = this.calcDNAVolume(dnaMass);
      return sum+dnaVolume;
    }, 0);
    
    return <React.Fragment>
      <Breadcrumb>
        <Breadcrumb.Item href='/projects'>Home</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}`}>step 1</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}/step2`}>step 2</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}/step3`}>step 3</Breadcrumb.Item>
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
            <th>Reagent</th>
            <th>10μL reaction</th>
            <th> 
              <Calced>
                <NumericInput 
                  min={1}
                  max={100}
                  size={1}
                  value={this.state.preparedMasterMixVolume}
                  onChange={(v)=>this.setState({preparedMasterMixVolume:(v as number)})}/>
                µL
              </Calced> reaction
            </th>
          </tr>
          <tr>
            <th>T4 Ligase Reaction Buffer</th>
            <td>1µL</td>
            <td>{(this.state.preparedMasterMixVolume/10).toFixed(3)}µL</td>
          </tr>
          <tr>
            <th>BSA</th>
            <td>0.1µL</td>
            <td>{(this.state.preparedMasterMixVolume/100).toFixed(3)}µL</td>
          </tr>
          <tr>
            <th>Fast Digest Esp3I</th>
            <td>0.5µL</td>
            <td>{(this.state.preparedMasterMixVolume*0.05).toFixed(3)}µL</td>
          </tr>
          <tr>
            <th>T4 DNA Ligase</th>
            <td>0.25µL</td>
            <td>{(this.state.preparedMasterMixVolume*0.025).toFixed(3)}µL</td>
          </tr>
        </Table>
        <Li>
          Next, place on ice 0.2mL PCR tubes. Add an equimolar amount of 
          each part plasmid (13fmol)
          and 0.5µL of the receiver vector (10 ng/µL). 
          Add nuclease-free water to a final volume of 8.15µL. 
        </Li>
        <Table bordered hover>
          <tr>
            <th></th>
            <th>part</th>
            <th>length(bp)</th>
            <th>ng</th>
            <th>µL</th>
          </tr>
          {
            this.props.assembly!.map((v,i)=>{
              const vectorLen = v.sequence.length+backboneLength;
              const dnaMass = this.calcDNAMass(13, vectorLen);
              const dnaVolume = this.calcDNAVolume(dnaMass);
              return <tr>
                <td>{i+1}</td>
                <td>{v.name}</td>
                <td>{vectorLen}</td>
                <td>{dnaMass.toFixed(3)}ng</td>
                <td>{dnaVolume.toFixed(3)}µL</td>
              </tr>})
          }
          <tr>
            <td/>
            <td>receiver vector</td>
            <td/>
            <td/>
            <td>50µL</td>
          </tr>
          <tr>
            <td/>
            <td>water</td>
            <td/>
            <td/>
            <td>{(10-1.85-dnaVolumeSum-0.5).toFixed(3)}µL</td>
          </tr>
        </Table>
        <Li>
          Distribute 1.85 µL of the Golden Gate MM into each of the tubes containing the parts and the receiver vector to a final volume of 10 µL. Mix gently.
        </Li>
        <Li>
          Place the tubes into a thermocycler and run the following program:
          <br/>
          Step 1: 37 °C for 5 min
          <br/>
          Step 2: 37 °C for 5 min
          <br/>
          Step 3: 16 °C for 10 min (Go to step 2 and cycle 30 times)
          <br/>
          Step 4: 16 °C for 20 min
          <br/>
          Step 5: 37 °C for 30 min
          <br/>
          Step 6: 75 °C for 6 min
          <br/>
          Step 7: 4 °C hold
          <br/>
        </Li>
        <Li>
          Next, on ice prepare a Plasmid-Safe™ ATP-Dependent DNase mix. 
          For each sample, mix together 0.25 µL of Plasmid-Safe™ ATP-Dependent DNase 10 U/µL and 0.5 µL of 25 mM ATP solution. 
          Distribute 0.75µL in each Golden Gate reaction tube. Mix gently and incubate at 37 °C for 15 min.
        </Li>
        <Table bordered hover>
          <tr>
            <th>Reagent</th>
            <th>/ manual 10µL reaction</th>
            <th> 
              <Calced>
                <NumericInput 
                  min={1}
                  max={100}
                  size={1}
                  value={this.state.sampleCount}
                  onChange={(v)=>this.setState({sampleCount:(v as number)})}/>
              </Calced> samples
            </th>
          </tr>
          <tr>
            <td>Plasmid-Safe™ ATP-Dependent DNase 10 U/µL</td>
            <td>0.25µL</td>
            <td>{(0.25*this.state.sampleCount).toFixed(2)}µL</td>
          </tr>
          <tr>
            <td>25 mM ATP solution</td>
            <td>0.5µL</td>
            <td>{(0.5*this.state.sampleCount).toFixed(2)}µL</td>
          </tr>
        </Table>
        <Li>
          Place the tubes on ice and proceeded with bacterial transformation, plating on LB+Amp.
        </Li>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManualProtocolView));