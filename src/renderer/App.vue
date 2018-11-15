<template>
  <div id="app">
    <div class="tabs">
      <ul>
        <router-link to='/' tag='li' :class="$route.path === '/' ? 'is-active' : ''"><a>
          <i data-eva="home-outline" data-eva-fill="#8484f5" data-eva-height="16"></i>
          {{ 'dashboard' | lang }}</a></router-link>
        <router-link to='/servers' tag='li' :class="$route.path === '/servers' ? 'is-active' : ''">
        <a>
        <i data-eva="hard-drive-outline" data-eva-fill="#8484f5" data-eva-height="16"></i>
          {{ 'servers' | lang }}</a></router-link>
        <router-link to='/config' tag='li' :class="$route.path === '/config' ? 'is-active' : ''"><a>
          <i data-eva="options-outline" data-eva-fill="#8484f5" data-eva-height="16"></i>
          {{ 'config' | lang }}</a></router-link>
      </ul>
    </div>
    <div class="content-wrap">
     <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import {mapActions} from 'vuex'
  export default {
    name: 'v2ray-app',
    methods:{
      ...mapActions({
        setCurrentServer: 'setCurrentServer'
      })
    },
    mounted(){
      this.$require('v2ray.server', srv => {
        this.setCurrentServer(srv)
      })
      this.$eva.replace()
    }
  }
</script>

<style lang="sass">
  @import "assets/style/app"
  /* CSS */
  #app
    background-color: white
</style>
