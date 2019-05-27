import * as React from 'react'
import {Dropdown, Button, Table, Breadcrumb} from 'react-bootstrap';
import styled from 'styled-components';

import CONNECTORS from '../connectors.json'
import {IFeature, DNASeq} from '../gbGenerator';
import vectorReceiver from '../vectorReceiver.json';
import { withRouter, RouteComponentProps, Redirect } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IUserInfo, IProject} from '../types.js';
import { Dispatch } from 'redux';
import { CREATE_PROJECT } from '../redux/actions';
import queryString from 'query-string';

type Selected0 = 'Transient transfection'|'Stable transfection';
type Selected1 = 'Plasmid Based vectors'|'Episomal vectors'|'AAVs vectors'|'BacMam Baculovirus vectors'|'Targeting vector'|'Transposon based vector'|'Lentivirus'|'RCME'|'Episomal (+ selection)'|'Linear DNA – random integration';
type Selected2 =  1|2;
type Selected3 = 'Monocistronic'|'Bicistronic';
type Selected4 = 'Single protein'|'Fusion protein'|'p2A'|'IRES';
type Selected5 = 'Default: with promoter'|'Promoterless option (for gene-trap strategy)';
type Selected6 = Selected3;
type Selected7 = 'Single protein'|'Fusion protein'|'p2A'|'IRES';
type SelectTargetingVector1 = 'With independent selection marker transcription unit'|'Without independent selection marker transcription unit';
type SelectTargetingVector2 = 'Default: with promoter'|'Promoterless option (for gene-trap strategy)';
type SelectTransposonBasedVector = 'With independent selection marker cassette'|'Without independent selection marker cassette';
type StepType = 'EMMA expression vectors'|Selected0|Selected1|Selected2|Selected3|Selected4|Selected5|Selected7|SelectTargetingVector1|SelectTargetingVector2|SelectTransposonBasedVector|'Final';
interface IOption {
  title: StepType;
  nextStep:()=>string;
  action:()=>void;
}

interface IOptions {
  options: IOption[];
}

interface IProps extends RouteComponentProps {
  currentProject: IProject,
  preSetParts: (arr: number[], mapDef?: any)=>void,
}
interface IState {
  selected0?: Selected0,
  selected1?: Selected1,
  selected2?: Selected2,
  selected3?: Selected3,
  selected4?: Selected4,
  selected5?: Selected5,
  selected6?: Selected6,
  selected7?: Selected7,
  selectTargetingVector1?: SelectTargetingVector1,
  selectTargetingVector2?: SelectTargetingVector2,
  selectTransposonBasedVector?: SelectTransposonBasedVector,
  finish: boolean,
  step: number,
  currentStep: StepType,
  projectName: string,
}

const mapStateToProps = (state: IStoreState) => ({
  currentProject: state.app.currentProject,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  preSetParts: (presetIndexes: number[], mapDef:any = undefined) =>  dispatch({type:CREATE_PROJECT, data: {name: `Project ${new Date().toLocaleDateString()}`, presetIndexes, mapDef}}),
});

class ProjectWizard extends React.Component<IProps, IState> {
  
