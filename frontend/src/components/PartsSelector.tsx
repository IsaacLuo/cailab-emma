import * as React from 'react';
import * as d3 from 'd3';


import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl, { FormControlProps } from 'react-bootstrap/FormControl';
import {SHORTCUTS} from '../graphElements';
import { IProject, IStoreState } from '../types';
import { saveProjectAs } from '../backendCalls';

import { RouteComponentProps, withRouter, Redirect, Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';
import {
  SHOW_LOGIN_WINDOW,
  LOGOUT,
  GET_CURENT_USER,
  GET_PROJECT,
  SAVE_PROJECT_HISTORY,
  SET_CURRENT_PROJECT,
} from '../redux/actions';

import IconLegend from './IconLegend';
import { Breadcrumb } from 'react-bootstrap';
import styled from 'styled-components';

import PART_NAMES from '../partNames';

const MyDocument = styled.div`
  margin-left:50px;
  margin-right:50px;
`;

interface IArrowData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  xm: number;
  ym: number;
  activated: boolean;
  selected: boolean;
  from: number;
  to: number;
  svg: any;
}

interface IShortcut {
  from: number;
  to: number;
  distance: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  xm: number;
  ym: number;
  xa: number;
  ya: number;
  rg: number;
  activated: boolean;
  name: any;
}

interface IPathChainNode {
    d: number;
    prev?: number;
  }

interface IProps extends RouteComponentProps {
  preloadedProject: IProject;
  onNewPathGenerated?: (newPath: any) => void;
  onClickNext?: (newPath: any) => void;
  onLoadProject: (projectId: string) => void;
  saveProjectHistory: (project: IProject) => void;
  onNewValidProjectGenerated: (project: IProject) => void;
}
interface IState {
  shortcuts: IShortcut[];
  graph: any;
  partsProp: IArrowData[];
  pathValid: boolean;
  projectName: string;
  currentProjectId?: string;
}
const mapStateToProps = (state: IStoreState) => ({
  preloadedProject: state.app.currentProject,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_PROJECT, data: projectId}),
  saveProjectHistory: (project: IProject) => dispatch({type:SAVE_PROJECT_HISTORY, data: project}),
  onNewValidProjectGenerated: (project: IProject) => dispatch({type:SET_CURRENT_PROJECT, data: project}),
});

class PartSelector extends React.Component<IProps, IState> {
  public static getDerivedStateFromProps(props: IProps, state: IState): IState|null {
    if (props.preloadedProject && state.currentProjectId !== props.preloadedProject._id) {
      const project: IProject = props.preloadedProject;
      project.parts.forEach((part, idx) => {
        state.partsProp[idx].activated = part.activated;
        state.partsProp[idx].selected = part.selected;
        if (part.selected) {
          state.graph[idx][idx + 1] = 1;
        }
      });
      state.currentProjectId = props.preloadedProject._id;
      return state;
    }
    return null;
  }

  private selectedColor = '#77cc77';
  private invalidColor = '#cc7777';
  private activatedColor = '#333333';
  private ignoredColor = '#f0f0f0';
  private partNames = PART_NAMES;

  private baseX = 50;
  private baseY = 120;
  private jointPoints = 'ABCDEFGHhIJKLMNOPQRSTUVWXYZ'.split('').map((v) => v === 'h' ? 'Ha' : v);
  private stdWeight = 0x8000000; // 2^27 because the maximum safe int in JS is 2^53
  private oriGraph: any;

