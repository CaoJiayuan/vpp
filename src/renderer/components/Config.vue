<template>
<div class="container config">
  <div class="field">
    <label class="label is-normal">{{ 'listen_address' | lang }}*</label>
    <div class="control">
      <input required class="input" v-model="config.listen" type="text" :placeholder="'listen_address' | lang ">
    </div>
  </div>
  <div class="field">
    <label class="label is-normal">{{ 'socks5_port' | lang }}*</label>
    <div class="control">
      <input required class="input" v-model="config.socks5_port" type="number" :placeholder="'socks5_port' | lang ">
    </div>
  </div>
  <div class="field">
    <label class="label is-normal">{{ 'http_port' | lang }}</label>
    <div class="control">
      <input required class="input" v-model="config.http_port" type="number" :placeholder="'http_port' | lang ">
    </div>
  </div>
  <div class="field">
    <button class="button is-info" :disabled="!canSave" @click="save">{{ 'save' | lang }}</button>
  </div>
</div>
</template>

<script>
  export default {
    data () {
      return {
        config: {
          listen: '127.0.0.1',
          socks5_port: 3080,
          http_port: 3087
        }
      }
    },
    computed:{
      canSave(){
        return this.config.listen && this.config.socks5_port
      }
    },
    components: {},
    methods: {
      save(){
        this.config.socks5_port = parseInt(this.config.socks5_port)
        this.config.http_port = parseInt(this.config.http_port)
        this.$ipc.send('config.save', this.config)
      }
    },
    mounted () {

    },
    created () {
      this.$require('v2ray.config', c => this.config = c)
    },
  }
</script>

<style lang="sass">
  .config
    width: 512px
</style>
