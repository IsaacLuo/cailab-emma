import * as React from 'react';
// import Button from 'react-bootstrap/Button';
import {Button} from 'antd';
import {SHORTCUTS} from '../graphElements';
import { IProject, IStoreState, IConnector } from '../types';

import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';
import {
  GET_PROJECT,
  SAVE_PROJECT_HISTORY,
  SET_CURRENT_PROJECT,
  GET_ALL_CONNECTORS,
  DELAY_SHOW_TOOL_TIP,
  HIDE_TOOL_TIP,
} from '../redux/actions';

import IconLegend from './IconLegend';
import { Breadcrumb, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';

import PART_NAMES from '../partNames';
import ProjectHistory from './ProjectHistory';

const PART_ICON_COUNT = [3,2,1,1,1,2,1,3,3,1,2,1,1,1,1,1,1,1,1,1,4,1,1,1,2,1];

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
  // key:any;
  preloadedProject: IProject;
  resetCount: number;
  connectors: IConnector[];
  tooltipIcon: string|undefined;
  tooltipTitle: string|undefined;
  onNewPathGenerated?: (newPath: any) => void;
  onClickNext?: (newPath: any) => void;
  onLoadProject: (projectId: string) => void;
  saveProjectHistory: (project: IProject) => void;
  onNewValidProjectGenerated: (project: IProject) => void;
  dispatchGetAllConnectors:()=>void;
  dispatchShowToolTip:(partDescription:any)=>void;
  dispatchHideToolTip: ()=>void;
}
interface IState {
  shortcuts: IShortcut[];
  graph: any;
  partsProp: IArrowData[];
  pathValid: boolean;
  projectName: string;
  currentProjectId?: string;
  currentProjectUpdatedAt?: Date;
  isProjectDirty: boolean;
}
const mapStateToProps = (state: IStoreState) => ({
  preloadedProject: state.app.currentProject,
  // key: state.app.currentProject.updatedAt,
  resetCount: state.partSelector.resetCount,
  connectors: state.app.connectors,
  tooltipIcon: state.app.tooltipIcon,
  tooltipTitle: state.app.tooltipTitle,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_PROJECT, data: projectId}),
  saveProjectHistory: (project: IProject) => dispatch({type:SAVE_PROJECT_HISTORY, data: project}),
  onNewValidProjectGenerated: (project: IProject) => dispatch({type:SET_CURRENT_PROJECT, data: project}),
  dispatchGetAllConnectors: ()=>dispatch({type:GET_ALL_CONNECTORS}),
  dispatchShowToolTip: (partDescription:any) => dispatch ({type:DELAY_SHOW_TOOL_TIP, data:partDescription}),
  dispatchHideToolTip: () => dispatch ({type:HIDE_TOOL_TIP}),

});

