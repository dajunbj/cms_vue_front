// src/permissions/role.js

// ユーザーの社内役割（admin / employeeなど）に応じたアクセス制御
// 各社員が自分の権限に応じて、使える機能を制限する（例：社員は給料や承認画面は非表示）
export const ROLE_PERMISSIONS = {
  admin: {
    showPayroll: true,              // 給料管理：表示
    showExpense: true,              // 費用申請（OCR）：表示
    showSettlement: true,           // 決算：表示
    showFinalAdjustment: true,      // 年末調整：表示
    showCustomer: true,             // 顧客管理：表示
    showExpenseApproval: true       // 費用承認：表示
  },
  employee: {
    showPayroll: false,             // 給料管理：非表示（社员无法访问）
    showExpense: true,
    showSettlement: false,
    showFinalAdjustment: false,
    showCustomer: false,
    showExpenseApproval: false
  }
}
