import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: 'login' },// 表示访问的是根目录的时候重定向到login
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const index = new VueRouter({
  routes
})

// 挂载路由守卫导航，得判断有了token才能访问特殊页面
index.beforeEach((to, from, next)=> {
  // to将要访问的路径 from从哪个路径跳转而来 next是一个函数表示放行
  // 1. 访问登录页，直接放行
  if(to.path === '/login') return next();
  // 2. 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  // 3. 如果token不存在，跳转回login页面
  if(!tokenStr) return next('/login');
  // 4. 如果存在，直接放行
  next();
})

export default index
