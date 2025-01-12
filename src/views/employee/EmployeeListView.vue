<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <!-- 添加标题部分 -->
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user"></i> 社員一覧画面
      </h2>
    </div>
    <div class="section-container">

    <el-row>
      <el-col :span="6">
        <el-input v-model="employeeName" placeholder="社員名をご入力ください。" clearable></el-input>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="6">
        <el-input v-model="companyName" placeholder="会社をご入力ください。" clearable></el-input>
      </el-col>
      <el-col :span="1.5">
        <el-button icon="el-icon-search" @click="showDialog"></el-button>
      </el-col>
      <el-col :span="3">
        <el-input v-model="companyId" :disabled="true"></el-input>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="14">
        <el-button icon="el-icon-search" @click="findEmployees" type="primary">検索</el-button>
        <el-button icon="el-icon-plus" @click="createRecord" type="primary">新規</el-button>
        <el-button icon="el-icon-delete" @click="deleteAllSelected('/employee/deleteAll')" type="primary">全削除</el-button>
      </el-col>
    </el-row>
    
</div>
    <!-- 检索结果和翻页部分 -->
    <div class="section-container">

    <el-row>
      <el-col :span="24">
        <el-table :data="filteredEmployees" border style="width: 100%; margin-top: 20px;" height="300px" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column prop="employeeId" label="ID" header-align="center" :class="'no-wrap-column'"></el-table-column>
          <el-table-column prop="name" label="名前" header-align="center"></el-table-column>
          <el-table-column prop="sex" label="性別" header-align="center"></el-table-column>
          <el-table-column prop="birthday" label="誕生日" header-align="center"></el-table-column>
          <el-table-column prop="address" label="住所" header-align="center"></el-table-column>
          <el-table-column prop="phone" label="電話" header-align="center"></el-table-column>
          <el-table-column label="動作" align="center">
            <template slot-scope="scope">
              <el-button @click="clickReference(scope.row)" type="text" size="small">参照</el-button>
              <el-button @click="clickEdit(scope.row)" type="text" size="small">編集</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 翻页组件 -->
        <el-pagination
          style="margin-top: 20px; text-align: center;"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page.sync="currentPage"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 50, 100, 200]" 
          :total="totalEmployees"
          @current-change="handlePageChange"
          @size-change="handleSizeChange">
        </el-pagination>
      </el-col>
    </el-row>
    <!-- 使用通用弹窗 -->
    <CommonSearchDialog
      :visible.sync="dialogVisible"
      :title="'会社選択画面'"
      :tableData="dialogData"
      :columns="dialogColumns"
      :filters="dialogFilters"
      @select-company="handleSelectCompany" 
    />
  </div>
  </div>
</template>

<script>
import axios from 'axios';
import CommonSearchDialog from "@/components/CommonSearchDialog.vue";
import { deleteAllSelected } from "@/js/ListView.js";

export default {
  name: "EmployeeListView",
  components: { CommonSearchDialog },
  data() {
    return {
      employeeName: "",
      companyName: "",
      companyId: "",
      dialogVisible: false,
      dialogData: [],
      dialogColumns: [
        { prop: "id", label: "ID", width: "100" },
        { prop: "name", label: "名前", width: "220" },
        { prop: "department", label: "部門", width: "220" },
      ],
      dialogFilters: [
        {
          prop: "name",
          label: "名前",
          type: "el-input",
          width: 300,
          props: { placeholder: "名前を入力してください", clearable: true },
        },
        {
          prop: "department",
          label: "部門",
          type: "el-select",
          width: 300,
          props: {
            placeholder: "部門を選択してください",
            clearable: true,
            options: [
              { label: "営業", value: "営業" },
              { label: "開発", value: "開発" },
              { label: "経理", value: "経理" },
            ],
          },
        },
      ],
      employeeData: [],
      currentPage: 1, // 当前页
      pageSize: 10, // 每页数量
      totalEmployees: 0, // 总条目数
      filteredEmployees: [],
    };
  },
  methods: {
    deleteAllSelected,//外部のメソッドを呼び出す
    showDialog() {
      this.dialogVisible = true;
    },

    async findEmployees() {
      try {
        const response = await axios.post('/employee/search', {
        employeeName: this.employeeName,
        companyName: this.companyName,
        currentPage: this.currentPage, // 当前页
        pageSize: this.pageSize, // 每页数量
        });
        this.filteredEmployees = response.data.data; // 使用返回的分页数据
        this.totalEmployees = response.data.total; // 设置总条目数
      } catch (error) {
        this.$message.error('データの取得に失敗しました' + error);
      }
    },
    handleSelectCompany(selectedCompany) {
      //PopUp画面戻り値の設定
      this.companyName = selectedCompany.name;
      this.companyId = selectedCompany.id;
    },
    clickReference(row) {
      this.$router.push({ path: `/employee/detail/${row.employeeId}` }); // 跳转参照画面
    },
    clickEdit(row) {
      this.$router.push({ path: `/employee/edit/${row.employeeId}` }); // 跳转编辑画面
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.id);
    },
    createRecord() {
      this.$router.push('/employee/register');
    },

    // 页码改变事件
    handlePageChange(page) {
      this.currentPage = page;
      this.findEmployees(); // 重新调用查询方法
    },

    // 每页数量改变事件
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1; // 重置为第一页
      this.findEmployees(); // 重新调用查询方法
    },
  },
  mounted() {
    this.filteredEmployees = this.employeeData;
  },
};
</script>

<style scoped>
.header-container {
  /* background-color: #F5F7FA; */
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
.section-title {
  margin: 0 0 15px 0;
  font-size: 20px;
  font-weight: bold;
  color: #333333;
  display: flex;
  align-items: center;
}
.section-title i {
  margin-right: 10px;
  font-size: 24px;
  color: #409EFF;
}
.el-input {
  margin-bottom: 10px;
}
.no-wrap-column .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.input-label .el-input__inner {
  border: none; /* 去掉边框 */
  background-color: transparent; /* 设置背景为透明 */
  color: #333; /* 设置字体颜色（可选） */
  box-shadow: none; /* 去掉阴影（如果有） */
}
</style>
