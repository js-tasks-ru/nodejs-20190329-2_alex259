const Koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');

const User = require('./models/User');
const NotFoundError = require('./error404');
const InvalidIdError = require('./error400');

const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = { error: err.message };
    } else if (err.name === "ValidationError") {
      ctx.status = 400;
      let msg = { errors: {} };
      for(let field in err.errors) {
        msg.errors[field] = err.errors[field].message;
      }
      ctx.body = msg;
    } else {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  }
});

const router = new Router();

router.get('/users', async (ctx) => {
  let users = await User.find({}).exec();
  ctx.body = users;
});

router.get('/users/:id', async (ctx) => {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) throw new InvalidIdError; 

  let user = await User.findById(ctx.params.id).exec();
  if (!user) {
    throw new NotFoundError; 
  } else {
    ctx.body = user;
  }
});

router.patch('/users/:id', async (ctx) => {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) throw new InvalidIdError; 
  
  let newUser = {};
  if (ctx.request.body.email) newUser.email = ctx.request.body.email;
  if (ctx.request.body.displayName) newUser.displayName = ctx.request.body.displayName;

  let res = await User.update({_id: ctx.params.id}, newUser, {runValidators: true}).exec();

  if (res.n === 0) {
    throw new NotFoundError;
  } else {
    ctx.body = await User.findById(ctx.params.id).exec();
  }
});

router.post('/users', async (ctx) => {
  let users = await User.create({email: ctx.request.body.email, displayName: ctx.request.body.displayName});
  ctx.body = users;
});

router.delete('/users/:id', async (ctx) => {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) throw new InvalidIdError; 
  let res = await User.deleteOne({_id: ctx.params.id}).exec();
  if (res.n === 0) {
    throw new NotFoundError; 
  } else {
    ctx.body = "ok";
  }  
});

app.use(router.routes());

module.exports = app;
