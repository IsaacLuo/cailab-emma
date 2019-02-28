let svg = d3.select('#app')

const letters = 'ABCDEFGHhIJKLMNOPQRSTUVWXYZ'.split('').map(v=>v==='h'?'Ha':v)

const selectedColor = '#77cc77';
const invalidColor = '#77cc77';
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
.attr('fill', selectedColor)

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
      filled: false,
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

arrowG.selectAll('path')
.data(arrowData)
.enter()
.append('path')
.attr('d', d=> `M ${d.x1} ${d.y1} A ${r} ${r} 0 0 1 ${d.x2} ${d.y2}`)
.attr('stroke', d=>d.activated? d.selected ? selectedColor : invalidColor : ignoredColor)
.attr('stroke-width', 3)
.attr('fill', 'none')
.attr('marker-end', d=>`url(#${d.activated? d.selected ? 'selectedArrow' : 'invalidArrow' : 'ignoredArrow'})`)

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

shortcutG2.selectAll('path')
.data(shortcuts)
.enter()
.append('path')
.attr('d', d => `M ${d.x2} ${d.y2} L ${d.x2-18} ${d.y2+6} L ${d.x2-18} ${d.y2-6} Z`)
.attr('stroke-width', 0)
// .attr('fill', d=>d.color)
.attr('fill', d=>d.activated? activatedColor : ignoredColor)
.attr('transform',d=>`rotate(${d.rg}, ${d.x2}, ${d.y2})`)

