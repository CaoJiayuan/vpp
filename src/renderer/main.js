import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import { lang } from '../lang'
import { ipcRenderer } from 'electron'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown, faAngleRight, faEdit, faTrash, faLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faEdit, faTrash, faAngleDown, faAngleRight, faLink)
const eva = require('eva-icons')
Vue.component('font-awesome-icon', FontAwesomeIcon)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.prototype.$ipc = ipcRenderer
Vue.prototype.$eva = eva

Vue.prototype.$require = (channel, on, ...args) => {
  ipcRenderer.removeAllListeners(channel)

  ipcRenderer.on(channel, (e, data) => {
    on && on(data)
  })
  ipcRenderer.send(channel, ...args)
}
ipcRenderer.on('navigate', (e, to) => {
  router.push(to)
})

Vue.filter('lang', lang)

/* eslint-disable no-new */
new Vue({
  components: {App},
  router,
  store,
  template: '<App/>'
}).$mount('#app')
