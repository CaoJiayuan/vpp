<template>
  <div id="app">
    <div class="tabs">
      <ul>
        <li class="is-active"><a>{{ 'dashboard' | lang }}</a></li>
        <li><a>Music</a></li>
        <li><a>Videos</a></li>
        <li><a>Documents</a></li>
      </ul>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'v2ray-app'
  }
</script>

<style lang="sass">
  @import "assets/style/app"
  /* CSS */
</style>
