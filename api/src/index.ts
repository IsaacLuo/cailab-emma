/// <reference path="@types/index.d.ts" />

// import { ICustomState, IProject } from './types';
import koa from 'koa';
import koaBody from 'koa-body';
import middleware from './middleware'
import Router from 'koa-router';
import log4js from 'log4js';
import conf from '../conf';
import crypto from 'crypto';
import {Project, Assembly, AssemblyList, PartDefinition, PlateDefinition, User} from './models';
import jwt from 'jsonwebtoken';
import cors from 'koa-cors';
import mongoose from 'mongoose';
// import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa'
import {ApolloServer} from 'apollo-server-koa'
import GraphqlSchema from './graphql/schema'
import { DNASeq } from './helpers/gbGenerator';
import fs from "fs";
import { zip } from 'zip-a-folder';
import vectorReceiver from '../vectorReceiver.json';
import views from 'koa-views';
import ejs from "ejs";
import pdf from "html-pdf";

const GUEST_ID = '000000000000000000000000';

const app = new koa();
const router = new Router();

const render = views(__dirname + '/html', {map:{html: 'ejs'}});
app.use(render);

type Ctx = koa.ParameterizedContext<ICustomState>;
type Next = ()=>Promise<any>;

app.use(cors({credentials: true}));
app.use(koaBody());
middleware(app);

function userMust (...args: Array<(ctx:koa.ParameterizedContext<any, {}>, next:()=>Promise<any>)=>boolean>) {
  const arg = arguments;
  return async (ctx:koa.ParameterizedContext<any, {}>, next:Next)=> {
    if (Array.prototype.some.call(arg, f=>f(ctx))) {
      await next();
    } else {
      ctx.throw(401);
    }
  };
}

function beUser (ctx:Ctx, next?:Next) {
  // console.log(ctx.state.user.groups);
  return ctx.state.user && (ctx.state.user.groups.indexOf('emma/users')>=0 || ctx.state.user.groups.indexOf('users')>=0);
  // return ctx.state.user!== undefined;
}

function beAnyOne (ctx:Ctx, next?:Next) {
  // console.log(ctx.state.user.groups);
  // return ctx.state.user && (ctx.state.user.groups.indexOf('emma/users')>=0 || ctx.state.user.groups.indexOf('users')>=0);
  return ctx.state.user!== undefined;
}

function beAdmin (ctx:Ctx, next?:Next) {
  return ctx.state.user && (ctx.state.user.groups.indexOf('administrators')>=0 || ctx.state.user.groups.indexOf('emma/administrators')>=0);
}

function beGuest (ctx:Ctx, next?:Next) {
  return ctx.state.user === undefined || ctx.state.user._id === '000000000000000000000000';
}

router.get('/', async (ctx:koa.ParameterizedContext<any, {}>)=> {
  console.log(JSON.stringify(ctx.request));
  ctx.body={message:'server: cailab-emma', request:ctx.request.origin, ctx};
})

router.post('/api/session', 
userMust(beUser),
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  
  if (user) {
    const {_id, name, email, groups} = user;
    await User.updateOne({_id: user._id}, {_id, name, email, groups, lastLogin: new Date(), lastIP: ctx.request.ip}, {upsert:true}).exec();
    ctx.body = {message:'OK', user,};
  } else {
    ctx.throw(401, 'user is not logged in');
  }
});

router.get('/api/user/current', async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  ctx.body = {message:'OK', user,};
  if (user) {
    const now = Math.floor(Date.now() / 1000);
    const eta = ctx.state.user.exp - now;
    ctx.body = {message:'OK', user, eta};
  }
});

