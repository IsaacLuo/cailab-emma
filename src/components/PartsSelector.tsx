import * as React from 'react'
import * as d3 from 'd3'

import SVGUTR35 from '../icons/5-3-UTR.svg'
import SVGITR35 from '../icons/5-3-ITR.svg'
import SVGLTR35 from '../icons/5-3-LTR.svg'
import SVGInsulator from '../icons/insulator.svg'
import SVGIRES from '../icons/IRES.svg'
import SVGKozakATG from '../icons/Kozak-ATG.svg'
import SVGOrigin from '../icons/Origin of repliction.svg'
import SVGp2A from '../icons/p2A.svg'
import SVGPeptide from '../icons/Peptide linker.svg'
import SVGpromoter from '../icons/promoter.svg'
import SVGProteinTag from '../icons/Protein Tag.svg'
import SVGRecombinase from '../icons/recombinase-recognition-sequence.svg'
import SVGRNA from '../icons/RNA-stability-sequence.svg'
import SVGTerminator from '../icons/Terminator.svg'
import SVGCDS from '../icons/CDS.svg'


interface IArrowData {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  xm: number,
  ym: number,
  activated: boolean,
  selected: boolean,
  from: number,
  to: number,
}

interface IShortcut {
  from: number, 
  to: number,
  distance: number
  x1: number,
  y1: number,
  x2: number,
  y2: number, 
  xm: number,
  ym: number,
  xa: number,
  ya: number,
  rg: number,
  activated:boolean,
}

  interface IPathChainNode {
    d: number,
    prev?: number,
  }

interface IProps {
  onNewPathGenerated?: ()=>void
}
interface IState {
  shortcuts: IShortcut[],
  graph: any;
  partsProp: IArrowData[],
}

export default class PartSelector extends React.Component<IProps, IState> {
  private selectedColor = '#77cc77';
  private invalidColor = '#cc7777';
  private activatedColor = '#333333';
  private ignoredColor = '#dddddd';
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
  // ['5`/3` Homology arm', '5`/3` LTR', 'RRS'],
  // ['Insulator', 'RRS'],
  // ['Promoter'],
  // ['RNA stability sequence'],
  // ['5`/3` UTR'],
  // ['Kozak-ATG', 'Protein Tag'],
  // ['CDS'],
  // ['p2A', 'Peptide Linker', 'Protein Tag'],
  // ['IRES'],
  // ['CDS'],
  // ['5`/3` UTR', '5`/3` LTR'],
  // ['Terminator'],
  // ['Insulator'],
  // ['RRS'],
  // ['Promoter'],
  // ['CDS'],
  // ['Terminator'],
  // ['RRS'],
  // ['Promoter'],
  // ['CDS'],
  // ['p2A','Peptide Linker', 'IRES', 'Protein Tag'],
  // ['CDS'],
  // ['Terminator'],
  // ['Insulator'],
  // ['5`/3` Homology arm', 'RRS'],
  // ['Origin of replication'],
  // ];

  private baseX = 100;
  private baseY = 400;
  private jointPoints = 'ABCDEFGHhIJKLMNOPQRSTUVWXYZ'.split('').map(v=>v==='h'?'Ha':v)
  private stdWeight = 0x8000000; // 2^27 because the maximum safe int in JS is 2^53
  private oriGraph:any;

