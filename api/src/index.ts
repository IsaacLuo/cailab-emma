import { ICustomState, IProject } from './types';
import koa from 'koa';
import koaBody from 'koa-body';
import middleware from './middleware'
import Router from 'koa-router';
import log4js from 'log4js';
import conf from '../conf';
import crypto from 'crypto';
import {Project} from './models';
import jwt from 'jsonwebtoken';
import cors from 'koa-cors';

const GUEST_ID = '000000000000000000000000';

const app = new koa();
const router = new Router();

app.use(cors({credentials: true}));
app.use(koaBody());
middleware(app);

function userMust (...args: Array<(ctx:koa.ParameterizedContext<any, {}>, next:()=>Promise<any>)=>boolean>) {
  const arg = arguments;
  return async (ctx:koa.ParameterizedContext<any, {}>, next:()=>Promise<any>)=> {
    if (Array.prototype.some.call(arg, f=>f(ctx))) {
      await next();
    } else {
      ctx.throw(401);
    }
  };
}

function beUser (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>) {
  // console.log(ctx.state.user.groups);
  return ctx.state.user && (ctx.state.user.groups.indexOf('emma/users')>=0 || ctx.state.user.groups.indexOf('users')>=0);
  // return ctx.state.user!== undefined;
}

function beAnyOne (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>) {
  // console.log(ctx.state.user.groups);
  // return ctx.state.user && (ctx.state.user.groups.indexOf('emma/users')>=0 || ctx.state.user.groups.indexOf('users')>=0);
  return ctx.state.user!== undefined;
}

function beAdmin (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>) {
  return ctx.state.user && (ctx.state.user.groups.indexOf('administrators')>=0 || ctx.state.user.groups.indexOf('emma/administrators')>=0);
}

function beGuest (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>) {
  return ctx.state.user === undefined || ctx.state.user._id === '000000000000000000000000';
}

router.get('/', async (ctx:koa.ParameterizedContext<any, {}>)=> {
  ctx.body={message:'server: cailab-emma'};
})

router.get('/api/user/current', async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const user = ctx.state.user;
  ctx.body = {message:'OK', user,};
  if (user) {
    const now = Math.floor(Date.now() / 1000);
    const eta = ctx.state.user.exp - now;
    ctx.body.eta = eta;
  }
});

router.get('/api/projects/', 
async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const user = ctx.state.user;
  if (user._id === '000000000000000000000000') {
    ctx.body = [];
  } else {
    await next();
  }
},
userMust(beAnyOne, beUser),
async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const user = ctx.state.user;
  if (user) {
    const projects = await Project.find({owner: user._id}).select('_id name createdAt updatedAt').exec();
    ctx.body = projects;
  } else {
    ctx.throw(401);
  }
});

router.get('/api/project/:id',
userMust(beAnyOne, beUser, beGuest),
async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
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
async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
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
async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
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
async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
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
async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const res = await Project.deleteMany({owner: GUEST_ID, updatedAt:{$lt: new Date(Date.now()-172800000)}}).exec();
  console.log('guest project deleted', res.n, res.ok);
}
);

router.delete('/api/project/:id/history/:index',
userMust(beAnyOne, beUser, beGuest),
async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
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


app.use(router.routes());
app.listen(8000, '0.0.0.0');
log4js.getLogger().info('start listening at 8000');
