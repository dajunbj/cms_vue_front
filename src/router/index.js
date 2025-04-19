import Vue from "vue";
import Router from "vue-router";

import HomeView from "../views/HomeView.vue";
import EmployeeListView from "../views/employee/EmployeeListView.vue";
import SettingView from "../views/SettingView.vue";
import LoginView from "../views/LoginView.vue";
import EmployeeRegisterView from '@/views/employee/EmployeeRegisterView.vue'; // 新规画面
import ContractListView from "@/views/contract/ContractListView.vue";

import axios from 'axios';
import ContractRegisterView from "@/views/contract/ContractRegisterView.vue";
import CustomerView from "../views/customer/CustomerView.vue";
import CustomerRegisterView from "@/views/customer/CustomerRegisterView.vue";
import ResponsibleRegisterView from "@/views/customer/ResponsibleRegisterView.vue";

// import routesConfig from "./routesConfig";

Vue.use(Router);

// 全局Router定義
const router = new Router({
  mode: "history",
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "Login", component: LoginView },
    { path: "/home", name: "Home", component: HomeView, meta: { requiresAuth: true } },//当用户导航到某个路由时，Vue Router 会将该路由的 meta 数据绑定到导航守卫的 to 参数上
    { path: "/employee", name: "User", component: EmployeeListView, meta: { requiresAuth: true } },
    { path: "/employee/register", name: "User", component: EmployeeRegisterView, meta: { requiresAuth: true } },
    { path: "/setting", name: "Setting", component: SettingView, meta: { requiresAuth: true } },
    { path: "/employee/detail/:id", name: "EmployeeDetail",component: () => import("@/views/employee/EmployeeDetailView.vue")},
    { path: "/employee/edit/:id", name: "EmployeeEdit",component: () => import("@/views/employee/EmployeeEditView.vue")},

    { path: "/file/receipt", name: "ReceiptUpload",component: () => import("@/views/file/ReceiptUploadView.vue")},
    { path: "/contract", name: "Contract", component: ContractListView, meta: { requiresAuth: true } },
    { path: "/contract/register", name: "User", component: ContractRegisterView, meta: { requiresAuth: true } },
    { path: "/contract/register/:id", name: "Copy", component:() => import("@/views/contract/ContractRegisterView.vue") },
    { path: "/contract/edit/:id", name: "ContractEdit",component: () => import("@/views/contract/ContractEditView.vue")},
    { path: "/contract/detail/:id", name: "ContractDetail",component: () => import("@/views/contract/ContractDetailView.vue")},
    { path: "/customer", name: "Customer", component: CustomerView, meta: { requiresAuth: true } },
    { path: "/customer/register", name: "User", component: CustomerRegisterView, meta: { requiresAuth: true } },
    { path: "/customer/registerRes", name: "User", component: ResponsibleRegisterView, meta: { requiresAuth: true } },
    { path: "/customer/registerRes/:id", name: "User", component: ResponsibleRegisterView, meta: { requiresAuth: true } },
    { path: "/customer/edit/:id", name: "CustomerEdit",component: () => import("@/views/customer/CustomerEditView.vue")},
    { path: "/customer/detail/:id", name: "CustomerDetail",component: () => import("@/views/customer/CustomerDetailView.vue")},
    { path: "/customer/editRes/:id", name: "ResponsibleEdit",component: () => import("@/views/customer/ResponsibleEditView.vue")},
    { path: "/customer/detailRes/:id", name: "ResponsibleDetail",component: () => import("@/views/customer/ResponsibleDetailView.vue")},

    { path: "/attendance/listview", name: "AttendanceListView",component: () => import("@/views/attendance/AttendanceListView.vue")},
    { path: "/attendance/registview", name: "AttendanceRegistView",component: () => import("@/views/attendance/AttendanceRegistView.vue")},
  ],
});

// const router = new Router({
//   mode: "history",
//   routes: routesConfig,
// });

//全局Routerの追加
router.beforeEach((to, from, next) => {
  
  const token = sessionStorage.getItem("token");
  const tokenExpiration = sessionStorage.getItem("tokenExpiration");
  const now = new Date().getTime();

  // 現在の画面がToken検証対象かどうかを判定する
  if (to.meta.requiresAuth) {
    // Token有効期間チェック
    if (!token || (tokenExpiration && now > tokenExpiration)) {
      alert("登录状态已过期，请重新登录");
      sessionStorage.clear(); // sessionStorageをクリアする
      return next("/login"); // ログインせずにシステムの画面へアクセスしたい場合、直接にログイン画面へアクセスする
    }

    // Token検証
    try {
       axios.get("/auth/verify", {
        headers: { Authorization: ` ${token}` },
      });
      next(); // Token有効、次の画面へ遷移する
    } catch (error) {
      alert("Token 無効");
      sessionStorage.clear();
      next("/login"); 
    }

  } else {
      next();
  }
});

export default router;