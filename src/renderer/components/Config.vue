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
      <input required class="input" v-model="config.port" type="number" :placeholder="'socks5_port' | lang ">
    </div>
  </div>
  <div class="field">
    <button class="button is-info" :disabled="!canSave">{{ 'save' | lang }}</button>
  </div>
</div>
</template>

<script>
  export default {
    data () {
      return {
        config: {
          listen: '127.0.0.1',
          port: 3080
        }
      }
    },
    computed:{
      canSave(){
        return this.config.listen && this.config.port
      }
    },
    components: {},
    methods: {},
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