  constructor(props: IProps) {
    super(props);

    const {jointPoints, baseX, baseY} = this;
    const w = 50;
    const jointLocations = jointPoints.map((v, i) => {
      const y = baseY;
      const x = baseX + i * w;
      return {
        letter: v,
        x,
        y,
      };
    });

    const partsProp: IArrowData[] = this.partNames.map((v, i) => {
      // if (i===0) return {x1:0, y1:0, x2:0, y2:0, xm:0, ym:0, activated:false, selected:false, from: 0, to:0};
      // else {

        const x1 = baseX + i * w;
        const y1 = baseY;
        const x2 = baseX + i * w + w;
        const y2 = baseY;

        // const xm = (x1+x2)/2;
        // const ym = (y1+y2)/2;

        const ym = baseY;
        const xm = baseX + (i - 0.51) * w;

        return {
          x1,
          y1,
          x2,
          y2,
          xm,
          ym,
          activated: false,
          selected: false,
          from: i,
          to: i + 1,
          svg: v,
        };
      // }
    });

    if (props.preloadedProject) {
      const project: IProject = props.preloadedProject;
      project.parts.forEach((part, idx) => {
        partsProp[idx].activated = part.activated;
        partsProp[idx].selected = part.selected;
      });
    }

    const shortcuts: IShortcut[] = SHORTCUTS.map((v, i) => {
      const from = jointPoints.indexOf(v[0]);
      const to = jointPoints.indexOf(v[1]);

      const rd = (to - from) * w / 3;
      const xm = baseX + ((from + to) / 2) * w;
      const ym = baseY - (rd);

      const x1b = jointLocations[from].x;
      const y1b = jointLocations[from].y;
      const x2b = jointLocations[to].x;
      const y2b = jointLocations[to].y;

      const x1 = x1b;
      const y1 = y1b;
      const x2 = x2b;
      const y2 = y2b;
      const xa = x2b;
      const ya = y2b;

      let rg;
      if (Math.abs(x2 - xa) < 0.0001) {
        rg = x2 > xa ? 90 : -90;
      } else {
        rg = Math.atan((y2 - ya) / (x2 - xa)) * 180 / Math.PI;
        if (x2 < xa) { rg += 180; }
      }

      return {from, to, distance: to - from, x1, y1, x2, y2, xm, ym, xa, ya, rg, activated: false, name: v};
    });

    const stdWeight = this.stdWeight;

    // graph
    const graph: any[][] = jointPoints.map((v, i) => jointPoints.map((w, j) => (
      (j === i + 1 ? stdWeight : undefined)
      )));
    shortcuts.forEach((shortcut) => {
      const d = shortcut.distance;
      const w = stdWeight;
      graph[shortcut.from][shortcut.to] = d * w - d * d;
    });
    this.oriGraph = JSON.parse(JSON.stringify(graph));

    this.state = {
      shortcuts,
      partsProp,
      graph,
      pathValid: false,
      projectName: `My Project at ${new Date().toLocaleString()}`,
    };

    // load project
    // this.loadProject();
    const projectId = (this.props.match.params as any).id;
    if (projectId && projectId !== 'new') {
      this.props.onLoadProject(projectId);
    }
  }

  public shouldComponentUpdate(np: IProps, ns: IState) {
    if (np.preloadedProject._id !== this.props.preloadedProject._id) {
      this.calcPath();
      console.debug('calcPath');
    }
    return true;
  }

  public componentDidMount() {
    this.calcPath();
  }
  public componentDidUpdate() {
    // this.drawSVG();
  }
  public render() {
    return <div>
      <Breadcrumb>
        <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Design a template ({this.props.preloadedProject.name})</Breadcrumb.Item>
      </Breadcrumb>


      <MyDocument>
        <h1>{this.props.preloadedProject.name}</h1>
      </MyDocument>

      <svg width='1500' height='650'>
        <defs>
          <marker
            id='selected-arrow'
            markerWidth='10'
            markerHeight='9'
            refX='9'
            refY='2'
            orient='auto'
            markerUnits='strokeWidth'
          >
            <path
              d='M0,0 L0,4 L6,2 z'
              fill={this.selectedColor}
            />
          </marker>
          <marker
            id='invalid-arrow'
            markerWidth='10'
            markerHeight='9'
            refX='9'
            refY='2'
            orient='auto'
            markerUnits='strokeWidth'
          >
            <path
              d='M0,0 L0,4 L6,2 z'
              fill={this.invalidColor}
            />
          </marker>
          <marker
            id='ignored-arrow'
            markerWidth='10'
            markerHeight='9'
            refX='9'
            refY='2'
            orient='auto'
            markerUnits='strokeWidth'
          >
            <path
              d='M0,0 L0,4 L6,2 z'
              fill={this.ignoredColor}
            />
          </marker>
        </defs>
        <g>
          {this.genShortcuts()}
        </g>
        <g transform={`translate(${this.baseX},${this.baseY})`}>
          {this.genParts()}
        </g>
        <g transform={`translate(${this.baseX},${this.baseY + 300})`}>
          {this.genSelectedParts()}
        </g>
        <g id='part-selector' />
      </svg>
      <MyDocument>
        <IconLegend/>
        <div style={{maxWidth: 400}}>
          <InputGroup className='mb-3'>
            <FormControl
              placeholder='filename'
              aria-label='filename'
              aria-describedby='filename'
              value={this.state.projectName}
              onChange={this.onChangeFileName}
            />
            <InputGroup.Append>
              <Button variant='outline-secondary' onClick={this.onClickSaveAs}>Save as</Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
        {this.state.pathValid ?
        <div>
          <Link to={`/project/${(this.props.match.params as any).id}/step2`}>
            <Button variant='primary' size='lg' onClick={this.onClickNext}>next</Button>
          </Link>
        </div>
        :
        <div style={{textAlign: 'left'}}>
        </div>
        }
      </MyDocument>
    </div>;
  }

