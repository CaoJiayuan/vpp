<template>
  <div class="add-user">
    <button class="button is-info" @click="modal = true">
      {{ 'add' | lang }}
    </button>
    <modal :active="modal">
      <div class="modal-content">
        <div class="card">
          <div class="card-content">
            <div class="field">
              <label class="label is-normal">{{ 'id' | lang }}*</label>
              <div class="control">
                <input required class="input" v-model="user.uuid" type="text" :placeholder="'id' | lang ">
              </div>
            </div>
            <div class="field">
              <label class="label is-normal">{{ 'remark' | lang }}</label>
              <div class="control">
                <input required class="input" v-model="user.remark" type="text" :placeholder="'remark' | lang ">
              </div>
            </div>
            <div class="field">
              <label class="label is-normal">{{ 'alterId' | lang }}</label>
              <div class="control">
                <input required class="input" v-model="user.alterId" type="text" :placeholder="'alterId' | lang ">
              </div>
            </div>
            <div class="field">
              <label class="label is-normal">{{ 'level' | lang }}</label>
              <div class="control">
                <input required class="input" v-model="user.level" type="text" :placeholder="'level' | lang ">
              </div>
            </div>
            <div class="field">
              <label class="label is-normal">{{ 'security' | lang }}</label>
              <div class="control">
                <div class="select">
                  <select v-model="user.security">
                    <option value="auto">auto</option>
                  </select>
                </div>
              </div>
            </div>

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
  import Modal from './Modal.vue'
  import { ipcRenderer } from 'electron'
  const _ = require('lodash')

  export default {
    name: 'add-user',
    data () {
      return {
        modal: false,
        user: {
          security: 'auto',
        }
      }
    },
    computed: {
      canSave () {
        return !!this.user.uuid
      }
    },
    components: {Modal},
    methods: {
      save () {
        if (this.canSave) {
          this.user.alterId = parseInt(this.user.alterId)
          ipcRenderer.send('users.add', this.user)
          this.modal = false
        }
      },
      open (user) {
        if (user) {
          this.user = _.clone(user)
        }
        this.modal = true
      }
    },
    mounted () {

    },
    created () {

    },

  }
</script>
