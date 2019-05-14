const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const uuid = require('uuid/v4');
const Router = require('koa-router');
const config = require('./config');
const passport = require('./libs/passport');
const handleMongooseValidationError = require('./libs/validationErrors');
const User = require('./models/User');
const sendMail = require('./libs/sendMail');

const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else if (err.name === "ValidationError") {
      ctx.status = 400;
      let msg = { errors: {} };
      for(let field in err.errors) {
        msg.errors[field] = err.errors[field].message;
      }
      ctx.body = msg;
    } else {
      console.error(err);
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

const router = new Router({prefix: '/api'});

router.post('/login', async (ctx, next) => {
  await passport.authenticate('local', async (err, user, info) => {
    if (err) throw err;

    if (!user) {
      ctx.status = 400;
      ctx.body = {error: info};
      return;
    }

    const token = uuid();

    ctx.body = {token};
  })(ctx, next);
});

router.get('/oauth/:provider', async (ctx, next) => {
  const provider = ctx.params.provider;

  await passport.authenticate(
      provider,
      config.providers[provider].options,
  )(ctx, next);

  ctx.status = 200;
  ctx.body = {status: 'ok', location: ctx.response.get('location')};
});

router.post('/oauth_callback', handleMongooseValidationError, async (ctx, next) => {
  const provider = ctx.request.body.provider;

  await passport.authenticate(provider, async (err, user, info) => {
    if (err) throw err;

    if (!user) {
      ctx.status = 400;
      ctx.body = {error: info};
      return;
    }

    const token = uuid();

    ctx.body = {token};
  })(ctx, next);
});

router.post('/register', async (ctx, next) => {
  let token = uuid();
  let user = new User({
    email: ctx.request.body.email, 
    displayName: ctx.request.body.displayName,
    verificationToken: token,
  });
  await user.setPassword(ctx.request.body.password);  
  await user.save();

  await sendMail({
    template: 'confirmation',
    locals: {token: token},
    to: ctx.request.body.email,
    subject: 'Подтвердите почту',
  });

  ctx.status = 200;
  ctx.body = {status: 'ok'};
});

router.post('/confirm', async (ctx) => {
  let user = await User.findOne({verificationToken: ctx.request.body.verificationToken});

  if (user) {
    user.verificationToken = undefined;
    await user.save();

    const token = uuid();
    ctx.body = {token};

  } else {
    ctx.status = 400;
    ctx.body = {error: "Ссылка подтверждения недействительна или устарела"};
  }  
});

app.use(router.routes());

// this for HTML5 history in browser
const index = fs.readFileSync(path.join(__dirname, 'public/index.html'));
app.use(async (ctx, next) => {
  if (!ctx.url.startsWith('/api')) {
    ctx.set('content-type', 'text/html');
    ctx.body = index;
  }
});

module.exports = app;
