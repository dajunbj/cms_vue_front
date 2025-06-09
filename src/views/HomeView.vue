<template>
  <div class="home-dashboard">
    <el-tabs
      v-model="activeTab"
      type="card"
      @tab-click="clickTab"
    >
      <el-tab-pane
        label="技术分布"
        name="tech-distribution"
      >
        <div class="section">
          <div
            id="employeeStatsChart"
            class="chart"
          />
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
                <tr
                  v-for="(employee, index) in techEmployeeList"
                  :key="index"
                >
                  <td>{{ employee.name }}</td>
                  <td>{{ employee.joinDate }}</td>
                  <td>{{ employee.department }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane
        label="考勤状况"
        name="attendance-status"
      >
        <div class="section">
          <div
            id="attendanceChart"
            class="chart"
          />
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
                <tr
                  v-for="(person, index) in notSubmittedList"
                  :key="index"
                >
                  <td>{{ person.name }}</td>
                  <td>{{ person.department }}</td>
                  <td>{{ person.contact }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane
        label="合同即将到期社员"
        name="contract-expiry"
      >
        <div class="section">
          <div
            id="contractExpiryChart"
            class="chart"
          />
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
                <tr
                  v-for="(employee, index) in expiringContracts"
                  :key="index"
                >
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

      <el-tab-pane
        label="公司通知"
        name="company-notices"
      >
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
              <tr
                v-for="(notification, index) in notifications"
                :key="index"
              >
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

<script setup>
import * as echarts from "echarts";
import { ref, onMounted } from "vue";

const activeTab = ref("tech-distribution");

const employeeData = {
  total: 50,
  levels: {
    "1年技术者": 10,
    "3年技术者": 15,
    "5年以上技术者": 15,
    "7年以上技术者": 10,
  },
};

const attendanceData = {
  total: 50,
  submitted: 45,
  notSubmitted: 5,
};

const techEmployeeList = ref([
  { name: "张三", joinDate: "2022年4月", department: "开发部" },
  { name: "李四", joinDate: "2021年6月", department: "测试部" },
  { name: "王五", joinDate: "2020年8月", department: "设计部" },
  { name: "赵六", joinDate: "2019年3月", department: "运营部" },
  { name: "周七", joinDate: "2018年11月", department: "人事部" },
]);

const notSubmittedList = ref([
  { name: "张三", department: "开发部", contact: "123-4567-8901" },
  { name: "李四", department: "测试部", contact: "123-4567-8902" },
  { name: "王五", department: "设计部", contact: "123-4567-8903" },
  { name: "赵六", department: "运营部", contact: "123-4567-8904" },
  { name: "周七", department: "人事部", contact: "123-4567-8905" },
]);

const expiringContracts = ref([
  { name: "张三", client: "客户A", contractStart: "2023年1月", contractEnd: "2024年1月" },
  { name: "李四", client: "客户B", contractStart: "2022年12月", contractEnd: "2024年2月" },
  { name: "王五", client: "客户C", contractStart: "2023年3月", contractEnd: "2024年3月" },
]);

const notifications = ref([
  { date: "2024-12-01", message: "年会将于12月25日举行，请大家提前准备。" },
  { date: "2024-12-02", message: "公司新政策：所有员工考勤需在当月5日提交。" },
  { date: "2024-12-03", message: "12月公司全员培训，请大家务必参加。" },
]);

const renderEmployeeStatsChart = () => {
  const chartDom = document.getElementById("employeeStatsChart");
  if (!chartDom) return;
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
        data: Object.entries(employeeData.levels).map(([key, value]) => ({ name: key, value })),
      },
    ],
  };
  myChart.setOption(option);
};

const renderAttendanceChart = () => {
  const chartDom = document.getElementById("attendanceChart");
  if (!chartDom) return;
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
          { value: attendanceData.submitted, name: "已提交" },
          { value: attendanceData.notSubmitted, name: "未提交" },
        ],
      },
    ],
  };
  myChart.setOption(option);
};

const renderContractExpiryChart = () => {
  const chartDom = document.getElementById("contractExpiryChart");
  if (!chartDom) return;
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
        data: expiringContracts.value.map((c) => ({ name: `${c.name} - ${c.client}`, value: 1 })),
      },
    ],
  };
  myChart.setOption(option);
};

const clickTab = (obj) => {
  if (obj.name === "tech-distribution") {
    setTimeout(renderEmployeeStatsChart);
  } else if (obj.name === "attendance-status") {
    setTimeout(renderAttendanceChart);
  } else if (obj.name === "contract-expiry") {
    setTimeout(renderContractExpiryChart);
  }
};

onMounted(() => {
  renderEmployeeStatsChart();
  renderAttendanceChart();
  renderContractExpiryChart();
});
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
  width: 100%;
  height: 400px;
  min-width: 300px;
  max-width: 1000px;
  margin: auto;
  aspect-ratio: 16 / 9;
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