import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    planCode: 'basic'  //デフォルトプラン
  },
  mutations: {
    setPlanCode(state, code) {
      state.planCode = code
    }
  }
})
