// src/store/index.js

import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      planCode: 'basic', // デフォルトプラン
      userRole: 'employee'   // デフォルトユーザ
    }
  },
  mutations: {
    setPlanCode(state, code) {
      state.planCode = code
    },
    setUserRole(state, role) {
      state.userRole = role
    }
  }
})
