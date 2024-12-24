import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";


Vue.config.productionTip = false;
Vue.use(ElementUI);

Vue.use(ElementUI, { zIndex: 3000 });

import axios from 'axios';
// 设置 Axios 的基础 URL
axios.defaults.baseURL = 'http://localhost:8080'; // 替换为你的后端 URL
Vue.prototype.$axios = axios;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
