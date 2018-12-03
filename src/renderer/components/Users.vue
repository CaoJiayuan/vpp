<template>
<div class="container">
  <div class="buttons has-addons is-right">
    <add-user ref="add"></add-user>
    <button @click="$refs.add.open(user)" class="button is-primary" :disabled="user.id === undefined">
      {{ 'edit' | lang }}
    </button>
    <button class="button is-danger" @click="remove(user)" :disabled="user.id === undefined || !user.deleteable">
      {{ 'delete' | lang }}
    </button>
  </div>
  <table class="table wrapper">
    <thead>
    <tr>
      <th>{{ 'id' | lang }}</th>
      <th>{{ 'remark' | lang }}</th>
      <th>{{ 'alterId' | lang }}</th>
      <th>{{ 'security' | lang }}</th>
    </tr>
    </thead>
    <tbody>
    <tr @click="select(u)" :class="user.id === u.id ? 'is-selected' : ''" v-for="u in users">
      <td>{{ u.uuid ? u.uuid : u.id }}</td>
      <td>{{ u.remark }}</td>
      <td>{{ u.alterId }}</td>
      <td>{{ u.security }}</td>
    </tr>
    </tbody>
  </table>
</div>
</template>

<script>
  import AddUser from './AddUser.vue'
  import { lang } from '../../lang'

  export default {
    data () {
      return {
        users: [],
        user: {}
      }
    },
    components: {AddUser},
    methods: {
      select(u) {
        if (u.id === this.user.id) {
          this.user = {}
        } else  {
          this.user = u
        }
      },
      remove({id}) {
        if (confirm(lang('delete_user') + '?')) {
          this.$ipc.send('users.remove', id)
        }
      }
    },
    mounted () {

    },
    created () {
      this.$require('v2ray.users', users => this.users = users)
    },

  }
</script>
