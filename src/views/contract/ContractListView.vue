<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <!-- 添加标题部分 -->
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user"></i> 契約管理画面
      </h2>
    </div>
    <div class="section-container">
      <el-form :model="form" :rules="rules" ref="contractForm" label-width="150px">
    <el-row>
      <el-col :span="10">
        <el-form-item label="社員名" prop="employeeName">
          <el-input v-model="form.employeeName" placeholder="姓名" clearable></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="責任者名" prop="responsibleName">
          <el-input v-model="form.responsibleName" placeholder="責任者名" clearable></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>  
      <el-col :span="10">
        <el-form-item label="顧客名" prop="customer_name">
          <el-input v-model="form.customerName" placeholder="顧客名" clearable></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="社員種別" prop="employeeType">
            <el-radio v-model="form.employeeType" label="1">BP</el-radio>
            <el-radio v-model="form.employeeType" label="2">正社員</el-radio>
            <el-radio v-model="form.employeeType" label="3">すべて</el-radio>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>  
      
      <el-col :span="10">
        <el-form-item label="契約開始日" prop="startDate">
            <el-date-picker v-model="form.startDate" type="date" placeholder="契約開始日"></el-date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item label="案件"></el-form-item>
      </el-col>
      <el-col :span="1">
        <el-button  icon="el-icon-search" @click="showDialog"></el-button>
      </el-col>
      <el-col :span="3">
        <el-input v-model="form.case_id" :disabled="true"></el-input>
      </el-col>
    </el-row>

    <el-row>  
      <el-col :span="10">
        <el-form-item label="契約終了日" prop="startDate">
            <el-date-picker v-model="form.finishDate" type="date" placeholder="契約終了日"></el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>



    <el-row>
      <el-col :span="3">
        <el-button icon="el-icon-search" @click="findContracts" type="primary">検索</el-button>
      </el-col>
      <el-col :span="3">
        <el-button icon="el-icon-plus" @click="createRecord" type="primary">新規</el-button>
      </el-col>
      <el-col :span="3">
        <el-date-picker v-model="finishManual" placeholder="終了日期" clearable>
        </el-date-picker>
      </el-col>
      <el-col :span="3" :offset="3">
        <el-button icon="el-icon-coffee-cup" :loading="isEndLoading" @click="finishAll" type="primary">終了</el-button>
      </el-col>
      <el-col :span="4">
        <el-date-picker v-model="extendAll" placeholder="延長日期" clearable>
          </el-date-picker>
      </el-col>
      <el-col :span="3" :offset="1">
        <el-button icon="el-icon-timer" :loading="isExtendLoading" @click="extend" type="primary">延期</el-button>
      </el-col>
    </el-row>
  </el-form>
</div>
    <!-- 检索结果和翻页部分 -->
    <div class="section-container">

    <el-row>
      <el-col :span="24">
        <el-table :data="filteredContracts" border style="width: 100%; margin-top: 20px;" height="300px" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="姓名" header-align="center" align="center">
             <template slot-scope="scope">
               <el-button @click="handleNameClick(scope.row)" type="text" size="small">{{ scope.row.name }}</el-button>
             </template>
      </el-table-column>
          <el-table-column prop="customer_name" label="顧客名" header-align="center" align="center"></el-table-column>
          <el-table-column prop="start_date" label="契約開始日" header-align="center" align="center"></el-table-column>
          <el-table-column prop="end_date" label="契約終了日" header-align="center" align="center"></el-table-column>
          <el-table-column prop="unit_price" label="単価" header-align="center" align="center"></el-table-column>
          <el-table-column prop="responsible_name" label="顧客責任者" header-align="center" align="center"></el-table-column>
          <el-table-column prop="employee_type" label="社員タイプ" header-align="center" align="center"></el-table-column>
          <el-table-column label="アクション" align="center">
            <template slot-scope="scope">
              <el-button v-if="isDateValid(scope.row.start_date,scope.row.end_date)" @click="clickEdit(scope.row)" type="text" size="small">編集</el-button>
              <el-button v-if="isDateValid(scope.row.start_date,scope.row.end_date)" @click="showDeleteDialog(scope.row)" type="text" size="small">削除</el-button>
              <el-button @click="clickCopy(scope.row)" type="text" size="small">复写</el-button>
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
    <CaseSearchDialog
      :visible.sync="dialogVisible"
      :title="'案件選択画面'"
      :tableData="dialogData"
      :columns="dialogColumns"
      :filters="dialogFilters"
      :type="dialogType"
      @select-case="handleSelectCase" 
    />
    <!-- 删除确认弹窗 -->
    <el-dialog
      title="確認"
      :visible.sync="deleteDialogVisible"
      width="30%"
      @close="closeDeleteDialog">
      <span>選択したレコードを削除しますか？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDeleteDialogCancel">キャンセル</el-button>
        <el-button type="primary" @click="handleDeleteDialogConfirm">確認</el-button>
      </span>
    </el-dialog>

  </div>
  </div>
</template>

<script>
import axios from 'axios';
import CaseSearchDialog from "@/components/CaseSearchDialog.vue";
import { deleteAllSelected } from "@/js/ListView.js";