  constructor (props:IProps) {
    super(props);

    const {jointPoints, baseX, baseY} = this;
    const w = 50;
    let jointLocations = jointPoints.map((v,i)=>{
      const y = baseY
      const x = baseX + i * w
      return {
        letter: v,
        x,
        y,
      }
    })

    let partsProp:IArrowData[] = jointLocations.map((v,i) => {
      if (i===0) return {x1:0, y1:0, x2:0, y2:0, xm:0, ym:0, activated:false, selected:false, from: 0, to:0};
      else {

        const x1 = jointLocations[i-1].x;
        const y1 = jointLocations[i-1].y;
        const x2 = v.x;
        const y2 = v.y;

        // const xm = (x1+x2)/2;
        // const ym = (y1+y2)/2;

        const ym = baseY;
        const xm = baseX + (i-0.51)*w;

        return {
          x1,
          y1,
          x2,
          y2,
          xm,
          ym,
          activated: false,
          selected: false,
          from: i-1,
          to: i,
        }
      }
    }).filter((v,i) => i>0 )

    let shortcuts: IShortcut[] = [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'C'],
      ['B', 'E'],
      ['B', 'L'],
      ['D', 'E'],
      ['D', 'F'],
      ['E', 'F'],
      ['H', 'Ha'],
      ['H', 'J'],
      ['H', 'K'],
      ['Ha', 'J'],
      ['Ha', 'K'],
      ['J', 'K'],
      ['L', 'M'],
      ['L', 'N'],
      ['L', 'R'],
      ['L', 'W'],
      ['L', 'Y'],
      ['M', 'R'],
      ['N', 'R'],
      ['Q', 'R'],
      ['M', 'W'],
      ['R', 'W'],
      ['T', 'V'],
      ['U', 'V'],
      ['W', 'X'],
      ['W', 'Y'],
      ['W', 'Z'],
      ['Y', 'Z'],
    ].map((v,i) => {
      const from = jointPoints.indexOf(v[0]);
      const to = jointPoints.indexOf(v[1]);

      const rd = (to-from)*w;
      const xm = baseX + ((from+to)/2) * w
      const ym = baseY - (rd)

      const x1b = jointLocations[from].x;
      const y1b = jointLocations[from].y;
      const x2b = jointLocations[to].x;
      const y2b = jointLocations[to].y;

      const x1 = x1b
      const y1 = y1b
      const x2 = x2b
      const y2 = y2b
      const xa = x2b
      const ya = y2b
      
      let rg
      if(Math.abs(x2-xa) < 0.0001) {
        rg = x2>xa ? 90 : -90
      } else {
        rg = Math.atan((y2-ya) / (x2 - xa))*180/Math.PI;
        if(x2<xa) rg += 180;
      }

      return {from, to, distance: to-from, x1,y1,x2,y2, xm, ym, xa, ya, rg, activated:false}
    });

    const stdWeight = this.stdWeight;
    
    // graph
    const graph:any[][] = jointPoints.map((v,i) => jointPoints.map((w,j) => (
      (j === i + 1 ? stdWeight : undefined)
      )));
    shortcuts.forEach(shortcut => {
      const d = shortcut.distance;
      const w = stdWeight;
      graph[shortcut.from][shortcut.to] = d*w - d*d; 
    })
    this.oriGraph = JSON.parse(JSON.stringify(graph));

