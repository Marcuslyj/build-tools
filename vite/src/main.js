// import { str } from './moduleA.js'
// console.log('vite...', str)

// 支持第三方库
import { createApp, h } from 'vue'

// const App = {
//     render() {
//         return h('div', null, 'hello hi')
//     }
// }

import App from './App.vue'

createApp(App).mount('#app')