/**
 * PlateContentList
 */
import * as React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';


const MyTable = styled.table`
  width:100%;
  table-layout: fixed;
`;

const MyTd = styled.td`
  border: solid 1px;
`

const MyCell = styled.div`
  word-break: break-all;
  height: 50px;
  overflow:hidden;
  text-overflow:ellipsis;
`

const PlateContentTable = (props:any) => {
  console.log(props.plate)
  const plateRows:any[] = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],];

  for (let i=0;i<16;i++) {
    for (let j=0;j<24;j++) {
      const part = props.plate.content[i*24+j];
      if (part) {
        plateRows[i].push(part.part?part.part.part.name:part.connector.name);
      } else {
        plateRows[i].push('-')
      }
    }
  }
  return (
    <React.Fragment>
      <MyTable>
        <tbody>
          <th></th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th>4</th>
          <th>5</th>
          <th>6</th>
          <th>7</th>
          <th>8</th>
          <th>9</th>
          <th>10</th>
          <th>11</th>
          <th>12</th>
          <th>13</th>
          <th>14</th>
          <th>15</th>
          <th>16</th>
          <th>17</th>
          <th>18</th>
          <th>19</th>
          <th>20</th>
          <th>21</th>
          <th>22</th>
          <th>23</th>
          <th>24</th>
      {plateRows.map((row:any, i:number) =>
        <tr key={i}>
          <th style={{textAlign:'right'}}>{String.fromCharCode(65+i)}</th>
          {row.map((part:any, j:number)=>
            <MyTd key={j}>
              <Tooltip title={part}>
                <MyCell>{part}</MyCell>
              </Tooltip>
            </MyTd>
          )}
        </tr>
      )}
        </tbody> 
      </MyTable>
    </React.Fragment>
  );
}

export default PlateContentTable;