export default {
  name: "ContractListView",
  components: { CaseSearchDialog },
  data() {
    return {
      form:{
      contract_id: "",
      case_id: "",
      employeeType: "3",
      pickerOptions:{
        disabledDate: (time) => {
          return time.getTime() > Date.now();
        }},
      startDate: "",
      finishDate: "",
      customerName: "",
      responsibleName: "",
      employeeName: "",
      companyName: "",
      case_title: "",
      update_time: "",
    },
      finishManual: "",
      extendAll: "",
      dialogVisible: false,
      deleteDialogVisible: false,
      dialogData: [],
      dialogColumns: [
        { prop: "case_title", label: "案件名", width: "220" },
        { prop: "case_id", label: "案件のユニーク識別子", width: "220" },
      ],
      dialogFilters: [
        {
          prop: "case_title",
          label: "案件名",
          type: "el-input",
          width: 300,
          props: { placeholder: "案件名を入力してください", clearable: true },
        },
      ],
      dialogType: "caseSearch",
      contractData: [],
      currentPage: 1, // 当前页
      pageSize: 10, // 每页数量
      totalEmployees: 0, // 总条目数
      filteredContracts: [],
      isEndLoading: false,
      isExtendLoading: false,

      
    };
  },
  methods: {
    deleteAllSelected,//外部のメソッドを呼び出す
    showDialog() {
      this.dialogVisible = true;
    },

    isDateValid(start_date,end_date){
      const currentDate = new Date();
      const start = new Date(start_date);
      const end = new Date(end_date);
      if(currentDate > start && currentDate < end){
        return false;
      }else{
        return true;
      }
    },

    async findContracts() {
      try {
        const response = await axios.post('/contract/search', {
        name: this.form.employeeName,
        customer_name: this.form.customerName,
        responsible_name: this.form.responsibleName,
        start_date: this.form.startDate,
        end_date: this.form.finishDate,
        employee_type: this.form.employeeType,
        currentPage: this.currentPage, // 当前页
        pageSize: this.pageSize, // 每页数量
        });
        this.filteredContracts = response.data.data; // 使用返回的分页数据
        this.totalEmployees = response.data.total; // 设置总条目数
      } catch (error) {
        this.$message.error('データの取得に失敗しました' + error);
      }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    },
    async handleSelectCase(selectedCase) {
      try{
        const response = await axios.post('/contract/searchCustomer', {
        custom_id: selectedCase.customer_id,
        });
        this.form.customerName = response.data.data[0].customer_name;
        this.form.responsibleName = response.data.data[0].responsible_name;
      }
      catch(error){
        this.$message.error('データの取得に失敗しました' + error);
      }
      //PopUp画面戻り値の設定
      
      this.form.case_id = selectedCase.case_id;
    },
    clickEdit(row) {
      this.$router.push({ path: `/contract/edit/${row.contract_id}` }); // 跳转编辑画面
    },

    clickCopy(row) {
      this.$router.push({ path: `/contract/register/${row.contract_id}` }); // 跳转复制画面
    },
    
    handleNameClick(row) {
      this.$router.push({ path: `/contract/detail/${row.contract_id}` });  // 跳转明细画面
    },


    showDeleteDialog(row) {
      this.deleteDialogVisible = true;
      this.selectedRow = row;
    },

    closeDeleteDialog() {
      this.deleteDialogVisible = false;
    },

    handleDeleteDialogCancel(){
      this.deleteDialogVisible = false;
    },
    
    handleDeleteDialogConfirm() {
      this.deleteDialogVisible = false;
      this.deleteSelectedRow();
    },

    async deleteSelectedRow() {
      try {
        const response = await axios.post('/contract/deleteSelected', {
          contract_id: this.selectedRow.contract_id,
          update_time: this.selectedRow.update_time,
        });
        if (response.data.status === 'success') {
          this.$message.success(response.data.message);
          this.findContracts();
        } else {
          this.$message.error(response.data.message);
        }
      } catch (error) {
        this.$message.error('操作失敗しました:'+ (error.response?.data?.message || error.message));
      }
    },

    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.contract_id);
    },
    createRecord() {
      this.$router.push('/contract/register');
    },

    async finishAll() {
      this.isEndLoading = true;
  try {
    
    if (!Array.isArray(this.multipleSelection) || this.multipleSelection.length === 0) {
      this.$message.error('選択された契約がありません。');
      return;
    }
    const requestData = this.multipleSelection.map(contractId => ({
    contract_id: contractId,
    end_date: this.finishManual,
  }));
    if(requestData.length === 0) {
      this.$message.error('選択された契約がありません。');
      return;
    }
  const response = await axios.post('/contract/finishManual', requestData);
  if (response.data.status === 'success') {
    this.$message.success(response.data.message);
    this.findContracts();
  } else {
    this.$message.error(response.data.message);
  }
} catch (error) {
  this.$message.error('操作失敗しました: ' + (error.response?.data?.message || error.message));
}
this.isEndLoading = false;
},

async extend(){
  this.isExtendLoading = true;
  try {
      if (!Array.isArray(this.multipleSelection) || this.multipleSelection.length === 0) {
      this.$message.error('選択された契約がありません。');
      return;
    }
    const requestData = this.multipleSelection.map(contractId => ({
    contract_id: contractId,
    end_date: this.extendAll
  }));  
  const response = await axios.post('/contract/extendManual', requestData);
  if (response.data.status === 'success') {
    this.$message.success(response.data.message);
    this.findContracts();
  } else {
    this.$message.error(response.data.message);
  }
  } catch (error) {
  this.$message.error('操作失敗しました: ' + (error.response?.data?.message || error.message));
  }
  this.isExtendLoading = false;
  },

    // 页码改变事件
    handlePageChange(page) {
      this.currentPage = page;
      this.findContracts(); // 重新调用查询方法
    },

    // 每页数量改变事件
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1; // 重置为第一页
      this.findContracts(); // 重新调用查询方法
    },
  },
  mounted() {
    this.filteredContracts = this.contractData;
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
