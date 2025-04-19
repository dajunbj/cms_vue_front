<template>
  <div class="attendance-wrapper">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-date"></i> 勤怠登録画面
      </h2>
    </div>

    <div class="section-container">
      <el-form :model="form" ref="attendanceForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="社員ID">
              <el-input v-model="form.employee_id" placeholder="社員IDを入力してください" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="契約ID">
              <el-input v-model="form.contract_id" placeholder="契約IDを入力してください" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="勤怠年月">
              <el-date-picker
                v-model="form.month"
                type="month"
                format="yyyy年MM月"
                value-format="yyyy-MM"
                placeholder="年月を選択"
                @change="fetchOrGenerateMonthlyData"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="table-scroll">
          <el-table
            :data="form.attendanceList"
            border
            :row-style="getRowStyle"
            height="500"
          >
            <el-table-column label="日付" prop="date" >
              <template slot-scope="scope">
                {{ scope.row.date }}<span v-if="getDayName(scope.row.date)">（{{ getDayName(scope.row.date) }}）</span>
              </template>
            </el-table-column>

            <el-table-column label="開始時間" >
              <template slot-scope="scope">
                <el-time-picker v-model="scope.row.start_time" placeholder="開始時間" style="width: 100%;" @change="() => markModified(scope.row)" />
              </template>
            </el-table-column>

            <el-table-column label="終了時間" >
              <template slot-scope="scope">
                <el-time-picker v-model="scope.row.end_time" placeholder="終了時間" style="width: 100%;" @change="() => markModified(scope.row)" />
              </template>
            </el-table-column>

            <el-table-column label="案件名" >
              <template slot-scope="scope">
                <el-input v-model="scope.row.case_name" placeholder="案件名" @input="() => markModified(scope.row)" />
              </template>
            </el-table-column>

            <el-table-column label="休憩時間(h)" >
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.break_hours" :min="0" :step="0.25" :controls="true" controls-position="right" style="width: 100%;" @change="() => markModified(scope.row)" />
              </template>
            </el-table-column>

            <el-table-column label="勤怠区分" >
              <template slot-scope="scope">
                <span>{{ scope.row.attendance_type }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-row>
          <el-col :span="24" style="text-align: center; margin-top: 20px;">
            <el-button type="primary" :loading="isLoading" @click="submitForm">登録</el-button>
            <el-button type="default" @click="goBack">戻る</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "AttendanceRegisterView",
  data() {
    return {
      form: {
        employee_id: '',
        contract_id: '',
        month: '',
        attendanceList: []
      },
      isLoading: false
    };
  },
  created() {
    const today = new Date();
    const yyyyMM = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2);
    this.form.month = yyyyMM;
    this.fetchOrGenerateMonthlyData(yyyyMM);
  },
  methods: {
    async fetchOrGenerateMonthlyData(monthStr) {
      try {
        const res = await axios.get(`/attendance/getMonthly`, {
          params: {
            employee_id: this.form.employee_id,
            contract_id: this.form.contract_id,
            month: monthStr
          }
        });
        this.form.attendanceList = res.data;
      } catch (error) {
        this.$message.error("データ取得に失敗しました");
        console.error(error);
      }
    },
    markModified(row) {
      row.is_modified = true;
    },
    isWeekend(dateStr) {
      const day = new Date(dateStr).getDay();
      return day === 0 || day === 6;
    },
    getAttendanceType(dateStr) {
      const day = new Date(dateStr).getDay();
      return day === 0 || day === 6 ? '休日' : '平日';
    },
    getDayName(dateStr) {
      const day = new Date(dateStr).getDay();
      return ['日', '月', '火', '水', '木', '金', '土'][day];
    },
    getRowStyle({ row }) {
      const day = new Date(row.date).getDay();
      if (day === 0 || day === 6) {
        return { backgroundColor: '#e0f8e0' };
      }
      return {};
    },
    async submitForm() {
      this.isLoading = true;
      try {
        const modifiedRecords = this.form.attendanceList.filter(item => item.is_modified);
        if (modifiedRecords.length > 0) {
          await axios.post('/attendance/register', modifiedRecords);
        }
        this.$message.success("登録が成功しました");
        this.goBack();
      } catch (e) {
        this.$message.error("登録に失敗しました");
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push('/attendance');
    }
  }
};
</script>

<style scoped>
.attendance-wrapper {
  width: 100%;
  max-width: 1400px;
  overflow-x: auto;
  overflow-y: hidden;
}
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
  color: #333;
  display: flex;
  align-items: center;
}
.header-title i {
  margin-right: 10px;
  font-size: 28px;
  color: #409EFF;
}
.section-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.table-scroll {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
}
</style>
