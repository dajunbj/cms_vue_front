// src/permissions/plan.js

// 各プランによるメニュー表示制御設定
export const PLAN_PERMISSIONS = {
  basic: {
    showPayroll: true, // 給料：非表示
    showExpense: true, // 費用申請OCR：表示
    showSettlement: true, // 決算：非表示
    showFinalAdjustment: true, // 年末調整：非表示
    showCustomer: true, // 顧客管理：非表示
    showExpenseApproval: true,
    showOcrAuth: true,
    showExpense: true,
  },
  standard: {
    showPayroll: true,
    showExpense: true,
    showSettlement: true,
    showFinalAdjustment: true,
    showCustomer: true,
    showExpenseApproval: true,
    showOcrAuth: true,
    showExpense: true,
  },
  pro: {
    showPayroll: true,
    showExpense: true,
    showSettlement: true,
    showFinalAdjustment: true,
    showCustomer: true,
    showExpenseApproval: true,
    showOcrAuth: true,
    showExpense: true,
  }
}