  public componentWillUnmount() {
    // save history
    console.log('component umount, saving history');
    this.saveProjectHistory();
  }

  private onChangeFileName = (event: React.FormEvent<FormControlProps>) => {
    const projectName = (event.target as FormControlProps).value!;
    this.setState({projectName});
  }

  private loadProject() {
    if (this.props.preloadedProject) {
      const project: IProject = this.props.preloadedProject;
      project.parts.forEach((part, idx) => {
        this.state.partsProp[idx].activated = part.activated;
        this.state.partsProp[idx].selected = part.selected;
      });
    }
  }

  private saveProjectHistory = () => {
    const project: IProject = {
        name: this.state.projectName,
        parts: this.state.partsProp.map((part) => ({activated: part.activated, selected: part.selected})),
      };
    // save
    this.props.saveProjectHistory(project);
  }

  private onNewValidProjectGenerated = () => {
    const project: IProject = {
        name: this.state.projectName,
        parts: this.state.partsProp.map((part) => ({activated: part.activated, selected: part.selected})),
      };
      this.props.onNewValidProjectGenerated(project);
  }

  private onClickSaveAs = () => {
    const project: IProject = {
        name: this.state.projectName,
        parts: this.state.partsProp.map((part) => ({activated: part.activated, selected: part.selected})),
      };
    // save
    saveProjectAs(project);
  }

  private onClickNext = () => {
    this.saveProjectHistory();
  }

  private genSelectedParts() {
    const {partsProp} = this.state;
    const w = 50;
    // let x = this.baseX-w;
    if (partsProp.find((v) => v.activated && !v.selected)) {
      const requiredParts = this.partNames.filter((v, i) => partsProp[i].activated && !partsProp[i].selected);
      return  <g>
        <text x='0' y='-10'>
          {`${requiredParts.length > 1 ? 'these parts' : 'this part'} must be selected `}
        </text>
        {requiredParts.map((partGroup, i) =>
        <g
          key={i}
        >
          {
            partGroup.map((part, j) =>
            <image
              key={`${i}.${j}`}
              x={w * i + 10}
              y={j * 50 + 10}
              width='30' height='30' xlinkHref={part.icon}
            />)
          }
          <rect
            x={w * i}
            y={0}
            width={w}
            height={w * partGroup.length}
            fill='#ffff0033'
            stroke='black'
            strokeWidth='1'
          />
        </g>,
        )
      }
      </g>;
    }
    const renderingParts = this.partNames.filter((v, i) => partsProp[i].activated && partsProp[i].selected);
    if (this.props.onNewPathGenerated) {
      this.props.onNewPathGenerated({
        parts: this.state.partsProp,
        shortcuts: this.state.shortcuts,
        });
    }
    return <g>
      {renderingParts.length > 0
      ?
      <text x='0' y='-10'>your assembly:</text>
      :
      <text x='0' y='-10'>choose some parts to build a path</text>
      }
      {renderingParts.map((partGroup, i) =>
        <g
          key={i}
        >
          {
            partGroup.map((part, j) =>
            <image
              key={`${i}.${j}`}
              x={w * i + 10}
              y={j * 50 + 10}
              width='30' height='30' xlinkHref={part.icon}
            />)
          }
          <rect
            x={w * i}
            y={0}
            width={w}
            height={w * partGroup.length}
            fill='#00ff0033'
            stroke='black'
            strokeWidth='1'
          />
        </g>,
        )
      }
    </g>;
  }