    this.state = {
      shortcuts,
      partsProp,
      graph,
    }
  }
  public componentDidMount() {
    this.calcPath();
  }
  public componentDidUpdate() {
    // this.drawSVG();
  }
  public render() {
    return <svg width="3000" height="1000">
      <defs>
        <marker
          id="selected-arrow"
          markerWidth="10"
          markerHeight="9"
          refX="9"
          refY="2"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,4 L6,2 z"
            fill={this.selectedColor}
          />
        </marker>
        <marker
          id="invalid-arrow"
          markerWidth="10"
          markerHeight="9"
          refX="9"
          refY="2"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,4 L6,2 z"
            fill={this.invalidColor}
          />
        </marker>
        <marker
          id="ignored-arrow"
          markerWidth="10"
          markerHeight="9"
          refX="9"
          refY="2"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,4 L6,2 z"
            fill={this.ignoredColor}
          />
        </marker>
      </defs>
      <g transform={`translate(${this.baseX},${this.baseY})`}>
        {this.genParts()}
      </g>
      <g>
        {this.genShortcuts()}
      </g>
      <g transform={`translate(${this.baseX},${this.baseY+300})`}>
        {this.genSelectedParts()}
      </g>
      <g id="part-selector" />
    </svg>
  }

  private genSelectedParts() {
    const {partsProp} = this.state;
    const w = 50;
    // let x = this.baseX-w;
    if (partsProp.find(v=>v.activated && !v.selected)) {
      return  <g>
        <text x="0" y="0">need to choose more parts</text>
      </g>
    }
    return this.partNames.filter((v,i)=>partsProp[i].activated && partsProp[i].selected).map((partGroup,i) =>
      <g
        key={i}
      >
        {
          partGroup.map((part, j) => 
          <image
            x={w*i+10}
            y={j*50+10}
            width="30" height="30" xlinkHref={part} 
          />)
        }
        <rect
          x={w*i}
          y={0}
          width={w}
          height={w*partGroup.length}
          fill="#00ff0033"
          stroke="black"
          strokeWidth='1'
          style={{cursor:'pointer'}}
          className='clickable'
          onClick={this.clickPart.bind(this, i)}
        />
      </g>
      )
  }

  private genParts() {
    const {partsProp} = this.state;
    const w = 50;
    // let x = this.baseX-w;
    return this.partNames.map((partGroup,i) =>
      <g
        key={i}
      >
        {
          partGroup.map((part, j) => 
          <image
            x={w*i+10}
            y={j*50+10}
            width="30" height="30" xlinkHref={part} 
          />)
        }
        <rect
          x={w*i}
          y={0}
          width={w}
          height={w*partGroup.length}
          fill={partsProp[i].activated? (partsProp[i].selected ? '#00ff0033' : '#ffff0033') : '#ffffff01'}
          stroke="black"
          strokeWidth='1'
          style={{cursor:'pointer'}}
          className='clickable'
          onClick={this.clickPart.bind(this, i)}
        />
      </g>
      )
  }

  private genShortcuts() {
    const {shortcuts} = this.state;
    return shortcuts.sort((a,b)=>(a.activated?1:0) - (b.activated?1:0)).map((d,i)=> <g key={i}>
        <path
          d={`M ${d.x1} ${d.y1-2} Q ${d.xm} ${d.ym} ${d.xa-3} ${d.ya-5}`}
          stroke={d.activated? this.activatedColor : this.ignoredColor}
          strokeWidth='3'
          fill='none'
          className={`shortcut-${d.from}-${d.to}`}
          
        />
        <path
          d={`M ${d.x2} ${d.y2} L ${d.x2-18} ${d.y2+6} L ${d.x2-18} ${d.y2-6} Z`}
          fill={d.activated? this.activatedColor : this.ignoredColor}
          transform={`rotate(60, ${d.x2}, ${d.y2})`}
          className={`shortcut-${d.from}-${d.to}`}
        />
      </g>);
  }

  private dj (graph: any[][]) {
    const {jointPoints} = this;
    const pathChain:Array<IPathChainNode> = jointPoints.map(v=>({d: Math.floor(Number.MAX_SAFE_INTEGER/jointPoints.length), prev: undefined}));
    pathChain[0].d = 0;
    let p = 0;
    const nodeArray = [p];
    let nodeIdx = 0;
    while(nodeIdx < nodeArray.length) {
      p = nodeArray[nodeIdx];
      graph[p].forEach( (v,i) => {
        if(graph[p][i]>0) {
          // console.log(`${p} vs ${i}`)
          const l = graph[p][i] + pathChain[p].d;
          // console.log(`${l} vs ${pathChain[i].d}`)
          if (l < pathChain[i].d) {
            pathChain[i].d = l;
            pathChain[i].prev = p;
            const loc = nodeArray.indexOf(i)
            // if(loc === -1) {
              nodeArray.push(i);
            // } else {
              // nodeArray[loc] = i;
            // }
            // console.log(`push ${i}, nodeArray=${nodeArray}`)
          }
        }
      })
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
    let nodeChain = this.dj(graph);
    shortcuts.forEach((v:any)=> v.activated = false);
    partsProp.forEach((v:any)=> v.activated = false);
    for (let i=1;i< nodeChain.length ;i++) {
      const from = nodeChain[i-1];
      const to = nodeChain[i];
      if (graph[from][to] === stdWeight) {
        partsProp[from].activated = true;
        partsProp[from].selected = false;
      } else if (graph[from][to] === 1) {
        partsProp[from].activated = true;
        partsProp[from].selected = true;
      } else {
        shortcuts.filter((v:any) => v.from === from && v.to === to).forEach((v:any)=> v.activated = true);
      }
    }
    this.forceUpdate();
  }

  private clickPart = (index:number) => {
    const {graph, partsProp} = this.state;
    const d = partsProp[index];
    if (graph[d.from][d.to] === 1) {
      graph[d.from][d.to] = this.oriGraph[d.from][d.to];
    } else {
      graph[d.from][d.to] = 1;
    }
    this.calcPath();
  }

  private drawSVG () {
    const {
      selectedColor, invalidColor, activatedColor, ignoredColor
    } = this;
    let svg = d3.select('#part-selector')
    const letters = 'ABCDEFGHhIJKLMNOPQRSTUVWXYZ'.split('').map(v=>v==='h'?'Ha':v)
    let y = 100;
    let r = 500;
    const littleR = 10;
    const partR = 15;
    let centerCX = 50;
    let centerCY = 800;
    let circleData = letters.map((v,i)=>{
      const y = centerCY
      const x = centerCX + i * 100
      return {
        letter: v,
        x,
        y,
      }
    })

    let arrowData:IArrowData[] = circleData.map((v,i) => {
      if (i===0) return {x1:0, y1:0, x2:0, y2:0, xm:0, ym:0, activated:false, selected:false, from: 0, to:0};
      else {

        const x1 = circleData[i-1].x;
        const y1 = circleData[i-1].y;
        const x2 = v.x;
        const y2 = v.y;

        // const xm = (x1+x2)/2;
        // const ym = (y1+y2)/2;

        const ym = centerCY 
        const xm = centerCX + (i-0.51)*100

        return {
          x1,
          y1,
          x2,
          y2,
          xm,
          ym,
          activated: false,
          selected: false,
          from: i-1,
          to: i,
        }
      }
    }).filter((v,i) => i>0 )

    let shortcuts: IShortcut[] = [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'C'],
      ['B', 'E'],
      ['B', 'L'],
      ['D', 'E'],
      ['D', 'F'],
      ['E', 'F'],
      ['H', 'Ha'],
      ['H', 'J'],
      ['H', 'K'],
      ['Ha', 'J'],
      ['Ha', 'K'],
      ['J', 'K'],
      ['L', 'M'],
      ['L', 'N'],
      ['L', 'R'],
      ['L', 'W'],
      ['L', 'Y'],
      ['M', 'R'],
      ['N', 'R'],
      ['Q', 'R'],
      ['M', 'W'],
      ['R', 'W'],
      ['T', 'V'],
      ['U', 'V'],
      ['W', 'X'],
      ['W', 'Y'],
      ['W', 'Z'],
      ['Y', 'Z'],
    ].map((v,i) => {
      const from = letters.indexOf(v[0]);
      const to = letters.indexOf(v[1]);

      const rd = (to-from)*50;
      const xm = centerCX + ((from+to)/2) * 100
      const ym = centerCY - (rd)

      const x1b = circleData[from].x;
      const y1b = circleData[from].y;
      const x2b = circleData[to].x;
      const y2b = circleData[to].y;

      const rR = Math.sqrt(Math.pow(ym-y1b,2) + Math.pow(xm-x1b, 2)) / littleR
      const rR2 = Math.sqrt(Math.pow(ym-y2b,2) + Math.pow(xm-x2b, 2)) / littleR
      const rR2c = Math.sqrt(Math.pow(ym-y2b,2) + Math.pow(xm-x2b, 2)) / (littleR+18)

      const x1 = x1b + (xm-x1b)/rR
      const y1 = y1b + (ym-y1b)/rR
      const x2 = x2b - (x2b-xm)/rR2
      const y2 = y2b - (y2b-ym)/rR2
      const xa = x2b - (x2b-xm)/rR2c
      const ya = y2b - (y2b-ym)/rR2c
      
      let rg
      if(Math.abs(x2-xa) < 0.0001) {
        rg = x2>xa ? 90 : -90
      } else {
        rg = Math.atan((y2-ya) / (x2 - xa))*180/Math.PI;
        if(x2<xa) rg += 180;
      }

      return {from, to, distance: to-from, x1,y1,x2,y2, xm, ym, xa, ya, rg, activated:false}
    });

    // console.log(shortcuts)

    let arrowG = svg.append('g')

    let shortcutG = svg.append('g')
    let shortcutG2 = svg.append('g')
    let circleG = svg.append('g')

    let partG = svg.append('g')
    let partTextG = svg.append('g')


    circleG.selectAll('circle')
    .data(circleData)
    .enter()
    .append('circle')
    .attr('cx', d=>d.x)
    .attr('cy', d=>d.y)
    .attr('r', littleR)
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .attr('stroke-width', 3)


    circleG.selectAll('text')
    .data(circleData)
    .enter()
    .append('text')
    .attr('x', d=>d.x)
    .attr('y', d=>d.y)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('font-size',9)
    .attr('font-weight','bold')
    .attr('font','serif')
    .text(d=>d.letter)



    partG.selectAll('circle')
    .data(arrowData)
    .enter()
    .append('circle')
    .attr('r', partR)
    .attr('cx', d=>d!.xm)
    .attr('cy', d=>d!.ym)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'white')
    .attr('class', 'part')
    .on("click", (d,i) => {
      if (graph[d!.from][d!.to] === 1) {
        graph[d.from][d.to] = oriGraph[d.from][d.to];
      } else {
        graph[d.from][d.to] = 1;
      }
      // console.log(graph);
      nodeChain = dj(graph);
      refreshGraph(nodeChain, graph, arrowData, shortcuts);
    })

    const partTextCount = 0;
    partTextG.selectAll('g')
    .data(this.partNames)
    .enter()
    .append('g')
    .attr('class', (d,i) =>`part-text-g-${i}`)

    this.partNames.forEach((v,i)=> {
      const g = svg.select(`.part-text-g-${i}`);
      g.selectAll('text')
      .data(v)
      .enter()
      .append('text')
      .attr('x', d=> centerCX + i * 100 + 50)
      .attr('y', (d, j)=> centerCY + (i%2 === 0 ? 40: 60) + j*20).text(d=>d)
      .attr('text-anchor', 'middle')
    })

  arrowG.selectAll('path')
  .data(arrowData)
  .enter()
  .append('path')
  // .attr('d', d=> `M ${d.x1} ${d.y1} A ${r} ${r} 0 0 1 ${d.x2} ${d.y2}`)
  .attr('d', d=> `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`)
  .attr('stroke', d=>d.activated? d.selected ? this.selectedColor : this.invalidColor : this.ignoredColor)
  .attr('stroke-width', 3)
  .attr('fill', 'none')
  .attr('marker-end', d=>`url(#${d.activated? d.selected ? 'selectedArrow' : 'invalidArrow' : 'ignoredArrow'})`)
  .attr('class', d=> `path-${d.from}-${d.to}`)


  shortcutG.selectAll('path')
  .data(shortcuts)
  .enter()
  .append('path')
  .attr('d', d => `M ${d.x1} ${d.y1} Q ${d.xm} ${d.ym} ${d.xa} ${d.ya}`)
  // .attr('d', d => `M ${d.x1} ${d.y1} L ${d.xm} ${d.ym} L ${d.x2} ${d.y2})`)
  // .attr('stroke', d=>d.color)
  .attr('stroke', d=> d.activated? this.activatedColor : this.ignoredColor)
  .attr('stroke-width', 3)
  .attr('fill', 'none')
  .attr('class', d=>`shortcut-${d.from}-${d.to}`)

  shortcutG2.selectAll('path')
  .data(shortcuts)
  .enter()
  .append('path')
  .attr('d', d => `M ${d.x2} ${d.y2} L ${d.x2-18} ${d.y2+6} L ${d.x2-18} ${d.y2-6} Z`)
  .attr('stroke-width', 0)
  // .attr('fill', d=>d.color)
  .attr('fill', d=>d.activated? this.activatedColor : this.ignoredColor)
  .attr('transform',d=>`rotate(${d.rg}, ${d.x2}, ${d.y2})`)
  .attr('class', d=>`shortcut-${d.from}-${d.to}`)


  const stdWeight = 0x8000000; // 2^27 because the maximum safe int in JS is 2^53

  // graph
  const graph:any[][] = circleData.map((v,i) => circleData.map((w,j) => (
    (j === i + 1 ? stdWeight : undefined)
    )));
  shortcuts.forEach(shortcut => {
    const d = shortcut.distance;
    const w = stdWeight;
    graph[shortcut.from][shortcut.to] = d*w - d*d; 
  })

  // console.log(graph);

  const oriGraph = JSON.parse(JSON.stringify(graph));

  interface IPathChainNode {
    d: number,
    prev?: number,
  }
  function dj (graph: any[][]) {
    const pathChain:Array<IPathChainNode> = circleData.map(v=>({d: Math.floor(Number.MAX_SAFE_INTEGER/circleData.length), prev: undefined}));
    pathChain[0].d = 0;
    let p = 0;
    const nodeArray = [p];
    let nodeIdx = 0;
    while(nodeIdx < nodeArray.length) {
      p = nodeArray[nodeIdx];
      graph[p].forEach( (v,i) => {
        if(graph[p][i]>0) {
          // console.log(`${p} vs ${i}`)
          const l = graph[p][i] + pathChain[p].d;
          // console.log(`${l} vs ${pathChain[i].d}`)
          if (l < pathChain[i].d) {
            pathChain[i].d = l;
            pathChain[i].prev = p;
            const loc = nodeArray.indexOf(i)
            // if(loc === -1) {
              nodeArray.push(i);
            // } else {
              // nodeArray[loc] = i;
            // }
            // console.log(`push ${i}, nodeArray=${nodeArray}`)
          }
        }
      })
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

  let nodeChain = dj(graph);
  // console.log(nodeChain);

  function refreshGraph(nodeChain:any, graph:any, arrowData:IArrowData[], shortcuts:IShortcut[]) {
    shortcuts.forEach((v:any)=> v.activated = false);
    arrowData.forEach((v:any)=> v.activated = false);
    for (let i=1;i< nodeChain.length ;i++) {
      const from = nodeChain[i-1];
      const to = nodeChain[i];
      if (graph[from][to] === stdWeight) {
        arrowData[from].activated = true;
        arrowData[from].selected = false;
      } else if (graph[from][to] === 1) {
        arrowData[from].activated = true;
        arrowData[from].selected = true;
      } else {
        shortcuts.filter((v:any) => v.from === from && v.to === to).forEach((v:any)=> v.activated = true);
      }
    }

  partG.selectAll('circle')
  .data(arrowData)
  // .attr('stroke', d=> d.selected ? selectedColor : invalidColor)
  .attr('stroke', d=>d.activated? d.selected ? selectedColor : invalidColor : 'black')
  .attr('fill', d=>d.activated? d.selected ? '#ccffcc' : '#ffcccc' : '#fff')

  arrowG.selectAll('path')
  .data(arrowData)
  .attr('stroke', d=>d.activated? d.selected ? selectedColor : invalidColor : ignoredColor)
  .attr('marker-end', d=>`url(#${d.activated? d.selected ? 'selectedArrow' : 'invalidArrow' : 'ignoredArrow'})`)

  shortcuts.sort((a:any,b:any)=>a.activated ? 1: -1);

  shortcutG.selectAll('path')
  .data(shortcuts)
  .attr('d', d => `M ${d.x1} ${d.y1} Q ${d.xm} ${d.ym} ${d.xa} ${d.ya}`)
  .attr('stroke', d=> d.activated? activatedColor : ignoredColor)
  .attr('stroke-width', 3)
  .attr('fill', 'none')
  .attr('class', d=>`shortcut-${d.from}-${d.to}`)

  shortcutG2.selectAll('path')
  .data(shortcuts)
  .attr('d', d => `M ${d.x2} ${d.y2} L ${d.x2-18} ${d.y2+6} L ${d.x2-18} ${d.y2-6} Z`)
  .attr('stroke-width', 0)
  .attr('fill', d=>d.activated? activatedColor : ignoredColor)
  .attr('transform',d=>`rotate(${d.rg}, ${d.x2}, ${d.y2})`)
  .attr('class', d=>`shortcut-${d.from}-${d.to}`)

  }

  refreshGraph(nodeChain, graph, arrowData, shortcuts);
  }
}