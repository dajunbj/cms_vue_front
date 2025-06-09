// src/store/index.js

import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      planCode: 'basic' // デフォルトプラン
    }
  },
  mutations: {
    setPlanCode(state, code) {
      state.planCode = code
    }
  }
})
