<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <!-- タイトル -->
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-document-checked"></i> 勤怠一覽画面
      </h2>
    </div>

    <!-- 検索条件 -->
    <div class="section-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="対象年月">
              <el-date-picker
                v-model="searchForm.month"
                type="month"
                placeholder="年月を選択"
                format="yyyy-MM"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="社員名">
              <el-input v-model="searchForm.employeeName" placeholder="氏名を入力" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" icon="el-icon-search" @click="search">検索</el-button>
            <el-button type="success" icon="el-icon-plus" @click="createNew">当月新規登録</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 表 -->
    <div class="section-container">
      <el-table
        :data="attendanceList"
        style="width: 100%"
        border
        v-loading="loading"
        height="300px"
      >
        <el-table-column prop="sheet_id" label="勤務ID" width="120" header-align="center" />
        <el-table-column prop="employee_id" label="社員ID" width="100" header-align="center" />
        <el-table-column prop="employeeName" label="社員名" header-align="center" />
        <el-table-column prop="working_hours" label="勤務総時間" header-align="center" />
        <el-table-column label="操作" width="150" align="center">
          <template v-slot="scope">
            <el-button type="text" size="small" @click="edit(scope.row)">編集</el-button>
            <el-button type="text" size="small" @click="edit(scope.row)">参照</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>


<script>

import axios from 'axios';

export default {
  data() {
    return {
      searchForm: {
        month: '',
        employeeName: ''
      },
      attendanceList: [],
      loading: false
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const now = new Date();
      this.searchForm.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      this.search();
    },
    async search() {
      this.loading = true;
      
      const res = await axios.get('/attendance/listview/search', {
        params: {
          month: this.searchForm.month,
          employeeName: this.searchForm.employeeName
        }
      });

      this.attendanceList = res.data.data;
      this.loading = false;
    },
    createNew() {
      this.$router.push({ name: '/attendance/registview', query: { month: this.searchForm.month } });
      this.$router.push({ path: `/attendance/registview` }); // 新規登録画面へ
    },
    edit(row) {
      this.$router.push({ name: 'AttendanceForm', query: { id: row.id } });
    }
  }
};
</script>

<style scoped>
.header-container {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  display: flex;
  align-items: center;
}
.header-title i {
  margin-right: 10px;
  font-size: 28px;
  color: #409EFF;
}
.section-container {
  background-color: #FFFFFF;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.el-input {
  margin-bottom: 10px;
}
.el-table th {
  background-color: #E3F2FD;
  color: #333333;
  font-weight: bold;
}
.el-table th .cell {
  font-size: 14px;
  text-align: center;
}
</style>
