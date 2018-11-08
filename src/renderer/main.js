import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import {lang} from '../lang'
import {ipcRenderer} from 'electron'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.prototype.$ipc = ipcRenderer

Vue.prototype.$require = (channel, on, ...args) => {
    ipcRenderer.on(channel, (e, data) => {
      on && on(data)
    })
    ipcRenderer.send(channel, ...args)
}


Vue.filter('lang', lang)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
