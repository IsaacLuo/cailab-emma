import * as React from 'react';
import styled from 'styled-components';

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

const Icon = styled.img`
width:30px;
height:30px;
`;

const Description = styled.span`
  font-size: small;
  font-color: #555;
`;

interface IProps {

}

interface IState {

}

class IconLegend extends React.Component<IProps, IState> {
  public render() {
    // tslint:disable: max-line-length
    return <div>
      <h3>Legend</h3>
      <div>
        <Icon src={SVGITR35}/>
        <em>5'/3' Homology arm:</em>
        <Description> Homology Arm for homologous recombination-mediated genome editing</Description>
      </div>

      <div>
        <Icon src={SVGITR35}/>
        <em>5'/3' ITR:</em>
        <Description> inverted terminal repeat sequence for transposon-based vectors or for adenoviral vectors</Description>
      </div>

      <div>
        <Icon src={SVGLTR35}/>
        <em>5'/3' LTR:</em>
        <Description> chimeric 5' LTR for lentiviral vectors</Description>
      </div>

      <div>
        <Icon src={SVGRecombinase}/>
        <em>Recombinase recognition sequence</em>
      </div>
      <div>
        <Icon src={SVGInsulator}/>
        <em>Insulator</em>
      </div>
      <div>
        <Icon src={SVGpromoter}/>
        <em>Promoter</em>
      </div>
      <div>
        <Icon src={SVGRNA}/>
        <em>RNA stablity sequence</em>
      </div>
      <div>
        <Icon src={SVGUTR35}/>
        <em>5'/3' UTR</em>
      </div>
      <div>
        <Icon src={SVGKozakATG}/>
        <em>Kozak-ATG</em>
      </div>
      <div>
        <Icon src={SVGCDS}/>
        <em>CDS</em>
      </div>
      <div>
        <Icon src={SVGp2A}/>
        <em>p2A</em>
      </div>
      <div>
        <Icon src={SVGPeptide}/>
        <em>Peptide linker</em>
      </div>
      <div>
        <Icon src={SVGProteinTag}/>
        <em>Protein Tag</em>
      </div>
      <div>
        <Icon src={SVGIRES}/>
        <em>IRES</em>
      </div>
      <div>
        <Icon src={SVGTerminator}/>
        <em>Terminator</em>
      </div>
      <div>
        <Icon src={SVGOrigin}/>
        <em>Origin of replication</em>
      </div>
    </div>;
  // tslint:enable: max-line-length
  }
}

export default IconLegend;

