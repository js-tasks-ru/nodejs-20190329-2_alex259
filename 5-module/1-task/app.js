const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = {};

router.get('/subscribe', async (ctx, next) => {

    let id = ctx.request.query.r || Math.random();

    subscribers[id] = {};
    subscribers[id].promise = new Promise((resolve, reject) => {
        subscribers[id].resolve = resolve;
    });
    let msg = await subscribers[id].promise;
    ctx.body = msg;
});

router.post('/publish', async (ctx, next) => {
    
    let message = ctx.request.body.message;

    if (message) {
        for(let id in subscribers) {
            subscribers[id].resolve(message);
        }

        subscribers = {};
    }

    ctx.body = "";
});

app.use(router.routes());

module.exports = app;
