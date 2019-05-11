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

const app = new koa();
const router = new Router();

app.use(cors({credentials: true}));
app.use(koaBody());
middleware(app);

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

router.get('/api/projects/', async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const user = ctx.state.user;
  if (user) {
    const project = await Project.find({owner: user._id}).exec();
    ctx.body = project;
  } else {
    ctx.throw(401);
  }
});

router.get('/api/project/:id', async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
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

router.post('/api/project', async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const user = ctx.state.user;
  if (user) {
    const name = ctx.request.body.name;
    const now = new Date();
    const project = await Project.create(
      {
        name,
        version: '1.0',
        parts: [],
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

router.put('/api/project/:id', async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const user = ctx.state.user;
  if (user) {
    const now = new Date();
    const projectCount = await Project.countDocuments({_id:ctx.query.id, owner: {$ne:user._id}}).exec();
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
    project.history.unshift(projectHistory);
    project.history = project.history.slice(0,100);
    // save original to history
    project.name = name;
    project.parts = parts;
    project.connectorIndexes = connectorIndexes;
    project.updatedAt= now;
    project.save();
    ctx.body = {message:'OK', project};
  } else {
    ctx.throw(401);
  }
});


app.use(router.routes());
app.listen(8000, '0.0.0.0');
log4js.getLogger().info('start listening at 8000');
