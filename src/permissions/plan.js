// src/permissions/plan.js

// 各プランによるメニュー表示制御設定
export const PLAN_PERMISSIONS = {
  basic: {
    showPayroll: false,             // 給料：非表示
    showExpense: true,              // 費用申請OCR：表示
    showSettlement: false,          // 決算：非表示
    showFinalAdjustment: false,     // 年末調整：非表示
    showCustomer: false,             // 顧客管理：非表示
    showExpenseApproval: false,
    showOcrAuth: true
  },
  standard: {
    showPayroll: true,
    showExpense: true,
    showSettlement: false,
    showFinalAdjustment: false,
    showCustomer: true,
    showExpenseApproval: true,
    showOcrAuth: true
  },
  pro: {
    showPayroll: true,
    showExpense: true,
    showSettlement: true,
    showFinalAdjustment: true,
    showCustomer: true,
    showExpenseApproval: true,
    showOcrAuth: true
  }
}
