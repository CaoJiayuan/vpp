<template>
  <div class="card add-srv" >
    <div class="srv-content" @click="modal = true">
      <i class="add-icon" data-eva="plus-circle-outline" data-eva-fill="#8484f5" data-eva-height="32"></i>
      <span>{{ 'add_server' | lang }}</span>
    </div>

    <div class="modal" :class="modal ? 'is-active': ''">
      <div class="modal-background"></div>

      <div class="modal-content">
        <div class="card">
          <div class="card-content">
            <div class="field">
              <label class="label is-normal">{{ 'address' | lang  }}*</label>
              <div class="control">
                <input required class="input" v-model="serv.address" type="text" :placeholder="'address' | lang ">
              </div>
            </div>

            <div class="field">
              <label class="label">{{ 'port' | lang  }}*</label>
              <div class="control">
                <input required class="input" type="number" v-model="serv.port" :placeholder="'port' | lang ">
              </div>
            </div>
            <div class="field">
              <label class="label">{{ 'remark' | lang  }}</label>
              <div class="control">
                <input class="input" type="text" v-model="serv.remark" :placeholder="'remark' | lang ">
              </div>
            </div>
            <div class="field is-horizontal">
              <label class="label is-normal">{{ 'users' | lang  }}</label>
              <div class="field-body" style="padding: 0 20px">
                <div class="control">
                  <div class="select is-multiple">
                    <select v-model="serv.users" multiple size="5" v-if="users.length > 0">
                      <option :value="u" v-for="u in users">{{ u.remark ? u.remark : u.id }}</option>
                    </select>
                  </div>
                  <i data-eva="plus-circle-outline" data-eva-fill="#8484f5" data-eva-height="32"></i>
                </div>
              </div>
            </div>

          </div>
          <footer class="card-footer">
            <a class="card-footer-item" @click="modal = false">{{ 'cancel' | lang }}</a>
            <a class="card-footer-item" @click="save">{{ 'save' | lang }}</a>
          </footer>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import {ipcRenderer} from 'electron'

  export default {
    name: 'add-server',
    props: {
      server: {
        type: Object,
      }
    },
    data () {
      return {
        modal: false,
        serv: {
          users: []
        },
        users: []
      }
    },
    components: {},
    methods: {
      save(){
        this.serv.port = parseInt(this.serv.port)
        ipcRenderer.send('v2ray.add', this.serv)
        this.modal = false
      },
      open(server){
        if (server) {
          this.serv = server
        }
        this.modal = true
      }
    },
    mounted () {

    },
    created () {
      this.$require('v2ray.users', users => this.users = users)
    },

  }
</script>
