import Vue from 'vue'
import App from './App.vue'
import index from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// 配置axios，每个Vue的组件都能通过this直接访问http从而发起网络请求
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router: index,
  render: h => h(App)
}).$mount('#app')
