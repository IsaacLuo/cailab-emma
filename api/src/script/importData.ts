import parts from './parts.json'
import conf from '../../conf'

import mongoose from 'mongoose';
import {IPartDefinition, PartDefinition} from '../models';

async function main() {
  try {
    const mongooseState = mongoose.connection.readyState;
    switch (mongooseState) {
      case 3:
      case 0:
      await mongoose.connect(
        conf.secret.mongoDB.url,
        {
          useNewUrlParser: true,
          user: conf.secret.mongoDB.username,
          pass: conf.secret.mongoDB.password, 
        }
      );
      break;
    }
  } catch(error) {
    
  }

  await PartDefinition.deleteMany({}).exec();

  console.log('start import');

  for(const pos of parts) {
    for (const p of pos.parts) {
      
      console.log(p.name);
      const now = new Date();
      PartDefinition.create({
        owner: '5c88cea93c27125df4ff9f4a',
        group:'all',
        createdAt: now,
        updatedAt: now,
        permission: 0x666,
        part: {
          position: p.position,
          name: p.name,
          labName: p.labName,
          category: p.category,
          subCategory: p.subCategory,
          comment: p.comment,
          sequence: p.sequence,
          plasmidLength: p.plasmidLength,
          backboneLength: p.backboneLength,
        }
      })
    }
  }

  console.log('finish')
}

main();