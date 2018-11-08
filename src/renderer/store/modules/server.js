const state = {
  server: {
    current: {},
    items: []
  }
}

const getters = {
  server: state => state.server,
  currentServer : state => state.server.current,
  servers : state => state.server.items,
}

const mutations = {
  CHANGE_SERVERS (state, servers) {
    state.server.items = servers
  },
  CHANGE_CURRENT_SERVER (state, srv) {
    state.server.current = srv
  }
}

const actions = {
  setServers ({ commit }, servers) {
    // do something async
    commit('CHANGE_SERVERS', servers)
  },

  setCurrentServer({ commit }, server) {
    commit('CHANGE_CURRENT_SERVER', server)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
