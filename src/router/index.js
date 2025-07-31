import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import EmployeeListView from '../views/employee/EmployeeListView.vue';
import SettingView from '../views/SettingView.vue';
import LoginView from '../views/LoginView.vue';
import EmployeeRegisterView from '@/views/employee/EmployeeRegisterView.vue';
import ContractListView from '@/views/contract/ContractListView.vue';
import ContractRegisterView from '@/views/contract/ContractRegisterView.vue';
import CustomerView from '../views/customer/CustomerView.vue';
import CustomerRegisterView from '@/views/customer/CustomerRegisterView.vue';
import ResponsibleRegisterView from '@/views/customer/ResponsibleRegisterView.vue';

import axios from 'axios';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/employee',
    name: 'User',
    component: EmployeeListView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/employee/register',
    component: EmployeeRegisterView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/setting',
    name: 'Setting',
    component: SettingView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/employee/detail/:id',
    component: () => import('@/views/employee/EmployeeDetailView.vue')
  },
  {
    path: '/employee/edit/:id',
    component: () => import('@/views/employee/EmployeeEditView.vue')
  },
  {
    path: '/file/receipt',
    component: () => import('@/views/file/ReceiptUploadView.vue')
  },

  {
    path: '/contract',
    component: ContractListView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/contract/register',
    component: ContractRegisterView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/contract/register/:id',
    component: () => import('@/views/contract/ContractRegisterView.vue')
  },
  {
    path: '/contract/edit/:id',
    component: () => import('@/views/contract/ContractEditView.vue')
  },
  {
    path: '/contract/detail/:id',
    component: () => import('@/views/contract/ContractDetailView.vue')
  },

  {
    path: '/customer',
    component: CustomerView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/customer/register',
    component: CustomerRegisterView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/customer/registerRes',
    component: ResponsibleRegisterView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/customer/registerRes/:id',
    component: ResponsibleRegisterView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/customer/edit/:id',
    component: () => import('@/views/customer/CustomerEditView.vue')
  },
  {
    path: '/customer/detail/:id',
    component: () => import('@/views/customer/CustomerDetailView.vue')
  },
  {
    path: '/customer/editRes/:id',
    component: () => import('@/views/customer/ResponsibleEditView.vue')
  },
  {
    path: '/customer/detailRes/:id',
    component: () => import('@/views/customer/ResponsibleDetailView.vue')
  },

  {
    path: '/attendance/listview',
    component: () => import('@/views/attendance/AttendanceListView.vue')
  },
  {
    path: '/attendance/registview',
    component: () => import('@/views/attendance/AttendanceRegistView.vue')
  },
  {
    path: '/ocr/read',
    name: 'OcrRead',
    component: () => import('@/views/ocr/OcrRead.vue')
  },
  // 領収書アップロード・確認画面
  {
    path: '/expense/receipt-upload',
    component: () => import('@/views/expense/ReceiptUploadView.vue'),
    meta: {
      requiresAuth: true
    }
  },

  // 経費申請作成画面
  {
    path: '/expense/apply',
    component: () => import('@/views/expense/ExpenseApplyView.vue'),
    meta: {
      requiresAuth: true
    }
  },

  // 経費承認画面（管理者用）
  {
    path: '/expense/approval',
    component: () => import('@/views/expense/ExpenseApprovalView.vue'),
    meta: {
      requiresAuth: true
    }
  },

  // 経費履歴・出力画面
  {
    path: '/expense/history',
    component: () => import('@/views/expense/ExpenseHistoryView.vue'),
    meta: {
      requiresAuth: true
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局导航守卫
router.beforeEach(async (to, from, next) => {
  const token = sessionStorage.getItem('token');
  const tokenExpiration = sessionStorage.getItem('tokenExpiration');
  const now = new Date().getTime();

  if (to.meta.requiresAuth) {
    if (!token || (tokenExpiration && now > tokenExpiration)) {
      alert('登录状态已过期，请重新登录');
      sessionStorage.clear();
      return next('/login');
    }

    try {
      await axios.get('/auth/verify', {
        headers: {
          Authorization: ` ${token}`
        }
      });
      next();
    } catch (error) {
      alert('Token 无效');
      sessionStorage.clear();
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
