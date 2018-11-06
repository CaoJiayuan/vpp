<template>
  <div id="wrapper">
    <main>
      <div>

      </div>
    </main>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'

  export default {
    name: 'home',
    methods: {
      start(){
        ipcRenderer.send('start')
      },
      stop(){
        ipcRenderer.send('stop')
      },
      addServer(){
        ipcRenderer.send('server.add', {
          "address": "svip22.mm1080p.rocks",
          "port": 10086,
          "users": [
            {
              "id": "7232abcd-05e8-4060-b0df-93797a664bc5",
              "alterId": 10,
              "security": "auto",
              "level": 0
            }
          ],
          "remark": "HK22"
        })
      },
    }
  }
</script>

<style>
    
</style>
