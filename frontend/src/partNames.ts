import SVGUTR35 from './icons/5-3-UTR.svg';
import SVGITR35 from './icons/5-3-ITR.svg';
import SVGLTR35 from './icons/5-3-LTR.svg';
import SVGInsulator from './icons/insulator.svg';
import SVGIRES from './icons/IRES.svg';
import SVGKozakATG from './icons/Kozak-ATG.svg';
import SVGOrigin from './icons/Origin of repliction.svg';
import SVGp2A from './icons/p2A.svg';
import SVGPeptide from './icons/Peptide linker.svg';
import SVGpromoter from './icons/promoter.svg';
import SVGProteinTag from './icons/Protein Tag.svg';
import SVGRecombinase from './icons/recombinase-recognition-sequence.svg';
import SVGRNA from './icons/RNA-stability-sequence.svg';
import SVGTerminator from './icons/Terminator.svg';
import SVGCDS from './icons/CDS.svg';

export default [
    [{icon: SVGITR35, title:`5'/3' Homology arm / 5'/3' ITR`}, {icon:SVGLTR35, title:`5'/3' LTR`}, {icon: SVGRecombinase, title: `Recombinase recognition sequence`}],
    [{icon: SVGInsulator, title: `Insulator`}, {icon: SVGRecombinase, title: `Recombinase recognition sequence`}],
    [{icon: SVGpromoter, title: `Promoter`}],
    [{icon: SVGRNA, title: `RNA stablity sequence`}],
    [{icon: SVGUTR35, title: `5'/3' UTR`}],
    [{icon: SVGKozakATG, title: `Kozak-ATG`}, {icon: SVGProteinTag, title: `Protein Tag`}],
    [{icon: SVGCDS, title: `CDS`}],
    // [{icon: SVGProteinTag, title: `Protein Tag`}, {icon: SVGp2A, title: `p2A`}, {icon: SVGPeptide, title: `Peptide linker`}],
    // [{icon: SVGIRES, title: `IRES`}, {icon: SVGDummy, title: `nothing`}, {icon: SVGDummy, title: `nothing`}],
    [{icon: SVGProteinTag, title: `Protein Tag`}, {icon: SVGp2A, title: `p2A`, len:2}, {icon: SVGPeptide, title: `Peptide linker`, len:2}],
    [{icon: SVGIRES, title: `IRES`}],
    [{icon: SVGCDS, title: `CDS`}],
    [{icon: SVGUTR35, title: `5'/3' UTR`}, {icon:SVGLTR35, title:`5'/3' Homology arm / 5'/3' ITR`}],
    [{icon: SVGTerminator, title: `Terminator`}],
    [{icon: SVGInsulator, title: `Insulator`}],
    [{icon: SVGRecombinase, title: `Recombinase recognition sequence`}],
    [{icon: SVGpromoter, title: `Promoter`}],
    [{icon: SVGCDS, title: `CDS`}],
    [{icon: SVGTerminator, title: `Terminator`}],
    [{icon: SVGRecombinase, title: `Recombinase recognition sequence`}],
    [{icon: SVGpromoter, title: `Promoter`}],
    [{icon: SVGCDS, title: `CDS`}],
    [{icon: SVGp2A, title: `p2A`}, {icon: SVGPeptide, title: `Peptide linker`}, {icon: SVGIRES, title: `IRES`}, {icon: SVGProteinTag, title: `Protein Tag`}],
    [{icon: SVGCDS, title: `CDS`}],
    [{icon: SVGTerminator, title: `Terminator`}],
    [{icon: SVGInsulator, title: `Insulator`}],
    [{icon: SVGITR35, title:`5'/3' Homology arm / 5'/3' ITR`}, {icon: SVGRecombinase, title: `Recombinase recognition sequence`}],
    [{icon: SVGOrigin, title: `Origin of replication`}],
  ];