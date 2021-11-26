export interface IFeature {
  from: number,
  to: number,
  strand: string,
  ctype: string,
  label: string,
  attributes?: {
    [key:string]: string,
  }
}
export interface IDNA {
  sequence: string,
  features: IFeature[],
}

export class DNASeq implements IDNA {
  public sequence: string
  public features: IFeature[]

  constructor(dna: IDNA) {
    this.sequence = dna.sequence;
    this.features = dna.features;
  }

  toGenbank() {
    let re = `LOCUS       Exported                ${this.sequence.length} bp ds-DNA     circular SYN 29-AUG-2016\
DEFINITION  synthetic circular DNA
ACCESSION   .
VERSION     .
KEYWORDS    .
SOURCE      synthetic DNA construct
  ORGANISM  synthetic DNA construct
REFERENCE   1  (bases 1 to ${this.sequence.length})
  AUTHORS   Trial User
  TITLE     Direct Submission
  JOURNAL   Exported Mar 28, 2019 from SnapGene 4.1.9
            http://www.snapgene.com
FEATURES             Location/Qualifiers
     source          1..${this.sequence.length}
                     /organism="synthetic DNA construct"
                     /mol_type="other DNA"
`;
this.features.forEach(feature => {
  re+=`     ${feature.ctype.padEnd(15)} ${feature.strand==='-' ? `complement(${feature.from+1}..${feature.to})`: `${feature.from+1}..${feature.to}`}
                     /label=${feature.label}
`;
  if(feature.attributes) {
  Object.keys(feature.attributes).forEach(attributeKey => {
    re+=`                     /${attributeKey}=${feature.attributes![attributeKey]}
`;
  })
  }
});

re+=`ORIGIN
`;
let seq = ''
for (let i=0; i<this.sequence.length; i+=60) {
  let row = `${i.toString().padStart(9)}`
  for(let j=i;j<this.sequence.length && j<i+60;j+=10) {
    row += ` ${this.sequence.substr(j,10)}`;
  }
  row+='\n';
  seq += row;
}
return re + seq + '//\n';
  }
}