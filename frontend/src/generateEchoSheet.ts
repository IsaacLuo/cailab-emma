import { IAssembly } from './../../api/src/models'
import papaparse from 'papaparse'

const DEFAULT_BACKBONE_LENGTH = 1840;
const DEFAULT_FMOL = 1.3;

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
 * @return nL
 */
export function calcDNAVolume(mass:number) {
  return Math.round(mass*1000 / 50);
}

function wellIdToWellName(id:number) {
  const col = id%12;
  const row = Math.floor(id/12);
  return `${String.fromCharCode(65+row)}${col+1}`
}

export function generateEchoSheet(assemblyList:IAssembly[], partLocations:any) {
  let wellId = 0;
  const sheet = [];
  sheet.push([
    'Source Plate Name', 
    'Source Plate Type',
    'Source Well', 
    'Destination Plate Name', 
    'Destination Well',
    'Transfer Volume', 
    'Destination Well X Offset', 
    'Destination Well Y Offset']);

  for (const assembly of assemblyList) {
    const dstWellName = wellIdToWellName(wellId);
    for (const part of assembly.finalParts) {
      const name = part.name;
      const seqLength = part.sequence.length;
      const plasmidLength = seqLength + DEFAULT_BACKBONE_LENGTH;
      const plasmidVolume = calcDNAVolume(calcDNAMass(DEFAULT_FMOL, plasmidLength));

      if(!partLocations[name]) {
        throw `${name} not found in the plate definition`;
      }

      sheet.push(['PartPlate', '384LDV_AQ_B', partLocations[name] , 'Assay1', dstWellName, plasmidVolume, 0, 0]);
    }
    wellId++;
  }

  return sheet;
}

export function generateMasterMixEchoSheet(wellsCount:number, masterVolumes:number[]) {
  let wellId = 0;
  const sheet = [];
  sheet.push([
    'Source Plate Name', 
    'Source Plate Type',
    'Source Well', 
    'Destination Plate Name', 
    'Destination Well',
    'Transfer Volume', 
    'Destination Well X Offset', 
    'Destination Well Y Offset']);

  while(wellId < wellsCount) {
    const dstWellName = wellIdToWellName(wellId);
    sheet.push(['PartPlate', '384LDV_AQ_B',  'A1' , 'Assay1', dstWellName, masterVolumes[wellId], 0, 0]);
    sheet.push(['PartPlate', '384LDV_AQ_B',  'A2' , 'Assay1', dstWellName, 1000 - masterVolumes[wellId], 0, 0]);
    wellId++;
  }

  return sheet;
}