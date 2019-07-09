import { IAssembly } from './../../api/src/models'

  /**
   * 
   * @param fmol 
   * @param dnaLen 
   * @return ng
   */
  export function calcDNAMass(fmol:number, dnaLen:number) {
    return fmol * (dnaLen * 0.00061796 + 0.00003604);
  }

  /**
   * 
   * @param mass in ng
   * @return μL
   */
  export function calcDNAVolume(mass:number) {
    return mass / 50;
  }


export function generateEchoSheet(assemblyList:IAssembly[]) {
  for (const assembly of assemblyList) {
    assembly.finalParts[0].name
  }
}