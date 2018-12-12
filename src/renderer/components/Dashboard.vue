<template>
  <div class="dashboard">
    <div class="columns is-mobile main" style="height: 60vh;align-content: center">
      <template v-if="installed">
        <div class="column is-4 is-offset-4 text-center" v-if="server">
          <div class="card">
            <div class="card-content">
              <p class="title">
                {{ server.remark }}
                <span class="tag"
                      :class="started ? 'is-success' : 'is-danger'">{{ started ? 'connected' : 'unconnected' | lang
                  }}</span>
                <span class="tag" :class="delayClass" v-if="server.delay !== undefined">{{ server.delay === false ? 'timeout' :  server.delay + 'ms' | lang }}</span>
              </p>
              <p class="subtitle">
                {{ server.address }}
              </p>
            </div>
          </div>
        </div>
        <div class="column is-4 is-offset-4 text-center" v-if="!server">
          <div class="card">
            <div class="card-content">
              <p class="title">
                {{ 'unselect_server' | lang }}
              </p>
              <p class="subtitle" style="color: grey">
                {{ 'select_server_from_tray' | lang }}
              </p>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="column is-6 is-offset-3 text-center">
          <div class="card">
            <div class="card-content">
              <p class="title">
                {{ 'installing_core' | lang }}
              </p>
              <small style="color: grey;font-size: 12px">
                {{ state }}
                <a v-if="error" @click="$ipc.send('v2ray.install')">{{ 'reinstall' | lang }}</a>
              </small>
              <progress class="progress is-info" :value="progress" max="100"></progress>
            </div>
          </div>
        </div>
      </template>
      <button v-if="server && installed" @click="started = !started" class="switch-btn button" :class="started ? 'is-danger' : 'is-success'">
        {{ started ? 'close' : 'open' | lang }}
      </button>
    </div>
    <div class="logs text-center">
      <font-awesome-icon @click="cleanLogs" size="lg" class="trash" icon="trash" style="color: #ef8788;"></font-awesome-icon>
      <p v-for="l in logs">{{ l }}</p>
    </div>
  </div>
</template>
<script>
  import { delayClass } from '../../utils'
  import { mapGetters,mapActions } from 'vuex'
  import { lang } from '../../lang'
  export default {
    data () {
      return {
        s: false,
        installed: true,
        progress: 0,
        state: lang('downloading_core'),
        error: false
      }
    },
    computed: {
      started: {
        get () {
          return this.s
        },
        set (v) {
          v ? this.$ipc.send('start') : this.$ipc.send('stop')
          this.s = v
        }
      },
      delayClass () {
        return delayClass(this.server)
      },
      ...mapGetters({
        server: 'currentServer',
        logs: 'logs'
      })
    },
    methods: {
      ...mapActions({
        cleanLogs: 'cleanLogs'
      })
    },
    mounted () {
      this.$require('v2ray.started', started => this.s = started)
      this.$require('v2ray.installed', installed => this.installed = installed)
      this.$require('v2ray.progress', progress => this.progress = progress)
      this.$require('v2ray.install.state', state => this.state = state)
      this.$require('v2ray.install.error', error => this.error = error)
    }
  }
</script>
<style lang="sass">
  .switch-btn
    width: 96px
    height: 96px
    border-radius: 100%
    padding: 4px
    position: absolute
    left: 50%
    top: 50%
    transform: translate(-50%, -50%)

  .dashboard
    .main
      background-color: white
      position: relative
      z-index: 1
      box-shadow: 0 10px 24px white

  .logs
    text-align: center
    position: absolute
    bottom: 0
    width: 100%
    left: 0
    color: grey
    z-index: -1
    font-size: 12px
    &:hover .trash
      opacity: 1
    .trash
      position: absolute
      bottom: 16px
      right: 16px
      opacity: .6
      cursor: pointer

</style>
