<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <!-- 添加标题部分 -->
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit"></i> 契約編集画面
      </h2>
    </div>

    <!-- 表单部分 -->
    <div class="section-container">
      <el-form :model="form" :rules="rules" ref="contractForm" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="契約ID" prop="contract_id">
              <el-input v-model="form.contract_id" readonly class="el-input-disabled"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="顧客名" prop="customer_name">
              <el-input v-model="form.customer_name" placeholder="顧客名をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">
              <el-button  icon="el-icon-search" @click="showCustomerDialog"></el-button>
          </el-col>
          <el-col :span="3">
              <el-input v-model="form.customer_id" :disabled="true"></el-input>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="姓名をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">
              <el-button  icon="el-icon-search" @click="showEmployeeDialog"></el-button>
          </el-col>
          <el-col :span="3">
              <el-input v-model="form.employee_id" :disabled="true"></el-input>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="社員タイプ" prop="employee_type">
              <el-select v-model="form.employee_type" placeholder="社員タイプを選択してください" clearable>
                <el-option label="BP" value="1"></el-option>
                <el-option label="正社員" value="2"></el-option>
                <el-option label="すべて" value="3"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="契約開始日" prop="start_date">
              <el-date-picker
                v-model="form.start_date"
                type="date"
                placeholder="契約開始日を選択してください"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="契約終了日" prop="end_date">
              <el-date-picker
                v-model="form.end_date"
                type="date"
                placeholder="契約終了日を選択してください"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="単価" prop="unit_price">
              <el-input v-model="form.unit_price" placeholder="単価をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="税率" prop="tax_rate">
              <el-input v-model="form.tax_rate" placeholder="税率をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">%</el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="最低勤務時間" prop="working_hours_min">
              <el-input v-model="form.working_hours_min" placeholder="最低勤務時間をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="最大勤務時間" prop="working_hours_max">
              <el-input v-model="form.working_hours_max" placeholder="最大勤務時間をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="最大残業時間" prop="overtime_limit_hours">
              <el-input v-model="form.overtime_limit_hours" placeholder="最大残業時間をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
           <el-col :span="10">
             <el-form-item label="残業有無" prop="overtime_included">
               <el-radio v-model="form.overtime_included" :label="1">ある</el-radio>
               <el-radio v-model="form.overtime_included" :label="0">なし</el-radio>
             </el-form-item>
      </el-col>
        </el-row>

        <el-row :gutter="20" v-if="form.overtime_included===1">
          <el-col :span="10">
            <el-form-item label="残業代開始時間" prop="overtime_start_time">
              <el-input v-model="form.overtime_start_time" placeholder="開始時間をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" style="text-align: center; margin-top: 20px;">
            <el-button type="primary" :loading="isLoading" @click="submitForm">保存</el-button>
            <el-button type="default" @click="goBack">戻る</el-button>
          </el-col>
        </el-row> 
      <CaseSearchDialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :tableData="dialogData"
      :columns="dialogColumns"
      :filters="dialogFilters"
      :type="dialogType"
      @select-case="handleSelectCase" 
    /> 
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import CaseSearchDialog from "@/components/CaseSearchDialog.vue";

