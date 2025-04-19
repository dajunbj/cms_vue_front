<template>
  <div class="attendance-list-wrapper">
    <div class="header">
      <h2><i class="el-icon-document-checked"></i> 勤怠一览画面</h2>
    </div>

    <!-- 検索条件 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="対象年月">
        <el-date-picker
          v-model="searchForm.month"
          type="month"
          placeholder="年月を選択"
          format="yyyy-MM"
        />
      </el-form-item>
      <el-form-item label="社員">
        <el-input v-model="searchForm.employeeName" placeholder="氏名を入力" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">検索</el-button>
        <el-button type="success" @click="createNew">当月新規登録</el-button>
      </el-form-item>
    </el-form>

    <!-- 勤怠一覧テーブル -->
    <el-table :data="attendanceList" style="width: 100%" border v-loading="loading">
      <el-table-column prop="sheet_id" label="勤務ID" width="150" />
      <el-table-column prop="employee_id" label="社員ID" width="120" />
      <el-table-column prop="employeeName" label="社員名" />
      <el-table-column prop="working_hours" label="勤務総時間" />
      <el-table-column label="操作" width="150">
        <template v-slot="scope">
          <el-button type="primary" size="mini" @click="edit(scope.row)">編集</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
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
      alert(this.searchForm.month);
      alert(this.searchForm.employeeName);
      const res = await this.$axios.get('/attendance/listview/search', {
        params: {
          month: this.searchForm.month,
          employeeName: this.searchForm.employeeName
        }
      });
      alert(res.data.data);
      alert(res.data.data.length);
      this.attendanceList = res.data.data;
      this.loading = false;
    },
    createNew() {
      this.$router.push({ name: 'AttendanceForm', query: { month: this.searchForm.month } });
    },
    edit(row) {
      this.$router.push({ name: 'AttendanceForm', query: { id: row.id } });
    }
  }
};
</script>
