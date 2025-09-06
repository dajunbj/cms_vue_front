// routesConfig.js
import HomeView from "../views/HomeView.vue"
import EmployeeListView from "../views/employee/EmployeeListView.vue"
import SettingView from "../views/SettingView.vue"
import LoginView from "../views/LoginView.vue"
import ContractView from "../views/ContractView.vue"
import CustomerView from "../views/CustomerView.vue"

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/home", name: "Home", component: HomeView, meta: { requiresAuth: true } },
  { path: "/employee", name: "User", component: EmployeeListView, meta: { requiresAuth: true } },
  { path: "/setting", name: "Setting", component: SettingView, meta: { requiresAuth: true } },
  { path: "/contract", name: "Contract", component: ContractView, meta: { requiresAuth: true } },
  { path: "/customer", name: "Customer", component: CustomerView, meta: { requiresAuth: true } }
]

export default routes
