import * as React from 'react';
import * as d3 from 'd3';

import SVGUTR35 from '../icons/5-3-UTR.svg';
import SVGITR35 from '../icons/5-3-ITR.svg';
import SVGLTR35 from '../icons/5-3-LTR.svg';
import SVGInsulator from '../icons/insulator.svg';
import SVGIRES from '../icons/IRES.svg';
import SVGKozakATG from '../icons/Kozak-ATG.svg';
import SVGOrigin from '../icons/Origin of repliction.svg';
import SVGp2A from '../icons/p2A.svg';
import SVGPeptide from '../icons/Peptide linker.svg';
import SVGpromoter from '../icons/promoter.svg';
import SVGProteinTag from '../icons/Protein Tag.svg';
import SVGRecombinase from '../icons/recombinase-recognition-sequence.svg';
import SVGRNA from '../icons/RNA-stability-sequence.svg';
import SVGTerminator from '../icons/Terminator.svg';
import SVGCDS from '../icons/CDS.svg';
import Button from 'react-bootstrap/Button';
import {SHORTCUTS} from '../graphElements';
import { IProject } from '../types';
import { active } from 'd3';
import { saveProject } from '../backendCalls';

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

interface IProps {
  projectId: string;
  preloadedProject?: IProject;
  onNewPathGenerated?: (newPath: any) => void;
  onClickNext?: (newPath: any) => void;
}
interface IState {
  shortcuts: IShortcut[];
  graph: any;
  partsProp: IArrowData[];
  pathValid: boolean;
  projectName: string;
}

export default class PartSelector extends React.Component<IProps, IState> {
  private selectedColor = '#77cc77';
  private invalidColor = '#cc7777';
  private activatedColor = '#333333';
  private ignoredColor = '#f0f0f0';
  private partNames = [
    [SVGITR35, SVGLTR35, SVGRecombinase],
    [SVGInsulator, SVGRecombinase],
    [SVGpromoter],
    [SVGRNA],
    [SVGUTR35],
    [SVGKozakATG, SVGProteinTag],
    [SVGCDS],
    [SVGp2A, SVGPeptide, SVGProteinTag],
    [SVGIRES],
    [SVGCDS],
    [SVGUTR35, SVGLTR35],
    [SVGTerminator],
    [SVGInsulator],
    [SVGRecombinase],
    [SVGpromoter],
    [SVGCDS],
    [SVGTerminator],
    [SVGRecombinase],
    [SVGpromoter],
    [SVGCDS],
    [SVGp2A, SVGPeptide, SVGIRES, SVGProteinTag],
    [SVGCDS],
    [SVGTerminator],
    [SVGInsulator],
    [SVGITR35, SVGRecombinase],
    [SVGOrigin],
  ];

  private baseX = 100;
  private baseY = 400;
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
      projectName: new Date().toLocaleString(),
    };

    // load project
    this.loadProject();
  }
  public componentDidMount() {
    this.calcPath();
  }
  public componentDidUpdate() {
    // this.drawSVG();
  }
  public render() {
    return <div>
    <svg width='1500' height='1000'>
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

    <Button variant='primary' size='lg' onClick={this.onClickSave}>save</Button>

      {this.state.pathValid ?
      <div>
        <Button variant='primary' size='lg' onClick={this.onClickNext}>next</Button>
      </div>
      :
      <div style={{textAlign: 'left'}}>
      </div>
      }

    </div>;
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

  private onClickSave = () => {
    let project: IProject;
    if (this.props.preloadedProject) {
      project = this.props.preloadedProject;
      this.state.partsProp.forEach((part, i) => {
        project.parts[i].activated = part.activated;
        project.parts[i].selected = part.selected;
      });
    } else {
      project = {
        _uuid: this.props.projectId,
        name: this.state.projectName,
        parts: this.state.partsProp.map((part) => ({activated: part.activated, selected: part.selected})),
      };
    }
    // save
    saveProject(project);
  }

  private onClickNext = () => {

    if (this.props.onClickNext) {
      this.props.onClickNext({
        parts: this.state.partsProp.map((v, i) => v.activated ? {idx: i, svg: v.svg} : undefined).filter((v) => v !== undefined),
        shortcuts: this.state.shortcuts.map((v, i) => v.activated ? {name: v.name, idx: i} : undefined).filter((v) => v !== undefined),
        });
    }
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
              width='30' height='30' xlinkHref={part}
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
              width='30' height='30' xlinkHref={part}
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
            width='30' height='30' xlinkHref={part}
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
