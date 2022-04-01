const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const compilerSfc = require('@vue/compiler-sfc')
const compilerDom = require('@vue/compiler-dom')
const app = new Koa()
app.use(async ctx => {
    const { url, query } = ctx.request
    console.log('url: ', url)

    // / => index.html
    if (url === '/') {
        ctx.type = 'text/html'
        let content = fs.readFileSync('./index.html', 'utf-8')
        // 入口文件加入环境变量
        content = content.replace('<script',
            `
        <script>
            window.process = {env: {NODE_ENV: 'dev'}}
        </script>
        <script
        `)
        ctx.body = content
    }
    // *.js => src/*.js
    else if (url.endsWith('.js')) {
        const p = path.resolve(__dirname, url.slice(1))
        const content = fs.readFileSync(p, 'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = rewriteImport(content)
    }
    else if (url.startsWith('/@modules')) {
        const prefix = path.resolve(
            __dirname,
            'node_modules',
            url.replace('/@modules/', '')
        )

        // 读取package.json的module属性
        const module = require(prefix + '/package.json').module

        const p = path.resolve(prefix, module)
        const ret = fs.readFileSync(p, 'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = rewriteImport(ret)
    }

    //  支持SFC组件 单文件组件
    // *.vue => template script （compiler-sfc）
    // template => render函数 （compiler-dom）
    else if (url.includes('.vue')) {
        const p = path.resolve(__dirname, url.split('?')[0].slice(1))
        const { descriptor } = compilerSfc.parse(fs.readFileSync(p, 'utf-8'))
        if (!query.type) {// descriptor => js + template 生成render部分
            ctx.type = 'application/javascript'
            ctx.body = `
                ${rewriteImport(
                descriptor.script.content.replace('export default', 'const __script = ')
            )}
                import {render as __render} from "${url}?type=template"
                __script.render = __render
                export default __script
                `
        } else {
            const template = descriptor.template
            const render = compilerDom.compile(template.content, { mode: 'module' })
            ctx.type = 'application/javascript'
            ctx.body = rewriteImport(render.code)
        }
    }

    // 第三方库支持
    // 需要改写 欺骗一下浏览器 'vue' => '/@modules/vue => 别名
    // from 'xxx'
    function rewriteImport(content) {
        // 正则
        return content.replace(/ from ['|"]([^'"]+)['|"]/g, function (s0, s1) {
            if (s1[0] !== '.' && s1[1] !== '/') {
                // 是不是不是一个绝对路径或者相对路径 / 或 ../ ./
                return ` from '/@modules/${s1}'`
            } else {
                return s0
            }
        })
    }
})

app.listen(3000, () => {
    console.log('vite starts at 3000')
})