  private wizardMap = {
    'EMMA expression vectors': {
      options: [
        {title:'Transient transfection', nextStep:()=>'Transient transfection', action:()=>this.setState({selected0:'Transient transfection'})},
        {title:'Stable transfection', nextStep:()=>'Stable transfection', action:()=>this.setState({selected0:'Stable transfection'})},
      ]
    },
    'Transient transfection': {
      options: [
        {title:'Plasmid Based vectors', nextStep:()=>'selectTU', action:()=>this.setState({selected1:'Plasmid Based vectors'})},
        {title:'Episomal vectors', nextStep:()=>'selectTU', action:()=>this.setState({selected1:'Episomal vectors'})},
        {title:'AAVs vectors', nextStep:()=>'selectTU', action:()=>this.setState({selected1:'AAVs vectors'})},
        {title:'BacMam Baculovirus vectors', nextStep:()=>'selectTU', action:()=>this.setState({selected1:'BacMam Baculovirus vectors'})},
      ]
    },
    'Stable transfection': {
      options: [
        {title:'Targeting vector', nextStep:()=>'Targeting vector', action:()=>this.setState({selected1:'Targeting vector'})},
        {title:'Transposon based vector', nextStep:()=>'Transposon based vector', action:()=>this.setState({selected1:'Transposon based vector'})},
        {title:'Lentivirus', nextStep:()=>'TU-A', action:()=>this.setState({selected1:'Lentivirus', selected2:1})},
        {title:'RCME', nextStep:()=>'Targeting vector', action:()=>this.setState({selected1:'RCME'})},
        {title:'Episomal (+ selection)', nextStep:()=>'Targeting vector', action:()=>this.setState({selected1:'Episomal (+ selection)'})},
        {title:'Linear DNA – random integration', nextStep:()=>'Targeting vector', action:()=>this.setState({selected1:'Linear DNA – random integration'})},
      ]
    },
    'selectTU': {
      question: 'choose a category',
      options: [
        {title:'One Transcription unit (TU-A)', nextStep:()=>'TU-A', action:()=>this.setState({selected2:1})},
        {title:'Two Transcription unit (TU-A and TU-B)', nextStep:()=>'TU-A', action:()=>this.setState({selected2:2})},
      ]
    },
    'TU-A': {
      options: [
        {title:'Monocistronic', nextStep:()=>'Monocistronic', action:()=>this.setState({selected3:'Monocistronic'})},
        {title:'Bicistronic', nextStep:()=>'Bicistronic', action:()=>this.setState({selected3:'Bicistronic'})},
      ]
    },
    'TU-B': {
      options: [
        {title:'Monocistronic', nextStep:()=>'Monocistronic', action:()=>this.setState({selected6:'Monocistronic'})},
        {title:'Bicistronic', nextStep:()=>'Bicistronic', action:()=>this.setState({selected6:'Bicistronic'})},
      ]
    },
    'Monocistronic': {
      options: [
        {
          title:'Single protein',
          nextStep:()=>{
            if (this.state.selected2 ===1 || this.state.selected2===2 && this.state.selected6) {
              if(this.state.selectTargetingVector1 && this.state.selected1 !== 'Episomal (+ selection)' && this.state.selected1 !== 'Linear DNA – random integration') {
                return 'TargetingVectorPreFinal';
              }
              return 'Final';
            } else {
              return 'TU-B';
            }
          },
          action:()=>{
            if (this.state.selected6) {
              this.setState({selected7: 'Single protein'});
            } else {
              this.setState({selected4: 'Single protein'});
            }
          }
        },
        {
          title:'Fusion protein',
          nextStep:()=>{
            if (this.state.selected2 ===1 || this.state.selected2===2 && this.state.selected6) {
              if(this.state.selectTargetingVector1 && this.state.selected1 !== 'Episomal (+ selection)' && this.state.selected1 !== 'Linear DNA – random integration') {
                return 'TargetingVectorPreFinal';
              }
              return 'Final';
            } else {
              return 'TU-B';
            }
          },
          action:()=>{
            if (this.state.selected6) {
              this.setState({selected7: 'Fusion protein'});
            } else {
              this.setState({selected4: 'Fusion protein'});
            }
          }
        },
      ]
    },
    'Bicistronic': {
      options: [
        {
          title:'p2A',
          nextStep:()=>{
            if (this.state.selected2 ===1 || this.state.selected2===2 && this.state.selected6) {
              if(this.state.selectTargetingVector1 && this.state.selected1 !== 'Episomal (+ selection)' && this.state.selected1 !== 'Linear DNA – random integration') {
                return 'TargetingVectorPreFinal';
              }
              return 'Final';
            } else {
              return 'TU-B';
            }
          },
          action:()=>{
            if (this.state.selected6) {
              this.setState({selected7: 'p2A'});
            } else {
              this.setState({selected4: 'p2A'});
            }
          }
        },
        {
          title:'IRES',
          nextStep:()=>{
            if (this.state.selected2 ===1 || this.state.selected2===2 && this.state.selected6) {
              if(this.state.selectTargetingVector1 && this.state.selected1 !== 'Episomal (+ selection)' && this.state.selected1 !== 'Linear DNA – random integration') {
                return 'TargetingVectorPreFinal';
              }
              return 'Final';
            } else {
              return 'TU-B';
            }
          },
          action:()=>{
            if (this.state.selected6) {
              this.setState({selected7: 'IRES'});
            } else {
              this.setState({selected4: 'IRES'});
            }
          }
        },
      ]
    },
    'Targeting vector': {
      options: [
        {title:'With independent selection marker transcription unit', nextStep:()=>'selectTU', action:()=>this.setState({selectTargetingVector1:'With independent selection marker transcription unit'})},
        {title:'Without independent selection marker transcription unit', nextStep:()=>'selectTU', action:()=>this.setState({selectTargetingVector1:'Without independent selection marker transcription unit'})},
      ]
    },
    'TargetingVectorPreFinal': {
      options: [
        {title:'Default: with promoter', nextStep:()=>'Final', action:()=>this.setState({selectTargetingVector2:'Default: with promoter'})},
        {title:'Promoterless option (for gene-trap strategy)', nextStep:()=>'Final', action:()=>this.setState({selectTargetingVector2:'Promoterless option (for gene-trap strategy)'})},
      ]
    },
    'Transposon based vector': {
      options: [
        {title:'With independent selection marker cassette', nextStep:()=>'selectTU', action:()=>this.setState({selectTransposonBasedVector:'With independent selection marker cassette'})},
        {title:'Without independent selection marker cassette', nextStep:()=>'selectTU', action:()=>this.setState({selectTransposonBasedVector:'Without independent selection marker cassette'})},
      ]
    },
  }

  constructor (props:IProps) {
    super(props);
    const parsed = queryString.parse(props.location.search);
    console.log(parsed);
    this.state = {
      finish:false,
      step: 0,
      currentStep:'EMMA expression vectors',
      projectName: typeof parsed.name === 'string' ? parsed.name : 'new project',
    };
  }

