const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const app = new Koa()
app.use(async ctx => {
    const { url, query } = ctx.request
    console.log('url: ', url)

    // / => index.html
    if (url === '/') {
        ctx.type = 'text/html'
        const content = fs.readFileSync('./index.html')
        ctx.body = content
    }
    // *.js => src/*.js
    else if (url.endsWith('.js')) {
        const p = path.resolve(__dirname, url.slice(1))
        const content = fs.readFileSync(p, 'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = content
    }

})

app.listen(3000, () => {
    console.log('vite starts at 3000')
})