router.get('/api/projects/', 
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  if (user._id === '000000000000000000000000') {
    ctx.body = [];
  } else {
    await next();
  }
},
userMust(beAnyOne, beUser),
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  console.log(user._id);
  if (user) {
    const projects = await Project.aggregate([
      { 
        $match: {
          owner: new mongoose.Types.ObjectId(user._id)
        } 
      },
      {
        $lookup: {
          from: "assemblies",
          localField: "_id",
          foreignField: "project",
          as: "assemblies",
        }
      },
      {
        $project: {
          assemblies: {$size: '$assemblies'},
          name: '$name',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          owner: '$owner',
          permission: '$permission',
        }
      },

      ])
    // const projects = await Project.find({owner: user._id}).select('_id name createdAt updatedAt').exec();
    ctx.body = projects;
  } else {
    ctx.throw(401);
  }
});

router.get('/api/project/:id',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  if (user) {
    const project = await Project.findOne({
      _id:ctx.params.id, 
      $or:[
        {owner: user._id},
        {permission: {$bitsAllSet: 4}},
      ],
    })
      .populate('parts.partDefinition')
      .populate('connectors')
      .exec();
    if (!project) {
      ctx.throw(404);
    }
    ctx.body = project;
  } else {
    ctx.throw(401);
  }
});

router.post('/api/project',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  if (user) {
    const {name, presetIndexes} = ctx.request.body;

    const now = new Date();
    let parts = [];
    if(presetIndexes) {
      parts = presetIndexes.map(v=>({selected:true, activated:true, position:v}));
    }
    const project = await Project.create(
      {
        name,
        version: '1.0',
        parts,
        connectors: [],
        // connetorIndexes: [],
        owner: user._id,
        group: '',
        permission: 666,
        createdAt: now,
        updatedAt: now,
        history: [],
      });
    ctx.body = {message:'OK', project: project};
  } else {
    ctx.throw(401, user);
  }
});

router.put('/api/project/:id',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  if (user) {
    const now = new Date();
    const {id} = ctx.params;
    const projectCount = await Project.countDocuments({
      _id:id, 
      owner: {$ne:user._id}, 
      permission: {$bitsAllClear: 2},
    }).exec();
    if (projectCount>0) {
      ctx.throw(401, 'unable to modify projects of other users');
    }
    const {name, parts, partsMultiIds, connectors} = ctx.request.body;
    
    const project = await Project.findOne({
      _id:ctx.params.id,
    }).exec();

    if (!project) {
      ctx.throw(404);
    }
    
    const projectHistory: IProject = {
      _id: project._id,
      name: project.name,
      version: project.version,
      parts: project.parts,
      partsMultiIds: project.partsMultiIds,
      connectors: project.connectors,
      permission: project.permission,
      owner: project.owner,
      group: project.group,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      history: [],
    };
    let projectHistoryValid = true;
    if(!project.parts.find(v=>v.selected)) {
      // empty Project dont save
      projectHistoryValid = false;
    } else if(JSON.stringify(project.parts) === JSON.stringify(parts)) {
      // same history layout, dont save
      projectHistoryValid = false;
    }
    if(projectHistoryValid) {
      project.history.unshift(projectHistory);
      project.history = project.history.slice(0,10);
      // save original to history
      project.name = name;
      project.parts = parts;
      project.partsMultiIds = partsMultiIds;
      project.connectors = connectors;
      project.updatedAt= now;
      project.save();
      ctx.body = {message:'OK', project};
    } else {
      project.name = name;
      project.parts = parts;
      project.partsMultiIds = partsMultiIds;
      project.connectors = connectors;
      project.updatedAt= now;
      project.save();
      ctx.body = {message:'OK, but no history saved', project};
    }
  } else {
    ctx.throw(401);
  }
});

router.delete('/api/project/:id',
userMust(beAnyOne, beUser),
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  if (user) {
    const now = new Date();
    const id = ctx.params.id;
    console.log('delete id' + id);
    const projectCount = await Project.countDocuments({_id:id, owner: {$ne:user._id}}).exec();
    if (projectCount>0) {
      ctx.throw(401, 'unable to modify projects of other users');
    }
    const res = await Project.deleteOne({_id:id, owner: user._id}).exec();
    if (res.n === 1) {
      ctx.body = {message:'OK'}
      next(); // no await needed
    } else {
      ctx.throw(404);
    }
  } else {
    ctx.throw(401);
  }
},
// delete old guest project
async (ctx:Ctx, next:Next)=> {
  const res = await Project.deleteMany({owner: GUEST_ID, updatedAt:{$lt: new Date(Date.now()-172800000)}}).exec();
  console.log('guest project deleted', res.n, res.ok);
}
);

router.post('/api/project/:id/clone',
userMust(beUser),
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  if (user) {
    const now = new Date();

    const project = await Project.findOne({
      _id:ctx.params.id, 
      $or:[
        {owner: user._id},
        {permission: {$bitsAllSet: 4}},
      ],
    }).exec();
    if (!project) {
      ctx.throw(404);
    }

    delete project._id;
    ctx.body = await Project.create({
      name: 'clone of ' + project.name,
      version: project.version,
      parts: project.parts,
      connectors: project.connectors,
      history: [],
      owner: ctx.state.user!._id,
      permission: project.permission,
      createdAt: now,
      updatedAt: project.updatedAt,
    });

  } else {
    ctx.throw(401);
  }
},
);

router.get('/api/sharedProjects',
userMust(beUser),
async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  // console.log(user._id);
  if (user) {
    const projects = await Project.find({
      owner:{$ne: user._id},
      permission: {$bitsAllSet:4},
    })
    .select('_id name owner updatedAt')
    .populate({path:'owner', model: 'User', select: 'name email'})
    .exec();
    ctx.body = projects;
  } else {
    ctx.throw(401);
  }
})

router.delete('/api/project/:id/history/:index',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  const {id, index} = ctx.params;
  const {time} = ctx.request.query;
  const project = await Project.findById(id).exec();
  const history = project.history[index]
  if(history && history.updatedAt.getTime()===new Date(time as string).getTime()) {
    project.history.splice(index,1);
    await project.save();
    ctx.body={project};
  } else {
    ctx.throw(404);
  }

});


router.get('/api/project/:id/assembly',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  const {id} = ctx.params;
  const assembly = await Assembly.findOne({project:id}).exec();
  ctx.body = assembly.finalParts;
});

router.put('/api/project/:id/assembly',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  const {id} = ctx.params;
  console.log(ctx.request.body);
  ctx.body = await Assembly.update({project:id}, {_id:id, project:id, finalParts:ctx.request.body}, {upsert:true}).exec();
});

router.post('/api/assemblyList',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  ctx.body = await AssemblyList.create({assemblies:ctx.request.body, createdAt: new Date(), owner:ctx.state.user._id});
});

router.get('/api/assemblyList/:id',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  const {id} = ctx.params;
  const assemblyList = await AssemblyList.findById(id).populate('assemblies').exec();
  ctx.body = assemblyList;
});

router.get('/api/partNames/',
userMust(beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  let groups = ['all'];
  if (ctx.state.user) {
    groups = [...groups, ...ctx.state.user.groups];
  }
  const partDefinitions = await PartDefinition.find({}).select('part.name part.labName').exec();
  ctx.body = partDefinitions.map(v=>({_id:v._id, name:v.part.name, labName:v.part.labName}));

});

router.post('/api/partDefinition/item',
userMust(beUser),
async (ctx:Ctx, next:Next)=> {
  const form:IPartDefinition = ctx.request.body as IPartDefinition;
  if (form.group && ctx.state.user.groups.indexOf(form.group) < 0) {
    ctx.throw(401, 'unable to apply the group settings');
  }
  if (form.permission === undefined) {
    form.permission = 0x666;
  }
  form.owner = ctx.state.user._id;
  const now = new Date();
  form.createdAt = now;
  form.updatedAt = now;
  const docs = await PartDefinition.find({'part.name':form.part.name}).limit(1).exec();
  if (docs.length) {
    console.log(docs.length, docs);
    ctx.throw(401, 'name already exists');
  }

  ctx.body = await PartDefinition.create(form);
});

router.get('/api/partDefinition',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  let userId:string[]|undefined;
  let groups = [undefined];
  if(ctx.state.user) {
    userId = [undefined, ctx.state.user._id];
    groups = [undefined, ...ctx.state.user.groups];
  }
  
  ctx.body = await PartDefinition.find({
    $or: [
      {owner: {$in:userId}},
      {groups, permission:{$bitsAllSet:0x40}},
      {permission:{$bitsAllSet:0x04}},
    ]
  }).exec();
});

router.delete('/api/partDefinition/item/:id',
userMust(beUser),
async (ctx:Ctx, next:Next)=> {
  let userId:string[]|undefined;
  let groups = [undefined];
  if(ctx.state.user) {
    userId = [undefined, ctx.state.user._id];
    groups = [undefined, ...ctx.state.user.groups];
  }
  const {id} = ctx.params;
  const res = await PartDefinition.deleteMany({
    _id: id,
    $or: [
      {owner: {$in:userId}},
      {groups, permission:{$bitsAllSet:0x40}},
      {permission:{$bitsAllSet:0x04}},
    ]
  }).exec();
  if(res['deletedCount']>0) {
    ctx.body = {message:'OK'};
  }else {
    ctx.throw(404);
  }
});

router.put('/api/project/:id/permission',
userMust(beUser),
async (ctx:Ctx, next:Next)=> {
  const {id} = ctx.params;
  const {permission} = ctx.request.body;
  ctx.body = await Project.updateOne({_id:id, owner: ctx.state.user._id}, {permission}).exec();
});

// -----------------------------------------------------------------------------------------------
router.post('/api/plateDefinition',
userMust(beUser, beAdmin),
async (ctx:Ctx, next:Next)=> {
  const userId = ctx.state.user._id;
  console.log(userId);
  if(!ctx.request.body) {
    ctx.throw(403);
  }
  console.log(ctx.request.body);
  if (!ctx.request.body.owner || ctx.request.body.owner === '') {
    ctx.request.body.owner = userId;
  }
  if(beAdmin(ctx) && userId !== ctx.request.body.owner) {
    ctx.throw(401, 'cannot set owner to others');
  }
  await next();
},
async (ctx:Ctx, next:Next)=> {
  const {owner, group, permission, plateType, name, barcode, parts}
  :{owner:string, group:string, permission:number, plateType:'96'|'384', name: string, barcode:string, parts:any[]}
    = ctx.request.body;
  const now = new Date();
  console.log('create plate');
  // const partIds = parts.filter(v=>v!=='' && v!== undefined);
  const partIds = parts.map(v=>v===''?undefined:v);
  console.log('partIds', partIds);
  if (partIds === []) {
    ctx.throw(403, 'no parts');
  }
  const partsCount = await PartDefinition.find({_id:partIds}).countDocuments().exec();
  const uniquePartSize = new Set(partIds.filter(v=>v)).size;
  console.log('partsCount', partsCount, uniquePartSize);
  if (partsCount < uniquePartSize) {
    ctx.throw(404, 'some part not found in database');
  }
  if (plateType !== '96' && plateType !== '384') throw new Error('plate type incorrect');
  ctx.body = await PlateDefinition.create({
    owner,
    group,
    createdAt: now,
    updatedAt: now,
    permission,
    plateType,
    name,
    barcode,
    content: parts
  });
  // ctx.body = {message:'OK'};
});

// -----------------------------------------------------------------------------------------------
router.get('/api/plateDefinition/:id',
userMust(beAnyOne),
async (ctx:Ctx, next:Next)=> {
  const plate = await PlateDefinition.findById(ctx.params.id).exec();
  if(!plate) {
    ctx.throw(404, 'no plate');
  }
  let permissionMask = 0x000;
  if (ctx.state.user && plate.owner === ctx.state.user._id) {
    // plate owner
    permissionMask = 0x400;
  } else if (ctx.state.user && plate.group && ctx.state.user.groups.indexOf(plate.group)>=0) {
    permissionMask = 0x040;
  } else {
    permissionMask = 0x004;
  }
  if ((plate.permission & permissionMask) !== 0) {
    ctx.body = plate;
  } else {
    ctx.throw(401, 'no permission of this plate');
  }
});

// -----------------------------------------------------------------------------------------------

/** generate genbank in temp folder */
async function generateGenbank(assembly:string[], folderName:string) {
  const parts = await PartDefinition.find({_id:assembly}).exec();
  const sequenceArr = [];
  const features = [];
  let from = vectorReceiver.sequence.length;
  let fileName = "";
  for(const id of assembly) {
    const part = parts.find((p)=>{return p._id.toString() === id});
    const {sequence, name} = part.part;
    fileName+=`[${name}]`;
    const trimmedSequence = sequence.substr(0,sequence.length-4);
    features.push({
        from: from,
        to: from + trimmedSequence.length,
        strand: '.',
        ctype: 'misc_feature',
        label: name,
      });
    sequenceArr.push(trimmedSequence);
    from += trimmedSequence.length;
  }

  const dna = new DNASeq({    
    sequence:vectorReceiver.sequence + sequenceArr.join(""),
    features: [...vectorReceiver.features, ...features],
  });
  const gbFile = dna.toGenbank();
  const fp = await fs.promises.open(`${folderName}/${fileName}.gb`,"w");
  await fp.write(gbFile)
  await fp.close();
  
}

function calcDNAMass(fmol:number, dnaLen:number) {
  return fmol * (dnaLen * 0.00061796 + 0.00003604);
}

function calcDNAVolume(mass:number) {
  return mass / 50;
}

const toCeilFixed = (x:number, digits:number)=>(Math.ceil(x*Math.pow(10,digits))/Math.pow(10,digits)).toFixed(digits)

const manualProtocolTemplateHtml = fs.readFileSync(__dirname+"/html/manualProtocol.html", 'utf-8');
const manualProtocolTemplate = ejs.compile(manualProtocolTemplateHtml, {async:true, client:false});


async function generateManualProtocols(assembly:string[], folderName:string) {
  const backboneLength = 1840;
  const parts = await PartDefinition.find({_id:assembly}).exec();
  let len = vectorReceiver.sequence.length;
  let partsInfo:any[] = [];
  let dnaVolumeSum = 0;
  // let fileName = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  let fileName = "";
  for(const id of assembly) {
    const part = parts.find((p)=>{return p._id.toString() === id});
    const {sequence, name} = part.part;
    const vectorLen = sequence.length+backboneLength;
    const mass = calcDNAMass(13, vectorLen);
    const volume = calcDNAVolume(mass);
    dnaVolumeSum += volume;
    partsInfo.push({name, vectorLen, mass:mass.toFixed(2), volume:toCeilFixed(volume,1)});
    fileName+=`[${name}]`
    // len += sequence.length -4;
  }

  const waterVolume = toCeilFixed(10-1.85-dnaVolumeSum-0.5, 1);

  const fileContent = await manualProtocolTemplate({parts:partsInfo, waterVolume});
  await new Promise((resolve, reject)=> {
    pdf.create(fileContent, {format:"A4"}).toFile(`${folderName}/${fileName}.pdf`, (err, res) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      else{
        resolve(res)
      }
    });
  });
  
  // const fp = await fs.promises.open(`${folderName}/${fileName}.html`,"w");
  // await fp.write(fileContent)
  // await fp.close();
}

/** 
 * @param pos, the position from 0-26
 * @param itemIdx, the index of the selected items from 0 to len
 */
