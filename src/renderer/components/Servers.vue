<template>
  <div class="servers">
    <div class="columns is-multiline is-mobile">
      <template v-for="(srv,index) in servers">
        <div class="column is-one-quarter srv">
          <div class="card" :class="server.id == srv.id ? 'active' : ''">
            <div class="srv-content">
              <h2>{{ srv.remark }} <span class="tag" :class="delayClass(srv)">{{ !srv.delay ? 'timeout' :  srv.delay + 'ms'  | lang}}</span></h2>
              <small>
                {{ srv.address }}
              </small>

              <font-awesome-icon @click="$refs.add.open(srv)" class="edit" icon="edit" style="color: #8484f5;"></font-awesome-icon>
              <font-awesome-icon @click="deleteSrv(srv)" class="trash" icon="trash" style="color: #f54f51;"></font-awesome-icon>
            </div>
          </div>
        </div>
      </template>
      <div class="column is-one-quarter srv">
        <add-server ref="add" :server="serv"></add-server>
      </div>
    </div>

  </div>
</template>

<script>
  import { delayClass } from '../../utils'
  import { mapGetters } from 'vuex'
  import { lang } from '../../lang'
  import AddServer from './AddServer.vue'
  import {ipcRenderer} from 'electron'

  export default {
    data () {
      return {
        servers: [],
        serv: null,
        model: false,
        users: []
      }
    },
    components: {AddServer},
    computed:{
      ...mapGetters({
        server: 'currentServer'
      })
    },
    methods: {
      delayClass (server) {
        return delayClass(server)
      },
      select(srv){
        this.$ipc.send('v2ray.select', srv)
      },
      deleteSrv(srv) {
        if (confirm(lang('delete_server') + '?')) {
          ipcRenderer.send('v2ray.delete', srv.id)
        }
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.$eva.replace()

      })
    },
    created () {
      this.$require('v2ray.servers', srvs => {
        this.servers = srvs
      })
    },

  }
</script>
<style lang="sass">
  .servers
    .srv
      overflow: hidden
      .active
        background-color: #62bddf
    .srv-content
      padding: 10px 8px
      position: relative
      .edit
        position: absolute
        right: 26px
        top: 6px
        cursor: pointer
      .trash
        position: absolute
        right: 6px
        top: 6px
        cursor: pointer
      h2
        font-weight: bold
        font-size: 24px
        .tag
          height: 16px
          padding: 0 3px
  .add-srv
    cursor: pointer
    span
      line-height: 60px
      padding-left: 40px
    .add-icon
      position: absolute
      left: 20px
      top: 24px
</style>
