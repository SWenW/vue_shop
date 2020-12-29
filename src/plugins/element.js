import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 把message挂载在Vue组件上， 每个组件都能通过this访问Message
Vue.prototype.$message = Message
