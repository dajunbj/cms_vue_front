<template>
  <div>
    <h2>社員一覧画面</h2>
    <el-row>
      <el-col :span="6">
        <el-input v-model="searchName" placeholder="社員名をご入力ください。" clearable></el-input>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 10px;">
      <el-col :span="6">
        <el-input v-model="companyId" placeholder="会社をご入力ください。" clearable></el-input>
      </el-col>
      <el-col :span="2">
        <el-button icon="el-icon-search" @click="showDialog">選択</el-button>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <el-button icon="el-icon-search" @click="findEmployees" type="primary">検索</el-button>
        <el-button icon="el-icon-user-solid" @click="findEmployees" type="primary">新規</el-button>
        <el-button icon="el-icon-user-solid" @click="deleteAllSelected('/employee/deleteAll')" type="primary">全削除</el-button>
      </el-col>
    </el-row>

    <el-table :data="filteredEmployees" border style="width: 850px;margin-top: 10px;" height="250px"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column fixed prop="id" label="ID" width="80" header-align="center"></el-table-column>
      <el-table-column prop="name" label="名前" header-align="center"></el-table-column>
      <el-table-column prop="email" label="メール" header-align="center"></el-table-column>
      <el-table-column prop="department" label="部門" header-align="center"></el-table-column>
      <el-table-column fixed="right" label="動作" width="100" align="center">
        <template slot-scope="scope">
          <el-button @click="clickReference(scope.row)" type="text" size="small">参照</el-button>
          <el-button @click="clickEdit(scope.row)" type="text" size="small">編集</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 使用通用弹窗 -->
    <CommonSearchDialog
      :visible.sync="dialogVisible"
      :title="'社員選択画面'"
      :tableData="dialogData"
      :columns="dialogColumns"
      :filters="dialogFilters"
    />
  </div>
</template>

<script>
import axios from 'axios';
import CommonSearchDialog from "@/components/CommonSearchDialog.vue";
import {deleteAllSelected} from "@/js/ListView.js";

export default {
  name: "EmployeeListView",
  components: { CommonSearchDialog },
  data() {
    return {
      searchName: "",
      dialogVisible: false,
      dialogData: [
        { id: "1", name: "山田太郎", department: "営業" },
        { id: "2", name: "鈴木花子", department: "開発" },
        { id: "3", name: "田中一郎", department: "経理" },
      ],
      dialogColumns: [
        { prop: "id", label: "ID", width: "40px" },
        { prop: "name", label: "名前" , width: "80px"},
        { prop: "department", label: "部門" , width: "80px"},
      ],
      dialogFilters: [
  {
    prop: "name",
    label: "名前",
    type: "el-input",
    props: { placeholder: "名前を入力してください", clearable: true },
  },
  {
    prop: "department",
    label: "部門",
    type: "el-select",
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
      filteredEmployees: [],
    };
  },
  methods: {
    deleteAllSelected,
    showDialog() {
      this.dialogVisible = true;
    },
    async findEmployees() {
      try {
        const response = await axios.get('/employee/search', { params: { name: this.searchName } });
        this.filteredEmployees = response.data;
      } catch (error) {
        this.$message.error('データの取得に失敗しました' + error);
      }
    },
    clickReference(row) {
      alert(JSON.stringify(row));
    },
    clickEdit(row) {
      alert(JSON.stringify(row));
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.id);
    },
  },
  mounted() {
    this.filteredEmployees = this.employeeData;
  },
};
</script>

<style scoped>
.el-input {
  margin-bottom: 20px;
}
</style>
