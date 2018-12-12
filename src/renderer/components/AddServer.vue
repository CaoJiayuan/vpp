<template>
  <div class="card add-srv">
    <div class="srv-content" @click="open({
          users: [],
          options: {
            network: 'tcp'
          }
        })">
      <i class="add-icon" data-eva="plus-circle-outline" data-eva-fill="#8484f5" data-eva-height="32"></i>
      <span>{{ 'add_server' | lang }}</span>
    </div>
    <modal :active="modal">
      <div class="modal-content">
        <div class="card">
          <div class="card-content">
            <div class="field">
              <label class="label is-normal">{{ 'address' | lang }}*</label>
              <div class="control">
                <input required class="input" v-model="serv.address" type="text" :placeholder="'address' | lang ">
              </div>
            </div>

            <div class="field">
              <label class="label">{{ 'port' | lang }}*</label>
              <div class="control">
                <input required class="input" type="number" v-model="serv.port" :placeholder="'port' | lang ">
              </div>
            </div>
            <div class="field">
              <label class="label">{{ 'remark' | lang }}</label>
              <div class="control">
                <input class="input" type="text" v-model="serv.remark" :placeholder="'remark' | lang ">
              </div>
            </div>
            <div class="field is-horizontal">
              <label class="label is-normal">{{ 'users' | lang }}*</label>
              <div class="field-body" style="padding: 0 20px">
                <div class="control">
                  <div class="select is-multiple">
                    <select v-model="serv.users" multiple size="5" v-if="users.length > 0">
                      <option :value="u.id" v-for="u in users">{{ u.remark ? u.remark : u.uuid }}</option>
                    </select>
                  </div>
                  <i data-eva="plus-circle-outline" data-eva-fill="#8484f5" data-eva-height="32"></i>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">
                <a href="#" @click="advance = !advance">
                  <font-awesome-icon :icon="advance ? 'angle-down': 'angle-right'" ></font-awesome-icon>
                  {{ 'advances' | lang }}
                </a>
              </label>
            </div>
            <transition name="fade">
              <template v-if="advance">
                <div>
                  <div class="field is-horizontal">
                    <label class="label">
                      {{ 'security' | lang }}
                    </label>
                    <div class="field-body" style="padding: 0 20px">
                      <div class="control">
                        <div class="select is-multiple">
                          <select v-model="serv.options.security">
                            <option :value="undefined">none</option>
                            <option value="tls" >TLS</option>
                          </select>
                        </div>
                        <label style="margin-left: 20px" class="checkbox" v-if="serv.options.security == 'tls'">
                          <input type="checkbox" v-model="serv.options.allowInsecure">
                          Allow insecure
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <label class="label">
                      {{ 'network' | lang }}
                    </label>
                    <div class="field-body" style="padding: 0 20px">
                      <div class="control">
                        <div class="select is-multiple">
                          <select v-model="serv.options.network">
                            <option value="tcp" >tcp</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </transition>
          </div>
          <footer class="card-footer">
            <a class="card-footer-item" @click="modal = false">{{ 'cancel' | lang }}</a>
            <a class="card-footer-item" :class="canSave ? '' : 'is-disabled'" @click="save">{{ 'save' | lang }}</a>
          </footer>
        </div>
      </div>
    </modal>

  </div>

</template>

<script>
  import { ipcRenderer } from 'electron'
  import Modal from './Modal.vue'

  const _ = require('lodash')

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
          users: [],
          options: {
            network: 'tcp'
          }
        },
        users: [],
        advance: false
      }
    },
    components: {Modal},
    computed:{
      canSave(){
        return this.serv.address && this.serv.port && this.serv.users.length > 0;
      }
    },
    methods: {
      save () {
        if (this.canSave) {
          this.serv.port = parseInt(this.serv.port)
          ipcRenderer.send('v2ray.add', this.serv)
          this.modal = false
        }
      },
      open (server) {
        if (server) {
          this.serv = _.clone(server)
          this.serv.options = this.serv.options || {
            network: 'tcp'
          }
        }
        this.modal = true
      },
      isSelected(u) {
        let ids = this.serv.users.map(u => u.id)

        return ids.indexOf(u.id) > -1
      }
    },
    mounted () {

    },
    created () {
      this.$require('v2ray.users', users => this.users = users)
    },

  }
</script>