export default {
  name: "ContractEditView",
  components: { CaseSearchDialog },
  data() {
    return {
      form: {
        contract_id: "",
        name: "",
        employee_id: "",
        customer_name: "",
        employee_type: "",
        phone_number: "",
        start_date: "",
        end_date: "",
        unit_price: "",
        tax_rate: "",
        working_hours_min: "",
        working_hours_max: "",
        overtime_limit_hours: "",
        overtime_included: 0,
        overtime_start_time: "",
        case_id: "",
        responsible_id: "",
        update_time: "",
      },
      isLoading: false,
      dialogTitle: "",
      dialogVisible: false,
      dialogData: [],
      dialogColumns: [],
      dialogFilters: [],
      dialogType: "",

      rules: {
        contract_id: [
          { required: true, message: "契約IDを入力してください", trigger: "blur" },
        ],
        name: [
          { required: true, message: "名前を入力してください", trigger: "blur" },
        ],
        customer_name: [
          { required: true, message: "顧客名を入力してください", trigger: "blur" },
        ],
        employee_type: [
          { required: true, message: "社員タイプを選択してください", trigger: "change" },
        ],
        phone_number: [
          { required: true, message: "電話番号を入力してください", trigger: "blur" },
        ],
        start_date: [
          { required: true, message: "契約開始日を選択してください", trigger: "change" },
        ],
        end_date: [
          { required: true, message: "契約終了日を選択してください", trigger: "change" },
        ],
        unit_price: [
          { required: true, message: "単価を入力してください", trigger: "blur" },
          { validator: this.demical102Check, trigger: "blur" },
        ],
        tax_rate: [
          { required: true, message: "税率を入力してください", trigger: "blur" },
          { validator: this.demical42Check, trigger: "blur" },
        ],
        working_hours_min: [
          { required: true, message: "最低勤務時間を入力してください", trigger: "blur" },
          { validator: this.demical52Check, trigger: "blur" },
        ],
        working_hours_max: [
          { required: true, message: "最低勤務時間を入力してください", trigger: "blur" },
          { validator: this.demical52Check, trigger: "blur" },
        ],
        overtime_limit_hours: [
          { required: true, message: "最低勤務時間を入力してください", trigger: "blur" },
          { validator: this.demical52Check, trigger: "blur" },
        ],
        overtime_start_time: [
          { required: true, message: "最低勤務時間を入力してください", trigger: "blur" },
          { validator: this.demical52Check, trigger: "blur" },
        ],
      },
    };
  },
  created() {
    const contract_id = this.$route.params.id; // URL から ID を取得
    this.fetchContractDetails(contract_id);
  },
  methods: {
    showEmployeeDialog() {
      this.dialogVisible = true;
      this.dialogTitle="社員検索";
      this.dialogColumns= [
        { prop: "name", label: "社員名前", width: "220" },
        { prop: "employee_id", label: "社員ID", width: "220" },
      ];
      this.dialogFilters= [
        {
          prop: "name",
          label: "社員名前",
          type: "el-input",
          width: 300,
          props: { placeholder: "社員名前を入力してください", clearable: true},
        },];
        this.dialogType="employeeSearch";
    },

    showCustomerDialog() {
      this.dialogVisible = true;
      this.dialogTitle="顧客検索";
      this.dialogColumns= [
        { prop: "customer_name", label: "顧客名", width: "220" },
        { prop: "customer_id", label: "ユニーク識別子", width: "220" },
      ];
      this.dialogFilters= [
        {
          prop: "customer_name",
          label: "顧客名前",
          type: "el-input",
          width: 300,
          props: { placeholder: "顧客名前を入力してください", clearable: true},
        },];
        this.dialogType="customerSearch";
    },

    async handleSelectCase(selectedCase) {
      //PopUp画面戻り値の設定
      if(this.dialogTitle === "社員検索") {
        this.form.employee_id = selectedCase.employee_id;
        this.form.name = selectedCase.name;
      }else if(this.dialogTitle === "顧客検索"){
        this.form.customer_name = selectedCase.customer_name;
        this.form.customer_id= selectedCase.customer_id;
        this.form.responsible_id = selectedCase.responsible_id;
      }
    },
    async fetchContractDetails(contract_id) {
      try {
        const response = await axios.get(`/contract/contractDetail/${contract_id}`);
        this.form = response.data;
        this.form.overtime_included = response.data.overtime_included ? 1 : 0;
      } catch (error) {
        this.$message.error("社員情報の取得に失敗しました");
      }
    },

    dateCheck(rule, value, callback){
      const currentDate = new Date();
            if (new Date(value) < currentDate){
              callback(new Error("開始日は今日以降の日付を選択してください"));
            } 
            else{
              callback();
            }
    },

    demical52Check(rule, value, callback){
      const decimalPattern = /^-?\d{1,3}(\.\d{1,2})?$/;
      const numberValue = Number(value);
      if(!decimalPattern.test(value)){
        callback(new Error("正しい値を入力してください"));
      }
      else if (numberValue > 999.99 || numberValue < -999.99){
        callback(new Error("正しいの値を入力してください"));
      } 
      else{
        callback();
      }
    },

    demical102Check(rule, value, callback){
      const decimalPattern = /^-?\d{1,8}(\.\d{1,2})?$/;
      const numberValue = Number(value);
      if(!decimalPattern.test(value)){
        callback(new Error("正しい値を入力してください"));
      }
      else if (numberValue > 99999999.99 || numberValue < -99999999.99){
        callback(new Error("正しいの値を入力してください"));
      } 
      else{
        callback();
      }
    },

    demical42Check(rule, value, callback){
      const decimalPattern = /^-?\d{1,2}(\.\d{1,2})?$/;
      const numberValue = Number(value);
      if(!decimalPattern.test(value)){
        callback(new Error("正しい値を入力してください"));
      }
      else if (numberValue > 9.99 || numberValue < -9.99){
        callback(new Error("正しいの値を入力してください"));
      } 
      else{
        callback();
      }
    },
    async submitForm() {
      this.isLoading = true;
      this.$refs.contractForm.validate(async (valid) => {
        if(this.overtime_included === 0){
          this.form.overtime_start_time = "";
        }
        if (valid) {
          try {
            if(this.form.employee_type === "1"){
              this.form.employee_type = "BP";
            }
            else if(this.form.employee_type === "2"){
              this.form.employee_type = "正社員";
            }
            else{
              console.log(this.form.employee_type);
            }
            const response = await axios.put(`/contract/update`, this.form);
            if(response.data.status === "success"){
            this.$message.success("更新が成功しました") ;
            this.$router.push("/contract");
            }
            else if(response.data.status === "erro"){
              this.$message.error("更新に失敗しました: " + response.data.message);
            }
            else{
              this.$message.error("更新に失敗しました");
            }
          } catch (error) {
            this.$message.error("更新に失敗しました: " + error.message);
          }
        }
        else {
          this.$message.error("入力内容を確認してください");
        }
      });
      this.isLoading = false;
    },
    goBack() {
      this.$router.push("/contract");
    },
  },
};
</script>

<style scoped>
.el-input-disabled >>> .el-input__inner {
  background-color: lightgray !important;
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
</style>