  private genParts() {
    const {partsProp} = this.state;
    const w = 50;
    // let x = this.baseX-w;
    return this.partNames.map((partGroup, i) =>
      <g
        key={i}
      >
        {
          partGroup.map((part, j) =>
          <image
            key={`${i}.${j}`}
            x={w * i + 10}
            y={j * 50 + 10}
            width='30' height='30' xlinkHref={part.icon}
          />)
        }
        <rect
          x={w * i}
          y={0}
          width={w}
          height={w * partGroup.length}
          fill={partsProp[i].activated ? (partsProp[i].selected ? '#00ff0033' : '#ffff0033') : '#77777777'}
          stroke='black'
          strokeWidth='1'
          style={{cursor: 'pointer'}}
          className='clickable'
          onClick={this.clickPart.bind(this, i)}
        />
        { partsProp[i].activated &&
          <path
            d = {`M ${w * i} -2 L ${w * i + w} -2`}
            stroke='black'
            strokeWidth='3'
          />
        }
      </g>,
      );
  }

  private genShortcuts() {
    const {shortcuts} = this.state;
    return [...shortcuts].sort((a, b) => (a.activated ? 1 : 0) - (b.activated ? 1 : 0)).map((d, i) => <g key={i}>
        <path
          d={`M ${d.x1} ${d.y1 - 2} Q ${d.xm} ${d.ym} ${d.xa} ${d.ya}`}
          stroke={d.activated ? this.activatedColor : this.ignoredColor}
          strokeWidth='3'
          fill='none'
          className={`shortcut-${d.from}-${d.to}`}

        />
        {/* <path
          d={`M ${d.x2} ${d.y2} L ${d.x2-18} ${d.y2+6} L ${d.x2-18} ${d.y2-6} Z`}
          fill={d.activated? this.activatedColor : this.ignoredColor}
          transform={`rotate(45, ${d.x2}, ${d.y2})`}
          className={`shortcut-${d.from}-${d.to}`}
        /> */}
      </g>);
  }

  private dj(graph: any[][]) {
    const {jointPoints} = this;
    const pathChain: IPathChainNode[] = jointPoints.map((v) => ({d: Math.floor(Number.MAX_SAFE_INTEGER / jointPoints.length), prev: undefined}));
    pathChain[0].d = 0;
    let p = 0;
    const nodeArray = [p];
    let nodeIdx = 0;
    while (nodeIdx < nodeArray.length) {
      p = nodeArray[nodeIdx];
      graph[p].forEach( (v, i) => {
        if (graph[p][i] > 0) {
          // console.log(`${p} vs ${i}`)
          const l = graph[p][i] + pathChain[p].d;
          // console.log(`${l} vs ${pathChain[i].d}`)
          if (l < pathChain[i].d) {
            pathChain[i].d = l;
            pathChain[i].prev = p;
            const loc = nodeArray.indexOf(i);
            // if(loc === -1) {
            nodeArray.push(i);
            // } else {
              // nodeArray[loc] = i;
            // }
            // console.log(`push ${i}, nodeArray=${nodeArray}`)
          }
        }
      });
      nodeIdx++;
      // console.log(`${p} << ${nodeArray}`)
    }
    // console.log(pathChain)
    // put last node
    nodeIdx = pathChain.length - 1;
    const re = [];
    while (nodeIdx !== undefined) {
      re.unshift(nodeIdx);
      nodeIdx = pathChain[nodeIdx].prev!;
    }
    // console.log(pathChain);
    return re;
  }

  private calcPath() {
    const {stdWeight} = this;
    const {partsProp, shortcuts, graph} = this.state;
    const nodeChain = this.dj(graph);
    shortcuts.forEach((v: any) => v.activated = false);
    partsProp.forEach((v: any) => v.activated = false);

    let pathValid = true;
    let partCount = 0;

    for (let i = 1; i < nodeChain.length ; i++) {
      const from = nodeChain[i - 1];
      const to = nodeChain[i];
      if (graph[from][to] === stdWeight) {
        partsProp[from].activated = true;
        partsProp[from].selected = false;
        pathValid = false;
      } else if (graph[from][to] === 1) {
        partsProp[from].activated = true;
        partsProp[from].selected = true;
        partCount++;
      } else {
        shortcuts.filter((v: any) => v.from === from && v.to === to).forEach((v: any) => v.activated = true);
      }
    }
    if (partCount === 0) {
      pathValid = false;
    } 

    if (pathValid) {
      this.onNewValidProjectGenerated();
    }
    this.setState({pathValid});
    this.forceUpdate();
  }

  private clickPart = (index: number) => {
    const {graph, partsProp} = this.state;
    const d = partsProp[index];
    if (graph[d.from][d.to] === 1) {
      graph[d.from][d.to] = this.oriGraph[d.from][d.to];
    } else {
      graph[d.from][d.to] = 1;
    }
    this.calcPath();
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PartSelector));
