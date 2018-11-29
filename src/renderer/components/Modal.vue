<template>
  <div class="modal" :class="modal ? 'is-active': ''">
    <div class="modal-background"></div>
    <transition :name="transition">
      <template v-if="active">
        <slot></slot>
      </template>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'modal',
    props: {
      active: Boolean,
      transition: {
        type: String,
        default: 'fade-down'
      }
    },
    data () {
      return {
        modal: false
      }
    },
    components: {},
    methods: {},
    mounted () {

    },
    created () {

    },
    watch:{
      active(now) {
        if (!now) {
          setTimeout(() => this.modal = now, 300)
        } else  {
          this.modal = now
        }
      }
    }
  }
</script>
