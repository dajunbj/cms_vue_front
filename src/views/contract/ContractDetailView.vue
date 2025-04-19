<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit"></i> 契約参照画面
      </h2>
    </div>

    <div class="section-container">
      <el-form :model="form" :rules="rules" ref="contractForm" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="契約ID" prop="contract_id">
              <el-input v-model="form.contract_id" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="顧客名" prop="customer_name">
              <el-input v-model="form.customer_name" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="顧客電話番号" prop="customer_phone">
              <el-input v-model="form.customer_phone" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="社員タイプ" prop="employee_type">
              <el-select v-model="form.employee_type" disabled class="el-input-disabled">
                <el-option label="BP" value="1" />
                <el-option label="正社員" value="2" />
                <el-option label="すべて" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="責任者名" prop="responsible_name">
              <el-input v-model="form.responsible_name" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="社員電話番号" prop="phone_number">
              <el-input v-model="form.phone_number" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="責任者電話番号" prop="responsible_phone">
              <el-input v-model="form.responsible_phone" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="契約開始日" prop="start_date">
              <el-date-picker
                v-model="form.start_date"
                type="date"
                readonly
                class="el-input-disabled"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="契約終了日" prop="end_date">
              <el-date-picker
                v-model="form.end_date"
                type="date"
                readonly
                class="el-input-disabled"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="単価" prop="unit_price">
              <el-input v-model="form.unit_price" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="税率" prop="tax_rate">
              <el-input v-model="form.tax_rate" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="最低勤務時間" prop="working_hours_min">
              <el-input v-model="form.working_hours_min" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="最大勤務時間" prop="working_hours_max">
              <el-input v-model="form.working_hours_max" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="最大残業時間" prop="overtime_limit_hours">
              <el-input v-model="form.overtime_limit_hours" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="残業有無" prop="overtime_included">
              <el-radio disabled v-model="form.overtime_included" :label="1">ある</el-radio>
              <el-radio disabled v-model="form.overtime_included" :label="0">なし</el-radio>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="form.overtime_included === 1">
          <el-col :span="10">
            <el-form-item label="残業代開始時間" prop="overtime_start_time">
              <el-input v-model="form.overtime_start_time" readonly class="el-input-disabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" style="text-align: center; margin-top: 20px;">
            <el-button type="default" @click="goBack">戻る</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ContractEditView",
  data() {
    return {
      form: {
        contract_id: "",
        name: "",
        customer_phone: "",
        responsible_name: "",
        responsible_phone: "",
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
      },
      rules: {
        contract_id: [{ required: true, message: "契約IDを入力してください", trigger: "blur" }],
        name: [{ required: true, message: "名前を入力してください", trigger: "blur" }],
        customer_name: [{ required: true, message: "顧客名を入力してください", trigger: "blur" }],
        employee_type: [{ required: true, message: "社員タイプを選択してください", trigger: "change" }],
        phone_number: [{ required: true, message: "電話番号を入力してください", trigger: "blur" }],
        start_date: [{ required: true, message: "契約開始日を選択してください", trigger: "change" }],
        end_date: [{ required: true, message: "契約終了日を選択してください", trigger: "change" }],
        unit_price: [{ required: true, message: "単価を入力してください", trigger: "blur" }, { validator: this.demical102Check, trigger: "blur" }],
        tax_rate: [{ required: true, message: "税率を入力してください", trigger: "blur" }, { validator: this.demical42Check, trigger: "blur" }],
        working_hours_min: [{ required: true, message: "最低勤務時間を入力してください", trigger: "blur" }, { validator: this.demical52Check, trigger: "blur" }],
        working_hours_max: [{ required: true, message: "最大勤務時間を入力してください", trigger: "blur" }, { validator: this.demical52Check, trigger: "blur" }],
        overtime_limit_hours: [{ required: true, message: "最大残業時間を入力してください", trigger: "blur" }, { validator: this.demical52Check, trigger: "blur" }],
        overtime_start_time: [{ required: true, message: "残業代開始時間を入力してください", trigger: "blur" }, { validator: this.demical52Check, trigger: "blur" }],
        customer_phone: [{ required: true, message: "電話番号を入力してください", trigger: "blur" }],
        responsible_phone: [{ required: true, message: "電話番号を入力してください", trigger: "blur" }],
        responsible_name: [{ required: true, message: "姓名を入力してください", trigger: "blur" }],
      },
    };
  },
  created() {
    const contract_id = this.$route.params.id;
    this.fetchContractDetails(contract_id);
  },
  methods: {
    async fetchContractDetails(contract_id) {
      try {
        const response = await axios.get(`/contract/contractDetail/${contract_id}`);
        this.form = response.data;
        this.form.overtime_included = response.data.overtime_included ? 1 : 0;
      } catch (error) {
        this.$message.error("社員情報の取得に失敗しました");
      }
    },
    demical52Check(rule, value, callback) {
      const decimalPattern = /^-?\d{1,3}(\.\d{1,2})?$/;
      const numberValue = Number(value);
      if (!decimalPattern.test(value)) callback(new Error("正しい値を入力してください"));
      else if (numberValue > 999.99 || numberValue < -999.99) callback(new Error("正しいの値を入力してください"));
      else callback();
    },
    demical102Check(rule, value, callback) {
      const decimalPattern = /^-?\d{1,8}(\.\d{1,2})?$/;
      const numberValue = Number(value);
      if (!decimalPattern.test(value)) callback(new Error("正しい値を入力してください"));
      else if (numberValue > 99999999.99 || numberValue < -99999999.99) callback(new Error("正しいの値を入力してください"));
      else callback();
    },
    demical42Check(rule, value, callback) {
      const decimalPattern = /^-?\d{1,2}(\.\d{1,2})?$/;
      const numberValue = Number(value);
      if (!decimalPattern.test(value)) callback(new Error("正しい値を入力してください"));
      else if (numberValue > 9.99 || numberValue < -9.99) callback(new Error("正しいの値を入力してください"));
      else callback();
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
