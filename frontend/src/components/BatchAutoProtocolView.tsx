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
import { GET_ASSEMBLY_LIST } from '../redux/actions';
import { IAssembly } from '../../../api/src/models.js';

// const backboneLength = 1839;
const backboneLength = 1840;

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

const WellNameInput = styled.input`
  width: 50px;
  padding: 5px;
`;

const Calced = styled.span`
  text-decoration:underline;
`;


interface IProps extends RouteComponentProps {
  assemblyProjects?: IAssembly[];
  loadAssemblyList: (assemblyId: string) => void;
}
interface IState {
  partCount:number;
}

const mapStateToProps = (state: IStoreState) => ({
  assemblyProjects: state.app.assemblyProjects,
  assembly: state.app.currentAssembly,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAssemblyList: (assemblyId: string) => dispatch({type: GET_ASSEMBLY_LIST, data: assemblyId}),
});

class BatchAutoProtocolView extends React.Component<IProps, IState> {
  public static getDerivedStateFromProps(props:IProps, state:IState) {
    let partCount = 0;
    if (props.assemblyProjects) {
      partCount = props.assemblyProjects.reduce((c:number,ass:IAssembly)=>c+ass.finalParts.length, 0);
      props.assemblyProjects.reduce((c:number,ass:IAssembly)=>c+ass.finalParts.length+backboneLength, 0);
    }
    return {
      partCount,
    };
  }

