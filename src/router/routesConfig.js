// routesConfig.js
import HomeView from "../views/HomeView.vue";
import EmployeeListView from "../views/EmployeeListView.vue";
import SettingView from "../views/SettingView.vue";
import LoginView from "../views/LoginView.vue";

export default [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "Login", LoginView },
    { path: "/home", name: "Home", HomeView, meta: { requiresAuth: true } },
    { path: "/employee", name: "User", EmployeeListView, meta: { requiresAuth: true } },
    { path: "/setting", name: "Setting", SettingView, meta: { requiresAuth: true } },
  ];
  