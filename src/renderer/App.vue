<template>
  <div id="app">
    <div class="tabs main-tabs">
      <ul>
        <router-link :key="tab.path" :to='tab.path' tag='li' :class="$route.path === tab.path ? 'is-active' : ''" v-for="tab in tabs">
          <a>
            <i :data-eva="tab.icon" :data-eva-fill="iconColor" data-eva-height="16"></i>
            {{ tab.name }}
          </a>
        </router-link>

      </ul>
    </div>
    <div class="content-wrap">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'
  import { lang } from '../lang'

  export default {
    name: 'v2ray-app',
    data(){
      return {
        iconColor: '#bcdcf5',
        tabs: [
          {
            path: '/',
            icon: 'home-outline',
            name: lang('dashboard')
          },
          {
            path: '/servers',
            icon: 'hard-drive-outline',
            name: lang('servers')
          },
          {
            path: '/users',
            icon: 'people-outline',
            name: lang('users')
          },
          {
            path: '/config',
            icon: 'options-outline',
            name: lang('config')
          },
        ]
      }
    },
    methods: {
      ...mapActions({
        setCurrentServer: 'setCurrentServer'
      })
    },
    mounted () {
      this.$require('v2ray.server', srv => {
        this.setCurrentServer(srv)
      })
      this.$eva.replace()
    }
  }
</script>

<style lang="sass">
  @import "assets/style/app"
  @import "~@fortawesome/fontawesome-svg-core/styles.css"
  /* CSS */
  #app
    background-color: white
  .main-tabs
    box-shadow: 0 0 3px #afafaf
    .is-active svg
      fill: #6ea3ee
    ul
      border: none
</style>
