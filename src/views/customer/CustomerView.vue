<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user"></i> 総合一覧画面
      </h2>
    </div>
    <!-- 标签页主体 -->
    <div class="section-container">
      <el-tabs v-model="tabsController" @click="handleTabsClick">
        <!--顾客一览标签-->
        <el-tab-pane label="顧客一覧" name="customer" :disabled="isLoading">
           <div class="section-container">
              <el-form :model="customerForm" :rules="rules" ref="customerForm" label-width="150px">
                <el-row>
                  <el-col :span="10">
                    <el-form-item label="顧客名" prop="customer_name">
                      <el-input v-model="customerForm.customer_name" placeholder="顧客名" clearable></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                    <el-form-item label="顧客タイプ" prop="customer_type">
                      <el-radio v-model="customerForm.customer_type" label="個人">個人</el-radio>
                      <el-radio v-model="customerForm.customer_type" label="法人">法人</el-radio>
                      <el-radio v-model="customerForm.customer_type" label="すべて">すべて</el-radio>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="10">
                    <el-form-item label="顧客代表者名" prop="customer_represent">
                      <el-input v-model="customerForm.customer_represent" placeholder="顧客代表者名" clearable></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                    <el-form-item label="顧客住所" prop="customer_address">
                      <el-input v-model="customerForm.customer_address" placeholder="顧客住所" clearable></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="3">
                    <el-button icon="el-icon-search" @click="findCustomer" type="primary" :loading="isLoading">検索</el-button>
                  </el-col>
                  <el-col :span="3">
                    <el-button icon="el-icon-plus" @click="createCustomer" type="primary" :disabled="isLoading">新規</el-button>
                   </el-col>
                </el-row>
           <div class="section-container">
              <el-row>
                <el-col :span="24">
                  <el-table :data="customerForm.filteredCustomer" border style="width: 100%; margin-top: 20px;" height="300px" @selection-change="handleSelectionChange">
                    <el-table-column label="顧客ID" header-align="center" align="center">
                      <template slot-scope="scope">
                        <el-button @click="handleCustomerIdClick(scope.row)" type="text" size="small">{{ scope.row.customer_id }}</el-button>
                      </template>
                    </el-table-column>
                    <el-table-column prop="customer_name" label="顧客名" header-align="center" align="center"></el-table-column>
                    <el-table-column prop="customer_represent" label="顧客代表者名" header-align="center" align="center"></el-table-column>
                    <el-table-column prop="customer_type" label="顧客タイプ" header-align="center" align="center"></el-table-column>
                    <el-table-column prop="customer_address" label="顧客住所" header-align="center" align="center"></el-table-column>
                    <el-table-column prop="customer_phone" label="顧客電話番号" header-align="center" align="center"></el-table-column>
                    <el-table-column label="アクション" align="center">
                      <template slot-scope="scope">
                        <el-button @click="clickCustomerDetail(scope.row)" type="text" size="small">明細</el-button>
                        <el-button @click="clickCustomerEdit(scope.row)" type="text" size="small">編集</el-button>
                        <el-button @click="showCustomerDeleteDialog(scope.row)" type="text" size="small">削除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  
                  <!-- 翻页组件 -->
                  <el-pagination
                    style="margin-top: 20px; text-align: center;"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    :current-page.sync="customerForm.currentPage"
                    :page-size.sync="customerForm.pageSize"
                    :page-sizes="[10, 20, 50, 100, 200]" 
                    :total="customerForm.totalCustomer"
                    @current-change="handleCustomerPageChange"
                    @size-change="handleCustomerSizeChange">
                  </el-pagination>
                </el-col>
              </el-row>
            </div>
              </el-form>
                <!-- 删除确认弹窗 -->
                  <el-dialog
                    title="確認"
                    :visible.sync="deleteCustomerDialogVisible"
                    width="30%"
                    @close="closeCustomerDeleteDialog">
                    <span>選択したレコードを削除しますか？</span>
                    <span slot="footer" class="dialog-footer">
                      <el-button @click="handleCustomerDeleteDialogCancel">キャンセル</el-button>
                      <el-button type="primary" @click="handleCustomerDeleteDialogConfirm">確認</el-button>
                    </span>
                  </el-dialog>
            </div>
        </el-tab-pane>
        <el-tab-pane label="責任者一覧" name="responsible" :disabled="isLoading">
          <div class="section-container">
              <el-form :model="responsibleForm" :rules="rules" ref="responsibleForm" label-width="150px">
                <el-row>
                  <el-col :span="10">
                    <el-form-item label="責任者名" prop="responsible_name">
                      <el-input v-model="responsibleForm.responsible_name" placeholder="責任者名" clearable></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                    <el-form-item label="顧客名" prop="customer_name">
                      <el-input v-model="responsibleForm.customer_name" placeholder="顧客名" clearable></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="1">
                        <el-button  icon="el-icon-search" @click="showDialog"></el-button>
                    </el-col>
                  <el-col :span="1">
                        <el-input v-model="responsibleForm.customer_id" :disabled="true"></el-input>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="3">
                    <el-button icon="el-icon-search" @click="findResponsible" type="primary" :loading="isLoading">検索</el-button>
                  </el-col>
                  <el-col :span="3">
                    <el-button icon="el-icon-plus" @click="createResponsible" type="primary" :disabled="isLoading">新規</el-button>
                   </el-col>
                </el-row>
           <div class="section-container">
              <el-row>
                <el-col :span="24">
                  <el-table :data="responsibleForm.filteredResponsible" border style="width: 100%; margin-top: 20px;" height="300px" @selection-change="handleSelectionChange">
                    <el-table-column prop="responsible_id" label="責任者ID" header-align="center" align="center"></el-table-column>
                    <el-table-column prop="responsible_name" label="責任者名" header-align="center" align="center"></el-table-column>
                    <el-table-column label="対応顧客名" header-align="center" align="center">
                      <template slot-scope="scope">
                        <el-button @click="handleNameClick(scope.row)" type="text" size="small">{{ scope.row.customer_name }}</el-button>
                      </template>
                    </el-table-column>
                    <el-table-column prop="department_name" label="部門名" header-align="center" align="center"></el-table-column>
                    <el-table-column prop="responsible_type" label="責任者の役割" header-align="center" align="center"></el-table-column>
                    <el-table-column v-if="isEmployee" prop="name" label="対応社員" header-align="center" align="center"></el-table-column>
                    <el-table-column label="アクション" align="center">
                      <template slot-scope="scope">
                        <el-button @click="clickResponsibleDetail(scope.row)" type="text" size="small">明細</el-button>
                        <el-button @click="clickResponsibleEdit(scope.row)" type="text" size="small">編集</el-button>
                        <el-button @click="showResponsibleDeleteDialog(scope.row)" type="text" size="small">削除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  
                  <!-- 翻页组件 -->
                  <el-pagination
                    style="margin-top: 20px; text-align: center;"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    :current-page.sync="responsibleForm.currentPage"
                    :page-size.sync="responsibleForm.pageSize"
                    :page-sizes="[10, 20, 50, 100, 200]" 
                    :total="responsibleForm.totalResponsible"
                    @current-change="handleResponsiblePageChange"
                    @size-change="handleResponsibleSizeChange">
                  </el-pagination>
                </el-col>
              </el-row>
            </div>
              </el-form>
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
                  :visible.sync="deleteResponsibleDialogVisible"
                  width="30%"
                  @close="closeResponsibleDeleteDialog">
                  <span>選択したレコードを削除しますか？</span>
                  <span slot="footer" class="dialog-footer">
                    <el-button @click="handleResponsibleDeleteDialogCancel">キャンセル</el-button>
                    <el-button type="primary" @click="handleResponsibleDeleteDialogConfirm">確認</el-button>
                  </span>
                </el-dialog>
            </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import CaseSearchDialog from "@/components/CaseSearchDialog.vue";
