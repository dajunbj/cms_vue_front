<template>
  <div class="page-container">
    <!-- 検索条件 -->
    <el-row style="margin: 10px;" justify="end" gutter="10">
      <el-col :span="6">
        <el-select v-model="selectedEmployee" placeholder="社員名を選択" style="width: 100%;">
          <el-option v-for="employee in employeeList" :key="employee" :label="employee" :value="employee" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-date-picker
          v-model="selectedFiscalYear"
          type="year"
          placeholder="YYYY年"
          format="YYYY年"
          value-format="YYYY"
          style="width: 100%;"
          @change="loadSalaryData"
        />
      </el-col>
    </el-row>

    <!-- 明細表示エリア -->
    <div class="scroll-container">
      <div class="header-container">
        <h2 class="header-title">
          <i class="el-icon-document"></i>
          {{ selectedEmployee }} - {{ selectedFiscalYear }}年度 給与明細（個人＋会社 合併表示）
        </h2>
      </div>
      <div class="section-container">
        <el-table
          :data="combinedTable"
          border
          style="width: 100%;"
          :row-class-name="rowClassName"
        >
          <el-table-column prop="group" label="カテゴリ" width="180" />
          <el-table-column prop="item" label="項目" width="220" />
          <el-table-column
            v-for="(month, index) in months"
            :key="index"
            :label="month"
            :prop="'month_' + (index + 1)"
          >
            <template #default="{ row }">
              <template v-if="row.isHeader">
                <strong>—</strong>
              </template>
              <template v-else-if="index >= currentMonthIndex && !row.total && row.type !== 'company'">
                <el-input-number
                  v-model="row['month_' + (index + 1)]"
                  :min="0"
                  size="small"
                />
              </template>
              <template v-else>
                <strong v-if="row.total">{{ format(row['month_' + (index + 1)]) }}</strong>
                <span v-else>{{ format(row['month_' + (index + 1)]) }}</span>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFiscalYear: null,
      selectedEmployee: '山田太郎',
      employeeList: ['山田太郎', '佐藤花子', '鈴木一郎'],
      months: ['9月', '10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
      personalTable: [],
      companyTable: [],
      salaryDataByYear: {
        '山田太郎': {
          '2024': {
            personal: [
              { type: 'personal', group: '給与関連', item: '基本給', data: Array(12).fill(280000) },
              { type: 'personal', group: '社会保険（個人）', item: '健康保険', data: Array(12).fill(22000) },
              { type: 'personal', group: '社会保険（個人）', item: '厚生年金', data: Array(12).fill(22000) }
            ],
            company: [
              { type: 'company', group: '社会保険（会社）', item: '健康保険', data: Array(12).fill(30000) },
              { type: 'company', group: '社会保険（会社）', item: '厚生年金', data: Array(12).fill(30000) }
            ]
          },
          '2025': {
            personal: [
              { type: 'personal', group: '給与関連', item: '基本給', data: Array(12).fill(300000) },
              { type: 'personal', group: '社会保険（個人）', item: '健康保険', data: Array(12).fill(24000) },
              { type: 'personal', group: '社会保険（個人）', item: '厚生年金', data: Array(12).fill(24000) }
            ],
            company: [
              { type: 'company', group: '社会保険（会社）', item: '健康保険', data: Array(12).fill(33000) },
              { type: 'company', group: '社会保険（会社）', item: '厚生年金', data: Array(12).fill(33000) }
            ]
          }
        },
        '佐藤花子': {
          '2024': {
            personal: [
              { type: 'personal', group: '給与関連', item: '基本給', data: Array(12).fill(260000) },
              { type: 'personal', group: '社会保険（個人）', item: '健康保険', data: Array(12).fill(21000) }
            ],
            company: [
              { type: 'company', group: '社会保険（会社）', item: '健康保険', data: Array(12).fill(28000) }
            ]
          },
          '2025': {
            personal: [
              { type: 'personal', group: '給与関連', item: '基本給', data: Array(12).fill(270000) },
              { type: 'personal', group: '社会保険（個人）', item: '健康保険', data: Array(12).fill(22000) }
            ],
            company: [
              { type: 'company', group: '社会保険（会社）', item: '健康保険', data: Array(12).fill(29000) }
            ]
          }
        }
      }
    };
  },
  computed: {
    combinedTable() {
      const totalRow = (label, dataRows, type) => {
        const total = { group: label, item: '合計', total: true, type };
        for (let i = 1; i <= 12; i++) {
          total[`month_${i}`] = dataRows.reduce((sum, row) => sum + (row[`month_${i}`] || 0), 0);
        }
        return total;
      };
      const personalHeader = { isHeader: true, group: '個人負担', item: '', type: 'personal' };
      const companyHeader = { isHeader: true, group: '会社負担', item: '', type: 'company' };
      const personalTotal = totalRow('個人合計', this.personalTable, 'personal');
      const companyTotal = totalRow('会社合計', this.companyTable, 'company');
      return [
        personalHeader,
        ...this.personalTable,
        personalTotal,
        companyHeader,
        ...this.companyTable,
        companyTotal
      ];
    },
    currentMonthIndex() {
      const today = new Date();
      const m = today.getMonth();
      return m < 8 ? m + 4 : m - 8;
    }
  },
  watch: {
    selectedEmployee() {
      this.loadSalaryData();
    },
    selectedFiscalYear() {
      this.loadSalaryData();
    }
  },
  mounted() {
    const year = new Date().getFullYear();
    this.selectedFiscalYear = year.toString();
    this.loadSalaryData();
  },
  methods: {
    loadSalaryData() {
      const raw = this.salaryDataByYear[this.selectedEmployee]?.[this.selectedFiscalYear];
      this.personalTable = raw?.personal?.map(row => {
        const result = { ...row };
        for (let i = 0; i < 12; i++) {
          result[`month_${i + 1}`] = row.data[i];
        }
        return result;
      }) || [];
      this.companyTable = raw?.company?.map(row => {
        const result = { ...row };
        for (let i = 0; i < 12; i++) {
          result[`month_${i + 1}`] = row.data[i];
        }
        return result;
      }) || [];
    },
    format(value) {
      return value === 0 ? '¥0' : '¥' + value.toLocaleString();
    },
    rowClassName({ row }) {
      if (row.isHeader && row.type === 'personal') return 'header-personal';
      if (row.isHeader && row.type === 'company') return 'header-company';
      if (row.total) return 'row-total';
      return '';
    }
  }
};
</script>



<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 20px 10px;
}

.header-container {
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 6px;
  background: #f7f9fb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.header-title i {
  margin-right: 8px;
  font-size: 22px;
  color: #409EFF;
}

.section-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

::v-deep(.header-personal) {
  background-color: #e3f2fd !important;
  font-weight: bold;
  color: #0d47a1;
}

::v-deep(.header-company) {
  background-color: #fbe9e7 !important;
  font-weight: bold;
  color: #bf360c;
}

::v-deep(.row-total) {
  background-color: #f1f8e9 !important;
  font-weight: bold;
}
</style>
