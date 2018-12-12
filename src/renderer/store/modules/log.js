const MAX = 50

const state = {
  logs: []
}

const getters = {
  logs: state => state.logs
}

const mutations = {
  APPEND_LOG(state, log) {
    if (state.logs.length > MAX) {
      state.logs.shift()
    }
    state.logs.push(log)
  },
  CLEAN_LOGS(state){
    state.logs = []
  }
}


const actions = {
  pushLog({commit}, log) {
    commit('APPEND_LOG', log)
  },
  cleanLogs({commit}) {
    commit('CLEAN_LOGS')
  }
}


export default {
  state,
  getters,
  actions,
  mutations
}