  public shouldComponentUpdate(np:IProps, ns:IState) {
    if(np.currentProject._id && this.props.currentProject._id !== np.currentProject._id) {
      this.props.history.push(`/project/${np.currentProject._id}`);
    }
    return true; 
  }

  public render() {
    const {currentStep} = this.state;
    const currentSelect = (this.wizardMap as any)[currentStep] as IOptions;
    if (currentStep === 'Final') {
      return <div>{JSON.stringify(this.state)}</div>
    }
    return <div>
      <h1>Project Wizard ({this.state.projectName})</h1>
      <h2>{this.state.currentStep}</h2>
      {currentSelect.options.map((v,i)=><div key={i} onClick={this.onClickOption.bind(this, v)}>
        <li>{v.title}</li>
      </div>)}
    </div>
  }

  private onClickOption(option: IOption) {
    option.action();
    const nextStep = option.nextStep();
    this.setState({currentStep: nextStep as StepType}, ()=>{
      if (nextStep === 'Final') {
        console.log(this.state);
        this.generateProject();
      }
    });
  }

  private generateProject() {
    const { 
      selected1, 
      selected2,
      selected3,
      selected4,
      selected5,
      selected6,
      selected7,
      selectTargetingVector1,
      selectTargetingVector2,
      selectTransposonBasedVector
    } = this.state;

    let presetParts:number[] = [];
    let predefMaps:any;

    console.log(this.state);

    if ( selected1 === 'Plasmid Based vectors' || selected1 === 'Episomal vectors') {
      if (selected2 === 1) {
        if (selected4 === 'Single protein') {
          presetParts = [2,3,4,5,6,7,10,11];
            predefMaps = {7:[0], 8:[], 9:[], 10:[0]};
        } else if (selected4 === 'Fusion protein') {
          presetParts = [2,3,4,5,6,7,8,9,10,11];
            predefMaps = {7:[2], 8:[1],10:[0]};
        } else if (selected4 === 'p2A') {
          presetParts = [2,3,4,5,6,7,8,9,10,11];
            predefMaps = {7:[1], 8:[1],10:[0]};
        } else {
          presetParts = [2,3,4,5,6,7,8,9,10,11];
            predefMaps = {7:[0], 8:[0],10:[0]};
        }
      } else {
        if (selected4 === 'Single protein' && selected7 === 'Single protein') {
          presetParts = [1,2,3,4,5,6,7,10,11,12,18,19,20,22];
            predefMaps = {1:[0],7:[0], 8:[], 9:[], 10:[0], 20:[2], 21:[]};
        } else if (selected4 === 'Fusion protein' && selected7 === 'Fusion protein') {
          presetParts = [1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,21,22];
            predefMaps = {1:[0],7:[2], 8:[1], 10:[0], 20:[1]};
        } else if (selected4 === 'Single protein' && selected7 === 'Fusion protein') {
          presetParts = [1,2,3,4,5,6,7,10,11,12,18,19,20,21,22];
            predefMaps = {1:[0], 7:[0], 8:[], 9:[], 10:[0], 20:[1]};
        } else if (selected4 === 'Fusion protein' && selected7 === 'Single protein') {
          presetParts = [1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,22];
            predefMaps = {1:[0],7:[2], 8:[1], 10:[0], 20:[2], 21:[]};
        } else if (selected4 === 'p2A' && selected7 === 'Single protein') {
          presetParts = [1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,22];
            predefMaps = {1:[0],7:[1], 8:[1], 10:[0], 20:[2], 21:[]};
        } else if (selected4 === 'p2A' && selected7 === 'Fusion protein') {
          presetParts = [1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,21,22];
            predefMaps = {1:[0],7:[1], 8:[1], 10:[0], 20:[1]};
        } else if (selected4 === 'IRES' && selected7 === 'Single protein') {
          presetParts = [1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,22];
            predefMaps = {1:[0],7:[0], 8:[0], 10:[0], 20:[1]};
        } else if (selected4 === 'IRES' && selected7 === 'Fusion protein') {
          presetParts = [1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,21,22];
            predefMaps = {1:[0], 7:[0], 8:[0], 10:[0], 20:[2], 21:[]};
        } else if (selected4 === 'Fusion protein' && selected7 === 'p2A') {
          presetParts = [1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,21,22];
            predefMaps = {1:[0],7:[2], 8:[1], 10:[0], 20:[0]};
        } else if (selected4 === 'Fusion protein' && selected7 === 'IRES') {
          presetParts = [1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,21,22];
            predefMaps = {1:[0],7:[2], 8:[1], 10:[0], 20:[2]};
        } else {
          alert('no project tempate (yet)');
        }
      }

      if ( selected1 === 'Episomal vectors') {
        presetParts.push(25);
      }
    } 

    else {
      alert('no project tempate (yet)');
    }
    this.props.preSetParts(presetParts, predefMaps);
  }
  
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectWizard));