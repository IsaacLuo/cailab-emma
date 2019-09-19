import { ICustomState, IProject } from './types';
import koa from 'koa';
import koaBody from 'koa-body';
import middleware from './middleware'
import Router from 'koa-router';
import log4js from 'log4js';
import conf from '../conf';
import crypto from 'crypto';
import {Project, Assembly, AssemblyList, IPartDefinition, PartDefinition, PlateDefinition} from './models';
import jwt from 'jsonwebtoken';
import cors from 'koa-cors';
import mongoose from 'mongoose';
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa'
import GraphqlSchema from './graphql/schema'

const GUEST_ID = '000000000000000000000000';

const app = new koa();
const router = new Router();

type Ctx = koa.ParameterizedContext<ICustomState, {}>;
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
  ctx.body={message:'server: cailab-emma'};
})

router.get('/api/user/current', async (ctx:Ctx, next:Next)=> {
  const user = ctx.state.user;
  ctx.body = {message:'OK', user,};
  if (user) {
    const now = Math.floor(Date.now() / 1000);
    const eta = ctx.state.user.exp - now;
    ctx.body.eta = eta;
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
    const project = await Project.findOne({_id:ctx.params.id, owner: user._id}).exec();
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
        connetorIndexes: [],
        owner: user._id,
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
    const projectCount = await Project.countDocuments({_id:id, owner: {$ne:user._id}}).exec();
    if (projectCount>0) {
      ctx.throw(401, 'unable to modify projects of other users');
    }
    const {name, parts, connectorIndexes} = ctx.request.body;
    
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
      connectorIndexes: project.connectorIndexes,
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
      project.connectorIndexes = connectorIndexes;
      project.updatedAt= now;
      project.save();
      ctx.body = {message:'OK', project};
    } else {
      project.name = name;
      project.parts = parts;
      project.connectorIndexes = connectorIndexes;
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

router.delete('/api/project/:id/history/:index',
userMust(beAnyOne, beUser, beGuest),
async (ctx:Ctx, next:Next)=> {
  const {id, index} = ctx.params;
  const {time} = ctx.request.query;
  const project = await Project.findById(id).exec();
  const history = project.history[index]
  if(history && history.updatedAt.getTime()===new Date(time).getTime()) {
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
    form.permission = 666;
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
      {owner: userId},
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
      {owner: userId},
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

// -----------------------------------------------------------------------------------------------
router.post('/api/plateDefinition',
userMust(beUser, beAdmin),
async (ctx:Ctx, next:Next)=> {
  const userId = ctx.state.user._id;
  if(!ctx.request.body) {
    ctx.throw(403);
  }
  console.log(ctx.request.body);
  if (!ctx.request.body.owner) {
    ctx.request.body.owner = userId;
  }
  if(beAdmin(ctx) && userId !== ctx.request.body.owner) {
    ctx.throw(401, 'cannot set owner to others');
  }
  await next();
},
async (ctx:Ctx, next:Next)=> {
  const {owner, group, permission, plateType, name, barcode, parts} = ctx.request.body;
  const now = new Date();
  console.log('create plate');
  const partsCount = await PartDefinition.find({_id:parts}).countDocuments().exec();
  const uniquePartSize = new Set(parts).size;
  console.log('partsCount', partsCount, uniquePartSize);
  if (partsCount < uniquePartSize) {
    ctx.throw(404, 'some part not found in database');
  }
  ctx.body = await PlateDefinition.create({
    owner,
    group,
    createdAt: now,
    updatedAt: now,
    permission,
    plateType,
    name,
    barcode,
    parts,
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
router.get('/graphql',
async (ctx:Ctx, next:Next)=> {
  await graphqlKoa({schema: GraphqlSchema})(ctx, next);
});
router.post('/graphql',
async (ctx:Ctx, next:Next)=> {
  await graphqlKoa({schema: GraphqlSchema})(ctx, next);
});

router.get('/graphiql', 
async (ctx:Ctx, next:Next)=> {
  await graphiqlKoa({endpointURL: '/graphql'})(ctx)
}
);



// -----------------------------------------------------------------------------------------------

app.use(router.routes());
app.listen(8000, '0.0.0.0');
log4js.getLogger().info('start listening at 8000');