import axios from 'axios';
export default {
  name: "CustomerView",
  components: { CaseSearchDialog },
  data() {
    return {
      customerForm: {
        customer_id: "",
        customer_name: "",
        customer_type: "すべて",
        customer_represent: "",
        customer_address: "",
        filteredCustomer: [],
        customerData: [],
        totaltotalCustomer: 0,
        currentPage: 1,
        pageSize: 10,
        totalCustomer: 0,
      },
      responsibleForm: {
        responsible_name: "",
        customer_name: "",
        customer_id: "",
        filteredResponsible: [],
        responsibleData: [],
        totalResponsible: 0,
        currentPage: 1,
        pageSize: 10,
      },
      dialogVisible: false,
            dialogData: [],
            dialogColumns: [
                    { prop: "customer_name", label: "顧客名", width: "220" },
                    { prop: "customer_id", label: "ユニーク識別子", width: "220" },
                ],
                dialogFilters: [
                    {
                    prop: "customer_name",
                    label: "顧客名",
                    type: "el-input",
                    width: 300,
                    props: { placeholder: "顧客名を入力してください", clearable: true },
                    },
                ],
            dialogType: "customerSearch",
      employee_id: sessionStorage.getItem("id"),
      deleteCustomerDialogVisible: false,
      deleteResponsibleDialogVisible: false,
      tabsController: "customer",
      isLoading: false,

      rules: {
      }
    }
  },

  computed: {
    //通用判断身份
    isEmployee() {
      const right = sessionStorage.getItem("right");
      console.log(right);
      if(right === "営業員"){
        return false;
      }else{
        return true;
      }
    },
  },

  methods: {
    //标签页切换
    handleTabsClick(tab, event) {
      console.log(tab, event);
    },

     //处理选中项目（暂时无用）
     handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.contract_id);
    },
    
    //初期化
    mounted() {
    this.customerForm.filteredCustomer = this.customerForm.customerData;
    this.responsibleForm.filteredResponsible = this.responsibleForm.responsibleData;
    },

    //显示pop画面
    showDialog() {
      this.dialogVisible = true;
    },

    //选择ID点击
    async handleSelectCase(selectedCase) {
      //PopUp画面戻り値の設定
      this.responsibleForm.customer_id = selectedCase.customer_id;
      this.responsibleForm.customer_name = selectedCase.customer_name;
      this.dialogVisible = false;
    },

    //------------------------------------------------------顾客一览控制------------------------------------------------------------
    //检索顾客
    async findCustomer() {
      this.isLoading = true;
      if(this.customerForm.customer_type === "すべて"){
        this.customerForm.customer_type = "";
      }
      try{
        const response = await axios.post('/customer/searchCustomer', {
          customer_name: this.customerForm.customer_name,
          customer_type: this.customerForm.customer_type,
          customer_represent: this.customerForm.customer_represent,
          customer_address: this.customerForm.customer_address,
          currentPage: this.customerForm.currentPage,
          pageSize: this.customerForm.pageSize,
        });
        this.customerForm.filteredCustomer = response.data.data; // 使用返回的分页数据
        this.customerForm.totalCustomer = response.data.total; // 设置总条目数
        this.isLoading = false;
      }
      catch (error) {
        this.$message.error('データの取得に失敗しました' + error);
      }             
    },
    
    //顾客翻页
    handleCustomerPageChange(page) {
      this.customerForm.currentPage = page;
      this.findCustomer(); 
    },

    //顾客每页条数
    handleCustomerSizeChange(size) {
      this.customerForm.pageSize = size;
      this.customerForm.currentPage = 1; // 重置为第一页
      this.findCustomer(); // 重新调用查询方法
    },

    //新建
    createCustomer() {
      this.$router.push('/customer/register');
    },

    //顾客ID点击
    handleCustomerIdClick(row) {
      this.tabsController = 'responsible';
      this.responsibleForm.customer_id = row.customer_id;
    },

    //顾客编辑
    clickCustomerEdit(row) {
      this.$router.push({ path: `/customer/edit/${row.customer_id}` }); 
    },

    //顾客明细
    clickCustomerDetail(row) {
      this.$router.push({ path: `/customer/detail/${row.customer_id}` });
    },

    //顾客删除弹窗
    showCustomerDeleteDialog(row) {
      this.deleteCustomerDialogVisible = true;
      this.selectedRow = row;
    },

    //顾客删除弹窗关闭
    closeCustomerDeleteDialog() {
      this.deleteCustomerDialogVisible = false;
    },

    //顾客删除取消
    handleCustomerDeleteDialogCancel(){
      this.deleteCustomerDialogVisible = false;
    },

    //顾客删除确认
    handleCustomerDeleteDialogConfirm() {
      this.deleteCustomerDialogVisible = false;
      this.deleteSelectedCustomerRow();
    },
    
    //删除顾客方法
    async deleteSelectedCustomerRow() {
      try {
        const response = await axios.post('/customer/deleteCustomer', {
          customer_id: this.selectedRow.customer_id,
          updated_at: this.selectedRow.updated_at,
        });
        if (response.data.status === 'success') {
          this.$message.success(response.data.message);
          this.findCustomer();
        } else {
          this.$message.error(response.data.message);
        }
      } catch (error) {
        this.$message.error('操作失敗しました:'+ (error.response?.data?.message || error.message));
      }
    },

    //----------------------------------------------------负责人控制------------------------------------------------------------------
    //负责人检索
    async findResponsible() {
      this.isLoading = true;
      try{
        const response = await axios.post('/customer/searchResponsible', {
          responsible_name:this.responsibleForm.responsible_name,
          customer_id:this.responsibleForm.customer_id,
          currentPage: this.responsibleForm.currentPage,
          pageSize: this.responsibleForm.pageSize,
        });
        this.responsibleForm.filteredResponsible = response.data.data; // 使用返回的分页数据
        this.responsibleForm.totalResponsible = response.data.total; // 设置总条目数
        this.isLoading = false;
      }
      catch (error) { 
        this.$message.error('データの取得に失敗しました' + error);
      }             
    },

    //负责人翻页
    handleResponsiblePageChange(page) {
      this.responsibleForm.currentPage = page;
      this.findCustomer(); 
    },

    //负责人每页条数
    handleResponsibleSizeChange(size) {
      this.responsibleForm.pageSize = size;
      this.responsibleForm.currentPage = 1; // 重置为第一页
      this.findCustomer(); // 重新调用查询方法
    },

    //新建负责人
    createResponsible() {
      this.$router.push('/customer/registerRes');
    },

    //负责人编辑
    clickResponsibleEdit(row) {
      this.$router.push({ path: `/customer/editRes/${row.responsible_id}` }); 
    },

    //责任人明细
    clickResponsibleDetail(row) {
      this.$router.push({ path: `/customer/detailRes/${row.responsible_id}` });
    },

    //负责人名字点击
    handleNameClick(row) {
      this.tabsController = 'customer';
      this.customerForm.customer_name = row.customer_name;
    },

    
    //负责人删除弹窗
    showResponsibleDeleteDialog(row) {
      this.deleteResponsibleDialogVisible = true;
      this.selectedRow = row;
    },

    //负责人删除弹窗关闭
    closeResponsibleDeleteDialog() {
      this.deleteResponsibleDialogVisible = false;
    },

    //负责人删除取消
    handleResponsibleDeleteDialogCancel(){
      this.deleteResponsibleDialogVisible = false;
    },

    //负责人删除确认
    handleResponsibleDeleteDialogConfirm() {
      this.deleteResponsibleDialogVisible = false;
      this.deleteSelectedResponsibleRow();
    },
    
    //删除负责人方法
    async deleteSelectedResponsibleRow() {
      try {
        const response = await axios.post('/customer/deleteResponsible', {
          responsible_id: this.selectedRow.responsible_id,
          updated_at: this.selectedRow.updated_at,
        });
        if (response.data.status === 'success') {
          this.$message.success(response.data.message);
          this.findResponsible();
        } else {
          this.$message.error(response.data.message);
        }
      } catch (error) {
        this.$message.error('操作失敗しました:'+ (error.response?.data?.message || error.message));
      }
    },

  }
}
</script>