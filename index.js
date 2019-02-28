let svg = d3.select('#app')

const letters = 'ABCDEFGHhIJKLMNOPQRSTUVWXYZ'.split('').map(v=>v==='h'?'Ha':v)

const selectedColor = '#77cc77';
const invalidColor = '#cc7777';
const activatedColor = '#333333';
const ignoredColor = '#dddddd';


let refs = svg.append('defs')
refs
.append('marker')
.attr('id', 'selectedArrow')
.attr('markerWidth', 10)
.attr('markerHeight', 9)
.attr('refX',9)
.attr('refY',2)
.attr('orient','auto')
.attr('markerunits', 'strokeWidth')
.append('path')
.attr('d', 'M0,0 L0,4 L6,2 z')
.attr('fill', selectedColor)

refs
.append('marker')
.attr('id', 'invalidArrow')
.attr('markerWidth', 10)
.attr('markerHeight', 9)
.attr('refX',9)
.attr('refY',2)
.attr('orient','auto')
.attr('markerunits', 'strokeWidth')
.append('path')
.attr('d', 'M0,0 L0,4 L6,2 z')
.attr('fill', invalidColor)

refs
.append('marker')
.attr('id', 'ignoredArrow')
.attr('markerWidth', 10)
.attr('markerHeight', 9)
.attr('refX',9)
.attr('refY',2)
.attr('orient','auto')
.attr('markerunits', 'strokeWidth')
.append('path')
.attr('d', 'M0,0 L0,4 L6,2 z')
.attr('fill', ignoredColor)


let y = 100;
let r = 500;
const littleR = 10;
const partR = 15;
let centerCX = 600;
let centerCY = 600;
let circleData = letters.map((v,i)=>{
  const y = centerCY - r * Math.cos((i+1)*Math.PI * 2 / (letters.length + 1))
  const x = centerCX + r * Math.sin((i+1)*Math.PI * 2 / (letters.length + 1))
  return {
    letter: v,
    x,
    y,
  }
})

let arrowData = circleData.map((v,i) => {
  if (i===0) return false;
  else {

    const x1 = circleData[i-1].x;
    const y1 = circleData[i-1].y;
    const x2 = v.x;
    const y2 = v.y;

    // const xm = (x1+x2)/2;
    // const ym = (y1+y2)/2;

    const ym = centerCY - r * Math.cos((i+0.45)*Math.PI * 2 / (letters.length + 1))
    const xm = centerCX + r * Math.sin((i+0.45)*Math.PI * 2 / (letters.length + 1))

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

// let pens = ['#77cc77', '#7777cc', '#cc7777', '#cc77cc', '#77cccc', '#cccc77', '#cc77cc', ]
let pens = [];
for (let i=0;i<30;i++) {
  pens.push(`rgb(${100+Math.floor(Math.random()*100)}, ${100+Math.floor(Math.random()*128)}, ${100+Math.floor(Math.random()*128)})`)
}

let shortcuts = [
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

  const rd = r-(to-from)*50;
  const xm = centerCX + (rd) * Math.sin( (((from+to)/2)+1) * Math.PI * 2 / (letters.length + 1))
  const ym = centerCY - (rd) * Math.cos( (((from+to)/2)+1) * Math.PI * 2 / (letters.length + 1))

  const x1b = circleData[from].x;
  const y1b = circleData[from].y;
  const x2b = circleData[to].x;
  const y2b = circleData[to].y;

  const rR = Math.sqrt(Math.pow(ym-y1b,2) + Math.pow(xm-x1b, 2)) / littleR
  const rR2 = Math.sqrt(Math.pow(ym-y2b,2) + Math.pow(xm-x2b, 2)) / littleR
  const rR2c = Math.sqrt(Math.pow(ym-y2b,2) + Math.pow(xm-x2b, 2)) / (littleR+18)

  x1 = x1b + (xm-x1b)/rR
  y1 = y1b + (ym-y1b)/rR
  x2 = x2b - (x2b-xm)/rR2
  y2 = y2b - (y2b-ym)/rR2
  xa = x2b - (x2b-xm)/rR2c
  ya = y2b - (y2b-ym)/rR2c
  
  let rg
  if(Math.abs(x2-xa) < 0.0001) {
    rg = x2>xa ? 90 : -90
  } else {
    rg = Math.atan((y2-ya) / (x2 - xa))*180/Math.PI;
    if(x2<xa) rg += 180;
  }


  const color = pens[i];
  return {from, to, distance: to-from, x1,y1,x2,y2, xm, ym, xa, ya,color, rg, activated:false}
  });

// console.log(shortcuts)

let arrowG = svg.append('g')

let shortcutG = svg.append('g')
let shortcutG2 = svg.append('g')
let circleG = svg.append('g')

let partG = svg.append('g')


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
.attr('cx', d=>d.xm)
.attr('cy', d=>d.ym)
.attr('stroke', 'black')
.attr('stroke-width', 1)
.attr('fill', 'white')
.attr('class', 'part')
.on("click", (d,i) => {
  if (graph[d.from][d.to] === 1) {
    graph[d.from][d.to] = oriGraph[d.from][d.to];
  } else {
    graph[d.from][d.to] = 1;
  }
  // console.log(graph);
  nodeChain = dj(graph);
  refreshGraph(nodeChain, graph, arrowData, shortcuts);
})

arrowG.selectAll('path')
.data(arrowData)
.enter()
.append('path')
.attr('d', d=> `M ${d.x1} ${d.y1} A ${r} ${r} 0 0 1 ${d.x2} ${d.y2}`)
.attr('stroke', d=>d.activated? d.selected ? selectedColor : invalidColor : ignoredColor)
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
.attr('stroke', d=> d.activated? activatedColor : ignoredColor)
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
.attr('fill', d=>d.activated? activatedColor : ignoredColor)
.attr('transform',d=>`rotate(${d.rg}, ${d.x2}, ${d.y2})`)
.attr('class', d=>`shortcut-${d.from}-${d.to}`)


const stdWeight = 0x8000000; // 2^27 because the maximum safe int in JS is 2^53

// graph
const graph = circleData.map((v,i) => circleData.map((w,j) => (
  (j === i + 1 ? stdWeight : undefined)
  )));
shortcuts.forEach(shortcut => {
  const d = shortcut.distance;
  const w = stdWeight;
  graph[shortcut.from][shortcut.to] = d*w - d*d; 
})

// console.log(graph);

const oriGraph = JSON.parse(JSON.stringify(graph));


function dj (graph) {
  const pathChain = circleData.map(v=>({d: Math.floor(Number.MAX_SAFE_INTEGER/circleData.length), prev: undefined}));
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
    nodeIdx = pathChain[nodeIdx].prev;
  }
  // console.log(pathChain);
  return re;
}

let nodeChain = dj(graph);
// console.log(nodeChain);

function refreshGraph(nodeChain, graph, arrowData, shortcuts) {
  shortcuts.forEach(v=> v.activated = false);
  arrowData.forEach(v=> v.activated = false);
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
      shortcuts.filter(v => v.from === from && v.to === to).forEach(v=> v.activated = true);
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

shortcuts.sort((a,b)=>a.activated ? 1: -1);

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