class PartSelector extends React.Component<IProps, IState> {
  // public static getDerivedStateFromProps(props: IProps, state: IState): IState|null {
  //   if (props.preloadedProject && (state.currentProjectUpdatedAt !== props.preloadedProject.updatedAt)) {
  //     const project: IProject = props.preloadedProject;
  //     project.parts.forEach((part, idx) => {
  //       state.partsProp[idx].activated = part.activated;
  //       state.partsProp[idx].selected = part.selected;
  //       if (part.selected) {
  //         state.graph[idx][idx + 1] = 1;
  //       }
  //     });
  //     state.currentProjectId = props.preloadedProject._id;
  //     state.currentProjectUpdatedAt = props.preloadedProject.updatedAt;
  //     return state;
  //   }
  //   return null;
  // }

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
    this.props.dispatchGetAllConnectors();

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
      projectName: props.preloadedProject.name || `My Project at ${new Date().toLocaleString()}`,
      isProjectDirty: false,
    };

    // load project
    // this.loadProject();
    const projectId = (this.props.match.params as any).id;
    if (projectId && projectId !== 'new') {
      this.props.onLoadProject(projectId);
    }
  }


  public UNSAFE_componentWillReceiveProps(np: IProps) {
    if (np.preloadedProject && (this.props.resetCount !== np.resetCount || this.state.currentProjectUpdatedAt !== np.preloadedProject.updatedAt)) {
    
      const project: IProject = np.preloadedProject;
      const partsProp = this.state.partsProp;
      const graph = JSON.parse(JSON.stringify(this.oriGraph));

      // partsProp.forEach(part=> part.activated = part.selected = false);

      project.parts.forEach((part, idx) => {
        partsProp[idx].activated = part.activated;
        partsProp[idx].selected = part.selected;
    
        if (part.selected) {
          graph[idx][idx + 1] = 1;
        }
      });
      this.setState({
        currentProjectId: np.preloadedProject._id,
        currentProjectUpdatedAt: np.preloadedProject.updatedAt,
        partsProp,
        graph,
        projectName: np.preloadedProject.name,
      },()=>{
        this.calcPath();
      });

    }
  }

  public shouldComponentUpdate(np: IProps, ns: IState) {
    // if (np.preloadedProject._id !== this.props.preloadedProject._id) {
    //   this.calcPath();
    //   console.debug('calcPath');
    // }
    // if(this.props.preloadedProject !== np.preloadedProject) {
    //   // const project: IProject = np.preloadedProject;
    //   // project.parts.forEach((part, idx) => {
    //   //   ns.partsProp[idx].activated = part.activated;
    //   //   ns.partsProp[idx].selected = part.selected;
    //   //   if (part.selected) {
    //   //     ns.graph[idx][idx + 1] = 1;
    //   //   }
    //   // });
    //   // this.calcPath();
    //   this.setState({currentProjectId:undefined});
    //   return false;
    // }
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
        <Breadcrumb.Item href='/dashboard'>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>step 1: Design a template ({this.props.preloadedProject.name})</Breadcrumb.Item>
      </Breadcrumb>


      {/* <MyDocument>
        <h1>{this.props.preloadedProject.name}</h1>
      </MyDocument> */}

      <svg width='1500' height='700'>
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
          {this.genSpecialParts()}
        </g>
        {
          this.props.tooltipIcon && this.props.tooltipTitle &&
            <g transform={`translate(${this.baseX},${this.baseY + 180})`}>
              <rect x={0} y={0}
                width={500} height={30}
                fill="#efef00"
                strokeWidth={1}
                stroke="black"
              />
              <image x={5} width={30} height={30} xlinkHref={this.props.tooltipIcon}/>
              <text x={50} y={15} alignmentBaseline="central">{this.props.tooltipTitle}</text>
            </g>
        }
        <g transform={`translate(${this.baseX},${this.baseY + 240})`}>
          <circle cx={10} cy={0} r={10} fill="#bfbfbf" stroke="black" strokeWidth={1}/>
          <text x={25} y={0} alignmentBaseline="middle" >unselected</text>
          <circle cx={10} cy={30} r={10} fill="#ffffcc" stroke="black" strokeWidth={1}/>
          <text x={25} y={30} alignmentBaseline="middle">need to be selected</text>
          <circle cx={10} cy={60} r={10} fill="#ccffcc" stroke="black" strokeWidth={1}/>
          <text x={25} y={60} alignmentBaseline="middle">selected</text>
        </g>
        
        <g transform={`translate(${this.baseX},${this.baseY + 400})`}>
          {this.genSelectedParts()}
        </g>
        <g id='part-selector' />
      </svg>
      <MyDocument>
        {/* <div style={{maxWidth: 400}}>
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
      </div> */}
      {this.state.pathValid ?
      <div style={{marginBottom:50}}>
        <Link to={`/project/${(this.props.match.params as any).id}/step2`}>
          <Button type='primary' onClick={this.onClickNext}>next</Button>
        </Link>
        <Link to={`/project/${(this.props.match.params as any).id}/step2B`}>
          <Button type='primary' onClick={this.onClickNext}>next</Button>
        </Link>
      </div>
      :
      <div style={{textAlign: 'left'}}>
      </div>
      }
      <ProjectHistory/>
      {/* <Row>
        <Col>
          <IconLegend/>
        </Col>
        <Col>
          <ProjectHistory/>
        </Col>
      </Row> */}
      </MyDocument>
    </div>;
  }

  public componentWillUnmount() {
    // save history
    console.log('component umount, saving history');
    // this.saveProjectHistory();
  }

  // private onChangeFileName = (event: React.FormEvent<FormControlProps>) => {
  //   const projectName = (event.target as FormControlProps).value!;
  //   this.setState({projectName});
  // }

  // private loadProject() {
  //   if (this.props.preloadedProject) {
  //     const project: IProject = this.props.preloadedProject;
  //     project.parts.forEach((part, idx) => {
  //       this.state.partsProp[idx].activated = part.activated;
  //       this.state.partsProp[idx].selected = part.selected;
  //     });
  //   }
  // }

  private saveProjectHistory = () => {
    console.debug('save history')
    const {connectors} = this.props;

    // save history only when project is dirty
    if(this.state.isProjectDirty) {
      const usingConnectors:IConnector[] = [];
      this.state.shortcuts.forEach((v,i)=>{
        if (v.activated) {
          usingConnectors.push(connectors[i]);
        }
      })
      console.log(this.state.partsProp);
      const project: IProject = {
          _id: this.state.currentProjectId,
          name: this.state.projectName,
          parts: this.state.partsProp
            .map((part, position) => ({activated: part.activated, selected: part.selected, position}))
            .filter((part)=>part.selected),
          partsMultiIds:[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],],
          isMultiProject: false,
          permission: 0x600,
          connectors:usingConnectors,
          updatedAt: new Date(),
        };
      // save
      console.log('saving project', project);
      this.setState({isProjectDirty:false});
      this.props.saveProjectHistory(project); 
    }
  }

  private onNewValidProjectGenerated = () => {
    // this.saveProjectHistory();
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
      return <g><text x='0' y='-10'>
            {`please select more parts`}
          </text></g>
    //   return  <g>
    //     <text x='0' y='-10'>
    //       {`${requiredParts.length > 1 ? 'these parts' : 'this part'} must be selected `}
    //     </text>
    //     {requiredParts.map((partGroup, i) =>
    //     <g
    //       key={i}
    //     >
    //       {
    //         partGroup.map((part, j) =>
    //         <image
    //           key={`${i}.${j}`}
    //           x={w * i + 10}
    //           y={j * 50 + 10}
    //           width='30' height='30' xlinkHref={part.icon}
    //         />)
    //       }
    //       <rect
    //         x={w * i}
    //         y={0}
    //         width={w}
    //         height={w * partGroup.length}
    //         fill='#ffff0033'
    //         stroke='black'
    //         strokeWidth='1'
    //       />
    //     </g>,
    //     )
    //   }
    //   </g>;
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
      {renderingParts.map((partGroup, i) => {
        const singlePartGroup = partGroup.filter((part,j)=>part.len!==2)
        // const pos8 = partGroup.findIndex((part,j)=>part.len===2);
        return <g
          key={i}
        >
          {
            singlePartGroup.map((part, j) =>
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
            height={w * singlePartGroup.length}
            fill='#00ff0033'
            stroke='black'
            strokeWidth='1'
          />
          {
            partsProp[7].selected && partsProp[8].selected &&
            <g>
              {
                partGroup.filter((part,j)=>part.len===2).map((part, j) =>
                <image
                  key={`${j}`}
                  x={w * i + 35}
                  y={j * 50 + 60}
                  width='30' height='30' xlinkHref={part.icon}
                />)
              }
              {partGroup.filter((part,j)=>part.len===2).length > 0 &&
              <rect
                x={w * i}
                y={50}
                width={w * 2}
                height={w * 2}
                fill='#00ff0033'
                stroke='black'
                strokeWidth='1'
              />
              }
            </g>
          } 
        </g>
        })
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
        <rect
          x={w * i}
          y={0}
          width={w}
          height={w * partGroup.filter((part,j)=>part.len!==2).length}
          fill={partsProp[i].activated ? (partsProp[i].selected ? '#00ff0033' : '#ffff0033') : '#77777777'}
          stroke='black'
          strokeWidth='1'
          style={{cursor: 'pointer'}}
          className='clickable'
          onClick={this.clickPart.bind(this, i)}
        />

        {
          partGroup.filter((part,j)=>part.len!==2).map((part, j) =>
          <image
            key={`${i}.${j}`}
            x={w * i + 10}
            y={j * 50 + 10}
            width='30' height='30' xlinkHref={part.icon}
            onClick={this.clickPart.bind(this, i)}
            style={{cursor:'pointer'}}
            onMouseEnter={()=>this.props.dispatchShowToolTip(PART_NAMES[i][j])}
            onMouseLeave={()=>this.props.dispatchHideToolTip()}
          />)
        }
        
        { partsProp[i].activated &&
          <path
            d = {`M ${w * i} -2 L ${w * i + w} -2`}
            stroke='black'
            strokeWidth='3'
          />
        }

        {/* {
          partsProp[i].activated && !partsProp[i].selected &&
          <g>
            <path
              d = {`M ${w * i + 10} ${PART_ICON_COUNT[i]*w + 25} L ${w * i + w/2} ${PART_ICON_COUNT[i]*w + 10} L ${w * i + w - 10} ${PART_ICON_COUNT[i]*w + 25} M ${w * i + w/2} ${PART_ICON_COUNT[i]*w +10 } L ${w * i + w/2} ${PART_ICON_COUNT[i]*w + 35}`}
              stroke='red'
              strokeWidth='2'
              fill='none'
            />
            <text x={w * i + w/2} y={PART_ICON_COUNT[i]*w + 40} textAnchor="middle" alignmentBaseline="hanging">
              select
            </text>
          </g>
        } */}
      </g>,
      );
  }

  private genSpecialParts() {
    const parts = this.partNames[7].filter(part=>part.len===2);
    const {partsProp} = this.state;
    
    return <g>
      
      <rect
          x={50 * 7}
          y={50}
          width={100}
          height={50 * parts.length}
          fill={partsProp[7].activated && partsProp[8].activated? (partsProp[7].selected && partsProp[8].selected ? '#00ff0033' : '#ffff0033') : '#77777777'}
          stroke='black'
          strokeWidth='1'
          style={{cursor: 'pointer'}}
          className='clickable'
          onClick={this.clickPart.bind(this, 7)}
        />
      {parts.map((part, j)=><image
            key={`${j}`}
            x={50 * 7.5 + 10}
            y={j * 50 + 60}
            width='30' height='30' xlinkHref={part.icon}
            style={{cursor:'pointer'}}
            onMouseEnter={()=>this.props.dispatchShowToolTip(PART_NAMES[7][j+1])}
            onMouseLeave={()=>this.props.dispatchHideToolTip()}
          />)}
    </g>
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
      const p = nodeArray[nodeIdx];
      graph[p].forEach( (v, i) => {
        if (graph[p][i] > 0) {
          // console.log(`${p} vs ${i}`)
          const l = graph[p][i] + pathChain[p].d;
          // console.log(`${l} vs ${pathChain[i].d}`)
          if (l < pathChain[i].d) {
            pathChain[i].d = l;
            pathChain[i].prev = p;
            // const loc = nodeArray.indexOf(i);
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
    console.debug('calcPath');
    const {stdWeight} = this;
    const {partsProp, shortcuts, graph} = this.state;
    const nodeChain = this.dj(graph);
    shortcuts.forEach((v: any) => v.activated = false);
    partsProp.forEach((v: any) => v.activated = v.selected = false);

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
        partsProp[from].activated = false;
        partsProp[from].selected = false;
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
    this.setState({isProjectDirty: true}, ()=>{
      this.calcPath();
    });
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PartSelector));
