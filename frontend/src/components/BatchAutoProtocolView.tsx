// step 4: generate protocol of manual or auto Emma Project
import * as React from 'react'
import {Button, Table, Breadcrumb} from 'react-bootstrap';
import styled from 'styled-components';

import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IAssembly, IPlatesListItem, IPlatesListItemWithDetail, IPlateMapItem, IPartSequence} from '../types.js';
import { Dispatch } from 'redux';
import { GET_ASSEMBLY_LIST, GET_PLATE_LIST, GET_PLATE_DETAIL } from '../redux/actions';

import papaparse from 'papaparse'
import { generateEchoSheet, generateMasterMixEchoSheet, calcDNAVolume, calcDNAMass } from '../generateEchoSheet';
import NumericInput from "react-numeric-input";
import { AutoComplete, Input } from 'antd';

import {SearchOutlined} from '@ant-design/icons';


// const MyDropzone = styled(Dropzone)`
//   height: 30px;
//   border: solid 1px black;
// `


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


const Calced = styled.span`
  text-decoration:underline;
`;

function download(filename:string, text:string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


interface IProps extends RouteComponentProps {
  assemblyProjects?: IAssembly[];
  loadAssemblyList: (assemblyId: string) => void;
  dispatchGetPlatesList: ()=>void;

  dispatchGetPartListFromPlate: (plateId:string)=>void;
  
  plates: IPlatesListItem[];
  currentSelectedPlate?: IPlatesListItemWithDetail;
  currentPlateMap: IPlateMapItem[];
}
interface IState {
  partCount:number;
  partLocations:any;
  masterMixVolumes:number[];
  waterVolumes:number[];
  preparedMasterMixVolume: number;
  dnaseMixExtra: number;

  plateId?: string;
  downloadProtocolEnabled: boolean;
  warningMessage: string;
}

const mapStateToProps = (state: IStoreState) => ({
  assemblyProjects: state.app.assemblyProjects,
  plates: state.app.platesList,
  currentSelectedPlate: state.app.currentSelectedPlate,
  currentPlateMap: state.app.currentPlateMap,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAssemblyList: (assemblyId: string) => dispatch({type: GET_ASSEMBLY_LIST, data: assemblyId}),
  dispatchGetPlatesList: ()=>dispatch({type:GET_PLATE_LIST}),
  dispatchGetPartListFromPlate: (plateId:string)=> dispatch({type: GET_PLATE_DETAIL, data: plateId}),
});

/**
 * 
 * @param vol microLitters
 */
const toEchoVolume = (vol: number) =>{
  return Math.round(vol*1000/5)*5/1000;
}

class BatchAutoProtocolView extends React.Component<IProps, IState> {

  public static getDerivedStateFromProps(props:IProps, state:IState) {
    let partCount = 0;
    let masterMixVolumes:number[] = []; 
    let waterVolumes:number[]=[];
    let preparedMasterMixVolume = state.preparedMasterMixVolume;
    let downloadProtocolEnabled = state.downloadProtocolEnabled;
    let warningMessage = state.warningMessage;
    const missingPartNames:string[] = [];
    // const partVolumesSum = partVolumes.reduce((a,b)=>a+b)
    if (props.assemblyProjects) {
      partCount = props.assemblyProjects.reduce((c:number,ass:IAssembly)=>c+ass.finalParts.length, 0);
      if(partCount*1.85>preparedMasterMixVolume) {
        preparedMasterMixVolume = Math.ceil(partCount*1.85);
      }
      // props.assemblyProjects.reduce((c:number,ass:IAssembly)=>c+ass.finalParts.length+backboneLength, 0);
      for (const project of props.assemblyProjects) {
        let masterMixVolumeNL = 0;
        console.log({project});
        for (const part of project.finalParts) {
          masterMixVolumeNL+= calcDNAVolume(calcDNAMass(1.3, part.sequence.length+backboneLength));
        }
        masterMixVolumes.push(masterMixVolumeNL);
        waterVolumes.push(1000-masterMixVolumeNL);
      }
    }
    const locationDict:any = {};
    if (props.currentPlateMap && props.assemblyProjects && props.currentPlateMap.length!==0 && props.assemblyProjects.length !== 0) {
      const plateMap = props.currentPlateMap.filter(v=>v);
      plateMap.forEach((item:IPlateMapItem) => locationDict[item._id] = item);
      console.log(plateMap, locationDict, props.assemblyProjects);
      if(props.assemblyProjects.every(
        (project:IAssembly)=>
          project.finalParts.every(
            (part:IPartSequence)=> {
              if (locationDict[part.connectorId || part.partId!]) {
                console.log(locationDict[part.connectorId || part.partId!]);
                return true;
              } else {
                missingPartNames.push(part.name);
                return false;
              }
            }
            ))
      ) { // all parts in plate
        downloadProtocolEnabled = true;
        warningMessage = '';
      } else {
        downloadProtocolEnabled = false;
        warningMessage = `some parts are missing: ${missingPartNames.join(' ')}`;
      }

    }

    return {
      ...state,
      partCount,
      masterMixVolumes,
      waterVolumes,
      preparedMasterMixVolume,
      downloadProtocolEnabled,
      warningMessage,
      partLocations: locationDict,
    };
  }

  constructor (props:IProps) {
    super(props); 
    const assemblyListId = (this.props.match.params as any).id;
    console.log('test');
    this.props.loadAssemblyList(assemblyListId);
    this.state = {
      partCount:0,
      partLocations:undefined,
      masterMixVolumes:[],
      waterVolumes:[],
      preparedMasterMixVolume: 30,
      dnaseMixExtra: 1.5,
      downloadProtocolEnabled: false,
      warningMessage: '',
    };

  }

  public componentDidMount() {
    this.props.dispatchGetPlatesList();
  }

  public render() {
    if (!this.props.assemblyProjects) {
      return <div>loading</div>
    }


    const sampleCount = this.state.partCount;
    const masterMixVolumeNL = this.state.masterMixVolumes.reduce((p,c)=>p+c,0);
    const assembliesCount = this.props.assemblyProjects!.length;
    
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
          <tbody>
          <tr>
            <th>Reagent</th>
            <th>/10µL reaction</th>
            <th>For <Calced>{sampleCount*1.85}µL</Calced> master mix</th>
            <th>For <Calced><NumericInput min={Math.floor(sampleCount*1.85)>30?Math.floor(sampleCount*1.85):30} max={65} size={1} value={this.state.preparedMasterMixVolume} onChange={(v)=>this.setState({preparedMasterMixVolume:(v as number)})}/>µL</Calced> master mix</th>
          </tr>
          <tr>
            <td>T4 Ligase Reaction Buffer</td>
            <td>1µL</td>
            <td><Calced>{toEchoVolume(sampleCount*1).toFixed(3)}μL</Calced></td>
            <td><Calced>{toEchoVolume(this.state.preparedMasterMixVolume*1/1.85).toFixed(3)}μL</Calced></td>
          </tr>
          <tr>
            <td>BSA</td>
            <td>0.1µL</td>
            <td><Calced>{toEchoVolume(sampleCount*0.1).toFixed(3)}μL</Calced></td>
            <td><Calced>{toEchoVolume(this.state.preparedMasterMixVolume*0.1/1.85).toFixed(3)}μL</Calced></td>
          </tr>
          <tr>
            <td>Fast Digest Esp3I</td>
            <td>0.5µL</td>
            <td><Calced>{toEchoVolume(sampleCount*0.5).toFixed(3)}μL</Calced></td>
            <td><Calced>{toEchoVolume(this.state.preparedMasterMixVolume*0.5/1.85).toFixed(3)}μL</Calced></td>
          </tr>
          <tr>
            <td>T4 DNA Ligase</td>
            <td>0.25µL</td>
            <td><Calced>{toEchoVolume(sampleCount*0.25).toFixed(3)}μL</Calced></td>
            <td><Calced>{toEchoVolume(this.state.preparedMasterMixVolume*0.25/1.85).toFixed(3)}μL</Calced></td>
          </tr>
          </tbody>
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
          into well of the 96-well PCR destination plate to be used  for an assembly. Spin down the destination 
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
          <tbody>
            <tr>
              <th>Reagent</th>
              <th>each</th>
              <th>for <Calced>{assembliesCount}</Calced> assemblies</th>
              <th><Calced><NumericInput min={1.0} max={3.0} size={1} value={this.state.dnaseMixExtra} step={0.1} onChange={(v)=>this.setState({dnaseMixExtra:(v as number)})}/></Calced></th>
            </tr>
            <tr>
              <td>1x T4 ligase buffer</td>
              <td>3µL</td>
              <td><Calced>{toEchoVolume(3*assembliesCount).toFixed(3)}µL</Calced></td>
              <td><Calced>{toEchoVolume(this.state.dnaseMixExtra*3*assembliesCount).toFixed(3)}µL</Calced></td>
            </tr>
            <tr>
              <td>25 mM ATP</td>
              <td>0.25µL</td>
              <td><Calced>{toEchoVolume(0.25*assembliesCount).toFixed(3)}µL</Calced></td>
              <td><Calced>{toEchoVolume(this.state.dnaseMixExtra*0.25*assembliesCount).toFixed(3)}µL</Calced></td>
            </tr>
            <tr>
              <td>PlasmidSafe DNase</td>
              <td>0.125µL</td>
              <td><Calced>{toEchoVolume(0.125*assembliesCount).toFixed(3)}µL</Calced></td>
              <td><Calced>{toEchoVolume(this.state.dnaseMixExtra*0.125*assembliesCount).toFixed(3)}µL</Calced></td>
            </tr>
            <tr>
              <td>Total</td>
              <td>3.375µL</td>
              <td><Calced>{toEchoVolume(3.375*assembliesCount).toFixed(3)}µL</Calced></td>
              <td><Calced>{toEchoVolume(this.state.dnaseMixExtra*3.375*assembliesCount).toFixed(3)}µL</Calced></td>
            </tr>
            </tbody>
          </Table>
          Dispense 3 µL PlasmidSafe DNase mix into each assembly reaction well, 
          mix gently and incubate at 37 °C for 15 minutes
        </Li>

        <Li>
          Place the tubes on ice and proceeded with bacterial transformation, 
          plating on LB+Amp (add 20 µL of competent cells to the well containing the assembly reaction).
        </Li>
      </ol>

      <AutoComplete
        className="auto-complete"
        dropdownClassName="auto-compolete-dropdown"
        dropdownMatchSelectWidth={true}
        dropdownStyle={{ width: 300 }}
        size="large"
        style={{ width: '100%' }}
        dataSource={
          this.props.plates
          .map((plate:any,j:number) => 
          ({value:plate._id, text:plate.name}))
            // <AutoComplete.Option value={plate.name+plate._id} key={plate._id}>
            //   {plate.name}
            // </AutoComplete.Option>)
        }
        placeholder="input here"
        onSearch={this.handleSearchPlateName}
        onSelect={this.handleSelectPlate}
      >
        <Input suffix={<SearchOutlined className="certain-category-icon" />} />
      </AutoComplete>

      {/* <this.MyDropzone/> */}
      {this.state.downloadProtocolEnabled &&
        <div style={{marginTop:10}}>
          <Button onClick={this.onClickMasterMixEchoScript}>download master mix echo script</Button>
          .
          <Button onClick={this.onClickMainEchoScript}>download parts echo script</Button>
        </div>
      }
      {this.state.warningMessage &&
        <div style={{marginTop:10}}>
          {this.state.warningMessage}
        </div>
      }
      </Panel>
    </React.Fragment>
  }

  private handleSearchPlateName = () => {

  }

  private handleSelectPlate = (plateId:any) => {
    this.setState({plateId,});
    this.props.dispatchGetPartListFromPlate(plateId);
  }

  // private MyDropzone = () => {
  //   const onDrop = useCallback(acceptedFiles => {
  //     const reader = new FileReader()
  
  //     reader.onabort = () => console.log('file reading was aborted')
  //     reader.onerror = () => console.log('file reading has failed')
  //     reader.onload = () => {
  //       // Do whatever you want with the file contents
  //       const csvStr = reader.result as string;
  //       const pp = papaparse.parse(csvStr);
  //       // const fd = pp.data.filter((_,i)=>i>0&&i<17).map((v:string[])=>v.filter((_,i)=>i>0));
  //       const partLocations:any = {};
  //       for(let i=0;i<16;i++) {
  //         for (let j=0;j<24;j++) {
  //           if (pp.data[i+1][j+1]!==undefined && pp.data[i+1][j+1] !== '') {
  //             partLocations[pp.data[i+1][j+1]] = String.fromCharCode(65+i)+j;
  //           }
  //         }
  //       }
  //       this.setState({partLocations});
  //     }
  //     acceptedFiles.forEach((file:any) => reader.readAsBinaryString(file))
  //   }, [])
  //   const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  
  //   return (
  //     <DropzoneDiv {...getRootProps()}>
  //       <input {...getInputProps()} />
  //       <p>drop the plate definition csv file to here</p>
  //     </DropzoneDiv>
  //   )
  // }

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

  private onClickMasterMixEchoScript = () => {
    if (this.props.assemblyProjects) {
      try {
        const echoSheet = generateMasterMixEchoSheet(this.props.assemblyProjects.length, this.state.masterMixVolumes );
        console.log(echoSheet);
        const csv = papaparse.unparse(echoSheet);
        download('mastermix_script.csv', csv);
      } catch (err) {
        alert(err);
      }
    }
  }

  private onClickMainEchoScript = () => {
    if (this.props.assemblyProjects) {
      try {
        console.debug(this.props);
        const echoSheet = generateEchoSheet(this.props.assemblyProjects, this.state.partLocations);
        console.log(echoSheet);
        const csv = papaparse.unparse(echoSheet);
        download('main_script.csv', csv);
      } catch (err) {
        alert(err);
      }
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BatchAutoProtocolView));