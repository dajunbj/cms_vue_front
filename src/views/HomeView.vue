<template>
  <div class="home-dashboard">
    <el-tabs v-model="activeTab" type="card" @tab-click="clickTab" >
      <!-- 技术分布 Tab -->
      <el-tab-pane label="技术分布" name="tech-distribution"  >
        <div class="section">
          <!-- 左侧技术分布图表 -->
          <div id="employeeStatsChart" class="chart"></div>

          <!-- 右侧社员详细信息表格 -->
          <div class="list">
            <h4>技术分布详细信息</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>入社年月</th>
                  <th>部门</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(employee, index) in techEmployeeList" :key="index">
                  <td>{{ employee.name }}</td>
                  <td>{{ employee.joinDate }}</td>
                  <td>{{ employee.department }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 考勤状况 Tab -->
      <el-tab-pane label="考勤状况" name="attendance-status">
        <div class="section">
          <!-- 左侧考勤图表 -->
          <div id="attendanceChart" class="chart"></div>

          <!-- 右侧未提交考勤人员一览 -->
          <div class="list">
            <h4>未提交考勤人员一览</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>部门</th>
                  <th>联系方式</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(person, index) in notSubmittedList" :key="index">
                  <td>{{ person.name }}</td>
                  <td>{{ person.department }}</td>
                  <td>{{ person.contact }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 合同即将到期社员 Tab -->
      <el-tab-pane label="合同即将到期社员" name="contract-expiry">
        <div class="section">
          <!-- 左侧合同到期概览图表 -->
          <div id="contractExpiryChart" class="chart"></div>

          <!-- 右侧合同即将到期社员表格 -->
          <div class="list">
            <h4>合同即将到期社员</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>客户名</th>
                  <th>契约开始</th>
                  <th>契约终了</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(employee, index) in expiringContracts" :key="index">
                  <td>{{ employee.name }}</td>
                  <td>{{ employee.client }}</td>
                  <td>{{ employee.contractStart }}</td>
                  <td>{{ employee.contractEnd }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 公司通知 Tab -->
      <el-tab-pane label="公司通知" name="company-notices">
        <div class="notifications-section">
          <h4>公司通知一览</h4>
          <table class="table">
            <thead>
              <tr>
                <th>日期</th>
                <th>通知事项</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(notification, index) in notifications" :key="index">
                <td>{{ notification.date }}</td>
                <td>{{ notification.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { ref } from "vue";

export default {
  name: "HomeView",
  setup() {
    const activeTab = ref("tech-distribution"); // 默认显示技术分布
    return { activeTab };
  },
  data() {
    return {
      // 数据源
      employeeData: {
        total: 50,
        levels: {
          "1年技术者": 10,
          "3年技术者": 15,
          "5年以上技术者": 15,
          "7年以上技术者": 10,
        },
      },
      attendanceData: {
        total: 50,
        submitted: 45,
        notSubmitted: 5,
      },
      techEmployeeList: [
        { name: "张三", joinDate: "2022年4月", department: "开发部" },
        { name: "李四", joinDate: "2021年6月", department: "测试部" },
        { name: "王五", joinDate: "2020年8月", department: "设计部" },
        { name: "赵六", joinDate: "2019年3月", department: "运营部" },
        { name: "周七", joinDate: "2018年11月", department: "人事部" },
      ],
      notSubmittedList: [
        { name: "张三", department: "开发部", contact: "123-4567-8901" },
        { name: "李四", department: "测试部", contact: "123-4567-8902" },
        { name: "王五", department: "设计部", contact: "123-4567-8903" },
        { name: "赵六", department: "运营部", contact: "123-4567-8904" },
        { name: "周七", department: "人事部", contact: "123-4567-8905" },
      ],
      expiringContracts: [
        { name: "张三", client: "客户A", contractStart: "2023年1月", contractEnd: "2024年1月" },
        { name: "李四", client: "客户B", contractStart: "2022年12月", contractEnd: "2024年2月" },
        { name: "王五", client: "客户C", contractStart: "2023年3月", contractEnd: "2024年3月" },
      ],
      notifications: [
        { date: "2024-12-01", message: "年会将于12月25日举行，请大家提前准备。" },
        { date: "2024-12-02", message: "公司新政策：所有员工考勤需在当月5日提交。" },
        { date: "2024-12-03", message: "12月公司全员培训，请大家务必参加。" },
      ],
    };
  },
  mounted() {
    this.renderEmployeeStatsChart();
    this.renderAttendanceChart();
    this.renderContractExpiryChart();
  },
  methods: {
    renderEmployeeStatsChart() {
      const chartDom = document.getElementById("employeeStatsChart");
      if (!chartDom) return;
      // 销毁已有实例，避免重复初始化
      echarts.dispose(chartDom);
      const myChart = echarts.init(chartDom);

      const option = {
        title: { text: "技术者年限分布" },
        tooltip: { trigger: "item" },
        legend: { bottom: "0%" },
        series: [
          {
            name: "人数",
            type: "pie",
            radius: "50%",
            data: [
              { value: this.employeeData.levels["1年技术者"], name: "1年技术者" },
              { value: this.employeeData.levels["3年技术者"], name: "3年技术者" },
              { value: this.employeeData.levels["5年以上技术者"], name: "5年以上技术者" },
              { value: this.employeeData.levels["7年以上技术者"], name: "7年以上技术者" },
            ],
          },
        ],
      };
      myChart.setOption(option);
    },
    renderAttendanceChart() {
      const chartDom = document.getElementById("attendanceChart");
      if (!chartDom) return;
      // 销毁已有实例，避免重复初始化
      echarts.dispose(chartDom);
      const myChart = echarts.init(chartDom);
      const option = {
        title: { text: "考勤提交情况" },
        tooltip: { trigger: "item" },
        legend: { bottom: "0%" },
        series: [
          {
            name: "考勤",
            type: "pie",
            radius: "50%",
            data: [
              { value: this.attendanceData.submitted, name: "已提交" },
              { value: this.attendanceData.notSubmitted, name: "未提交" },
            ],
          },
        ],
      };
      myChart.setOption(option);
    },
    renderContractExpiryChart() {
      const chartDom = document.getElementById("contractExpiryChart");
      if (!chartDom) return;
      // 销毁已有实例，避免重复初始化
      echarts.dispose(chartDom);
      const myChart = echarts.init(chartDom);
      const option = {
        title: { text: "合同即将到期分布" },
        tooltip: { trigger: "item" },
        legend: { bottom: "0%" },
        series: [
          {
            name: "人数",
            type: "pie",
            radius: "50%",
            data: this.expiringContracts.map((contract) => ({
              value: 1,
              name: `${contract.name} - ${contract.client}`,
            })),
          },
        ],
      };
      myChart.setOption(option);
    },
    clickTab(obj) {
      if (obj.name === "tech-distribution") {
        this.$nextTick(() => {
          this.renderEmployeeStatsChart();
        });
      }
      if (obj.name === "attendance-status") {
        this.$nextTick(() => {
          this.renderAttendanceChart();
        });
      }
      if (obj.name === "contract-expiry") {
        this.$nextTick(() => {
          this.renderContractExpiryChart();
        });
      }
    }
  },
};
</script>

<style>
.home-dashboard {
  padding: 20px;
}
.section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.chart {
  flex: 1;
  width: 100%; /* 设置宽度为父容器的100% */
  height: 400px; /* 固定高度 */
  min-width: 300px; /* 设置最小宽度，避免过小 */
  max-width: 1000px; /* 设置最大宽度，避免过宽 */
  margin: auto; /* 居中 */
  aspect-ratio: 16 / 9; /* 保持宽高比 */
}

.list {
  flex: 1;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.list h4 {
  margin-bottom: 10px;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.table th {
  background: #f4f4f4;
  font-weight: bold;
}
</style>