  constructor (props:IProps) {
    super(props); 
    const assemblyListId = (this.props.match.params as any).id;
    console.log('test');
    this.props.loadAssemblyList(assemblyListId);

  }
  public render() {
    if (!this.props.assemblyProjects) {
      return <div>loading</div>
    }


    const sampleCount = this.state.partCount;
    // const partVolumes = this.props.assembly.map(v=>this.calcDNAVolume(this.calcDNAMass(1.3, v.sequence.length+backboneLength)));
    // const partVolumesSum = partVolumes.reduce((a,b)=>a+b)
    const partVolumesSum = 0.1
    const masterMixVolumeNL = Math.floor(235 + partVolumesSum*1000)
    
    return <React.Fragment>
      <Breadcrumb>
        <Breadcrumb.Item href='/projects'>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>generate protocols</Breadcrumb.Item>
      </Breadcrumb>
      <Panel>
        <Title1>
          EMMA - Assembly Golden Gate assembly reaction
        </Title1>
        <p>protocol for assembling {this.props.assemblyProjects.length} projects, {this.state.partCount} parts </p>

        <Title2>
        Equipment/Reagents:
      </Title2>
      <ul>
        <Li>Echo 550 liquid handler (Labcyte)</Li>
        <Li>Echo 550 qualified 384-well polypropylene source plate (384PP, Labycte LP-0200)</Li>
        <Li>Echo 550 qualified 384-well low dead volume source plate (384LDV, Labcyte PP-0200)</Li>
        <Li>96-well PCR plate defined in the Echo labware list (e.g. Eppendorf, Bio-rad)</Li>
        <Li>96-well thermocycler</Li>

        <Li>T4 DNA ligase 400U/µL (NEB: M0202S)</Li>
        <Li>10X T4 ligase reaction buffer (included in NEB: M0202S)</Li>
        <Li>Bovine serum albumin (BSA) (NEB: B9000S)</Li>
        <Li>Fast digest Esp3I (Thermo Fisher Scientific: FD0454)</Li>
        <Li>Plasmid-Safe™ ATP-dependent DNase 10 U/µL (Epicenter: E3110K)</Li>
        <Li>ATP solution, 25 mM (included in Epicenter: E3110K)</Li>
        <Li>Part plasmids (50 ng/µL) </Li>
        <Li>Receiver plasmid (10 ng/µL)</Li>
      </ul>
      <ol>
        <Li>
          On ice, prepare a Golden Gate assembly MM. For each reaction, mix together 1 µL 10X T4 DNA Ligase Reaction Buffer,
          0.1 µL BSA, 0.5 µL FastDigest Esp3I and 0.25 µL T4 DNA ligase 400 U/µL. Multiply the volume for each component by 
          the number of reactions. Mix the final solution gently.
        </Li>
        <Table bordered hover>
          <tr>
            <th>Reagent</th>
            <th>/10µL reaction</th>
            <th>For <Calced>{sampleCount*1.85}µL</Calced> master mix</th>
          </tr>
          <tr>
            <td>T4 Ligase Reaction Buffer</td>
            <td>1µL</td>
            <td><Calced>{sampleCount*1}μL</Calced> reaction</td>
          </tr>
          <tr>
            <td>BSA</td>
            <td>0.1µL</td>
            <td><Calced>{(sampleCount*0.1).toFixed(2)}μL</Calced></td>
          </tr>
          <tr>
            <td>Fast Digest Esp3I</td>
            <td>0.5µL</td>
            <td><Calced>{(sampleCount*0.5).toFixed(2)}μL</Calced></td>
          </tr>
          <tr>
            <td>T4 DNA Ligase</td>
            <td>0.25µL</td>
            <td><Calced>{(sampleCount*0.25).toFixed(2)}μL</Calced></td>
          </tr>
        </Table>
        <Li>
          Dispense 30-65µL of master mix into well A1
          
          a 384PP Echo source plate, and 15-65µL of nuclease-free water to well A2
          
        </Li>
        <Li>
          Allow the source plates to adjust to room temperature and centrifuge the DNA part (LDV) source plate 
          e.g. 3000xg for 2-3 minutes, checking that the meniscus is flat. The destination plate should be kept 
          on ice as far as possible to reduce evaporation. 
        </Li>
        <Li>
          Run a protocol to dispense <Calced>{masterMixVolumeNL} nL</Calced> of master mix and <Calced>{1000-masterMixVolumeNL} nL</Calced> of water 
          into each well of the 96-well PCR destination plate to be used  for an assembly. Spin down the destination 
          plate once the protocol has finished, and seal and store the source plate at -20 °C.
        </Li>
        <Li>
          5.	Use the CAD-generated picklist to dispense an equimolar amount of each 
          part plasmid (1.3fmol), and 0.5 µL of the 10 ng/µL receiver plasmid, into 
          the destination well for each assembly.  Seal the plate and spin down. 
          Seal the source plate and store.cfv fc6c77 
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
          Prepare 1x T4 ligase buffer from the 10x T4 ligase buffer, 
          and add to the assembly wells to a final volume of 2µL.
        </Li>
        <Li>
          repare PlasmidSafe DNase mix:
          <Table bordered hover>
            <tr>
              <th>Reagent</th>
              <th>each</th>
              <th>for <Calced>{sampleCount}</Calced> parts</th>
            </tr>
            <tr>
              <td>1x T4 ligase buffer</td>
              <td>6µL</td>
              <td><Calced>{(6*sampleCount).toFixed(2)}µL</Calced></td>
            </tr>
            <tr>
              <td>25 mM ATP</td>
              <td>1.5µL</td>
              <td><Calced>{(1.5*sampleCount).toFixed(2)}µL</Calced></td>
            </tr>
            <tr>
              <td>PlasmidSafe DNase</td>
              <td>0.75µL</td>
              <td><Calced>{(0.75*sampleCount).toFixed(2)}µL</Calced></td>
            </tr>
            <tr>
              <td>Total</td>
              <td>8.25µL</td>
              <td><Calced>{(8.25*sampleCount).toFixed(2)}µL</Calced></td>
            </tr>
          </Table>
          Dispense 3 µL PlasmidSafe DNase mix into each assembly reaction well, 
          mix gently and incubate at 37 °C for 15 minutes
        </Li>

        <Li>
          Place the tubes on ice and proceeded with bacterial transformation, 
          plating on LB+Amp (add 20 µL of competent cells to the well containing the assembly reaction).
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BatchAutoProtocolView));