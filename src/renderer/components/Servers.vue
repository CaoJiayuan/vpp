<template>
  <div class="servers">
    <div class="columns is-multiline is-mobile">
      <template v-for="(srv,index) in servers">
        <div class="column is-one-quarter srv">
          <div class="card" :class="server.id == srv.id ? 'active' : ''">
            <div class="srv-content">
              <h2>{{ srv.remark }} <span class="tag" :class="delayClass(srv)">{{ srv.delay === false ? 'timeout' :  srv.delay + 'ms'  | lang}}</span></h2>
              <small>
                {{ srv.address }}
              </small>
            </div>
          </div>
        </div>
      </template>
      <div class="column is-one-quarter srv">
        <div class="card add-srv">
          <div class="srv-content">
            <span><i data-eva="plus-circle-outline" data-eva-fill="#8484f5" data-eva-height="32"></i></span>
            {{ 'add_server' | lang }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { delayClass } from '../../utils'
  import { mapGetters } from 'vuex'

  export default {
    data () {
      return {
        servers: []
      }
    },
    components: {},
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
      }
    },
    mounted () {
      this.$eva.replace()

    },
    created () {
      this.$require('v2ray.servers', srvs => this.servers = srvs)

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
      h2
        font-weight: bold
        font-size: 24px
        .tag
          height: 16px
          padding: 0 3px
  .add-srv
    span
      font-size: 40px
      line-height: 60px
      padding: 0 5px 0 20px
    .srv-content
      line-height: 12px
</style>
