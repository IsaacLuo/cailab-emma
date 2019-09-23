export function wellIdToWellName(wellId: number):string {
  const zone = Math.floor(wellId/96);
  const offset = wellId % 96;
  let row = Math.floor(offset/12);
  let col = offset%12;
  switch(zone) {
    case 1:
      col+=12;
      break;
    case 2:
      row+=8;
      break;
    case 3:
      col+=12;
      row+=8;
      break;
  }
  return String.fromCharCode(row + 65) + (col+1);
}

export function wellNameToWellId(wellName: string):number {
  const rowStr = wellName[0].toUpperCase();
  const colStr = wellName.slice(1);
  let col = parseInt(colStr) - 1;
  let row = rowStr.charCodeAt(0) - 65;
  let zone = 0;
  if (row>=8) {
    zone+=2;
    row-=8;
  }
  if (col>=12) {
    zone+=1;
    col-=12;
  }
  return zone*96+row*12+col;
}

export function wellPosToWellId(row: number, col:number):number {
  let zone = 0;
  if (row>=8) {
    zone+=2;
    row-=8;
  }
  if (col>=12) {
    zone+=1;
    col-=12;
  }
  return zone*96+row*12+col;
}