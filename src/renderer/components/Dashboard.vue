<template>
  <div class="dashboard">
    <div class="columns is-mobile main" style="height: 60vh">
      <div class="column is-4">
      </div>
      <div class="column is-4 text-center" v-if="server">
        <p class="title">
          {{ server.remark }}
          <span class="tag"
                :class="started ? 'is-success' : 'is-danger'">{{ started ? 'connected' : 'unconnected' | lang
            }}</span>
          <span class="tag" :class="delayClass">{{ server.delay === false ? 'timeout' :  server.delay + 'ms' }}</span>
        </p>
        <p class="subtitle">
          {{ server.address }}
        </p>
      </div>
      <button v-if="server" @click="started = !started" class="switch-btn button" :class="started ? 'is-danger' : 'is-success'">
        {{ started ? 'close' : 'open' | lang }}
      </button>
    </div>
    <div class="logs text-center">
      <p v-for="l in logs">{{ l }}</p>
    </div>
  </div>
</template>
<script>
  import { delayClass } from '../../utils'
  import { mapGetters } from 'vuex'
  export default {
    data () {
      return {
        s: false,
        logs: []
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
        server: 'currentServer'
      })
    },
    methods: {},
    mounted () {
      this.$require('v2ray.started', started => this.s = started)
      this.$require('v2ray.log', l => {
        if (this.logs.length > 30) {
          this.logs.shift()
        }
        this.logs.push(l)
      })
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
</style>
