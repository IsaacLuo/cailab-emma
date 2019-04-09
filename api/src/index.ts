import { ICustomState } from './types';
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

router.get('/api/project/:uuid', async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const user = ctx.state.user;
  
  if (user) {
    const project = await Project.findOne({_uuid:ctx.query.uuid, owner: user._id}).exec();
    if (!project) {
      ctx.throw(404);
    }
    ctx.body = project;
  } else {
    ctx.throw(401);
  }
});

router.put('/api/project/:uuid', async (ctx:koa.ParameterizedContext<ICustomState, {}>, next:()=>Promise<any>)=> {
  const user = ctx.state.user;
  if (user) {
    const projectCount = await Project.countDocuments({_uuid:ctx.query.uuid, owner: {$ne:user._id}}).exec();
    if (projectCount>0) {
      ctx.throw(401, 'unable to modify others project');
    }
    await Project.updateOne({_uuid:ctx.query.uuid}, ctx.request.body, {upsert:true});
    ctx.body = {message:'OK'};
  } else {
    ctx.throw(401);
  }
});


app.use(router.routes());
app.listen(8000, '0.0.0.0');
log4js.getLogger().info('start listening at 8000');