async function selectCombination(ids:string[][], pos:number, assembly:string[], folderName:string, generateFileFunction:(assembly:string[], folderName:string)=>Promise<void>) {
  if(pos>=ids.length) {
    await generateFileFunction(assembly, folderName);
    return;
  }
  const currentPostList = ids[pos];
  if (currentPostList && currentPostList?.length>0) {
    for(const id of currentPostList) {
      await selectCombination(ids, pos+1, [...assembly, id], folderName, generateFileFunction);
    }
  } else {
    await selectCombination(ids, pos+1, assembly, folderName, generateFileFunction);
  }
}

router.get('/api/project/:id/multiResults',
userMust(beUser, beAdmin),
async (ctx:Ctx, next:Next)=> {
  const project = await Project.findById(ctx.params.id).exec();
  if(!project) {
    ctx.throw(404, 'no project');
  }
  const {partsMultiIds} = project;
  const folderName = `output/${Date.now().toString()}`;
  fs.promises.mkdir(folderName, {recursive:true});
  await selectCombination(partsMultiIds, 0, [], folderName, generateGenbank);
  await zip(folderName, `${folderName}.zip`);
  console.log('file generated');
  fs.promises.rmdir(folderName, {recursive:true});
  ctx.body = fs.createReadStream(`${folderName}.zip`);
  ctx.attachment(`${folderName}.zip`)
});

router.get('/api/project/:id/multiResultsManualProtocols',
userMust(beUser, beAdmin),
async (ctx:Ctx, next:Next)=> {
  const project = await Project.findById(ctx.params.id).exec();
  if(!project) {
    ctx.throw(404, 'no project');
  }
  const {partsMultiIds} = project;
  const folderName = `output/${Date.now().toString()}`;
  fs.promises.mkdir(folderName, {recursive:true});
  await selectCombination(partsMultiIds, 0, [], folderName, generateManualProtocols);
  await zip(folderName, `${folderName}.zip`);
  console.log('file generated');
  fs.promises.rmdir(folderName, {recursive:true});
  ctx.body = fs.createReadStream(`${folderName}.zip`);
  ctx.attachment(`${folderName}.zip`)
});

router.get('/api/project/:id/multiResultsAutomaticProtocols',
userMust(beUser, beAdmin),
async (ctx:Ctx, next:Next)=> {
  const project = await Project.findById(ctx.params.id).exec();
  if(!project) {
    ctx.throw(404, 'no project');
  }
  const {partsMultiIds} = project;
  const folderName = `output/${Date.now().toString()}`;
  fs.promises.mkdir(folderName, {recursive:true});
  await selectCombination(partsMultiIds, 0, [], folderName, generateManualProtocols);
  await zip(folderName, `${folderName}.zip`);
  console.log('file generated');
  fs.promises.rmdir(folderName, {recursive:true});
  ctx.body = fs.createReadStream(`${folderName}.zip`);
  ctx.attachment(`${folderName}.zip`)
});

router.get('/api/project/:id/mmp/', async (ctx:Ctx, next:Next)=> {
  console.log('testmmp')
  await ctx.render('manualProtocol', {parts:[{name:"x", len:20, mass: 10, volume:10,}], waterVolume:100})
});


router.post('/graphql', async (ctx:Ctx, next:Next)=> {
  console.log(ctx.request.body);
  await next();
});

app.use(router.routes());

const apolloServer = new ApolloServer({schema: GraphqlSchema});
apolloServer.applyMiddleware({app, path:'/graphql'});

// -----------------------------------------------------------------------------------------------
// router.get('/graphql',
// async (ctx:Ctx, next:Next)=> {
//   await graphqlKoa({schema: GraphqlSchema})(ctx, next);
// });
// router.post('/graphql',
// async (ctx:Ctx, next:Next)=> {
//   await graphqlKoa({schema: GraphqlSchema})(ctx, next);
// });

// router.get('/graphiql', 
// async (ctx:Ctx, next:Next)=> {
//   await graphiqlKoa({endpointURL: '/graphql'})(ctx)
// }
// );



// -----------------------------------------------------------------------------------------------


app.listen(10402, '0.0.0.0');
log4js.getLogger().info('start listening at 10402');
