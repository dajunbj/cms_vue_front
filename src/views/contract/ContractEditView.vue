<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit"></i> 契約編集画面
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
              <el-input v-model="form.customer_name" placeholder="顧客名をご入力ください。" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="顧客ID">
              <div class="input-with-button">
                <el-input v-model="form.customer_id" placeholder="顧客ID" disabled />
                <el-button icon="el-icon-search" @click="showCustomerDialog" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="姓名をご入力ください。" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="社員ID">
              <div class="input-with-button">
                <el-input v-model="form.employee_id" placeholder="社員ID" disabled />
                <el-button icon="el-icon-search" @click="showEmployeeDialog" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="社員タイプ" prop="employee_type">
              <el-select v-model="form.employee_type" placeholder="社員タイプを選択してください" clearable>
                <el-option label="BP" value="1" />
                <el-option label="正社員" value="2" />
                <el-option label="すべて" value="3" />
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
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="契約終了日" prop="end_date">
              <el-date-picker
                v-model="form.end_date"
                type="date"
                placeholder="契約終了日を選択してください"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="単価" prop="unit_price">
              <el-input v-model="form.unit_price" placeholder="単価をご入力ください。" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="税率" prop="tax_rate">
              <el-input v-model="form.tax_rate" placeholder="税率をご入力ください。" clearable>
                <template slot="suffix">%</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="最低勤務時間" prop="working_hours_min">
              <el-input v-model="form.working_hours_min" placeholder="最低勤務時間をご入力ください。" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="最大勤務時間" prop="working_hours_max">
              <el-input v-model="form.working_hours_max" placeholder="最大勤務時間をご入力ください。" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="最大残業時間" prop="overtime_limit_hours">
              <el-input v-model="form.overtime_limit_hours" placeholder="最大残業時間をご入力ください。" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="残業有無" prop="overtime_included">
              <el-radio v-model="form.overtime_included" :label="1">ある</el-radio>
              <el-radio v-model="form.overtime_included" :label="0">なし</el-radio>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="form.overtime_included === 1">
          <el-col :span="10">
            <el-form-item label="残業代開始時間" prop="overtime_start_time">
              <el-input v-model="form.overtime_start_time" placeholder="開始時間をご入力ください。" clearable />
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
        customer_id: "",
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
        name: [{ required: true, message: "名前を入力してください", trigger: "blur" }],
        customer_name: [{ required: true, message: "顧客名を入力してください", trigger: "blur" }],
        employee_type: [{ required: true, message: "社員タイプを選択してください", trigger: "change" }],
        start_date: [{ required: true, message: "契約開始日を選択してください", trigger: "change" }],
        end_date: [{ required: true, message: "契約終了日を選択してください", trigger: "change" }],
        unit_price: [
          { required: true, message: "単価を入力してください", trigger: "blur" },
          { validator: (_, value, callback) => validateDecimal(value, 8, 2, callback) }
        ],
        tax_rate: [
          { required: true, message: "税率を入力してください", trigger: "blur" },
          { validator: (_, value, callback) => validateDecimal(value, 2, 2, callback) }
        ],
        working_hours_min: [
          { required: true, message: "最低勤務時間を入力してください", trigger: "blur" },
          { validator: (_, value, callback) => validateDecimal(value, 3, 2, callback) }
        ],
        working_hours_max: [
          { required: true, message: "最大勤務時間を入力してください", trigger: "blur" },
          { validator: (_, value, callback) => validateDecimal(value, 3, 2, callback) }
        ],
        overtime_limit_hours: [
          { required: true, message: "最大残業時間を入力してください", trigger: "blur" },
          { validator: (_, value, callback) => validateDecimal(value, 3, 2, callback) }
        ],
        overtime_start_time: [
          {
            required: true,
            message: "残業代開始時間を入力してください",
            trigger: "blur",
            validator: (_, value, callback) => validateDecimal(value, 3, 2, callback),
          },
        ],
      }
    };
  },

  created() {
    const contract_id = this.$route.params.id;
    if (contract_id) {
      this.fetchContractDetails(contract_id);
    }
  },

  methods: {
    async fetchContractDetails(contract_id) {
      try {
        const res = await axios.get(`/contract/contractDetail/${contract_id}`);
        this.form = res.data;
        this.form.overtime_included = res.data.overtime_included ? 1 : 0;
      } catch (error) {
        this.$message.error("契約情報の取得に失敗しました");
      }
    },

    async submitForm() {
      this.isLoading = true;
      this.$refs.contractForm.validate(async (valid) => {
        if (this.form.overtime_included === 0) {
          this.form.overtime_start_time = "";
        }

        if (valid) {
          try {
            const response = await axios.put("/contract/update", this.form);
            if (response.data.status === "success") {
              this.$message.success("更新が成功しました");
              this.$router.push("/contract");
            } else {
              this.$message.error("更新に失敗しました: " + (response.data.message || ""));
            }
          } catch (error) {
            this.$message.error("更新に失敗しました: " + error.message);
          }
        } else {
          this.$message.error("入力内容を確認してください");
        }
        this.isLoading = false;
      });
    },

    goBack() {
      this.$router.push("/contract");
    },

    showCustomerDialog() {
      this.dialogVisible = true;
      this.dialogTitle = "顧客検索";
      this.dialogType = "customerSearch";
      this.dialogColumns = [
        { prop: "customer_name", label: "顧客名", width: "200" },
        { prop: "customer_id", label: "顧客ID", width: "200" }
      ];
      this.dialogFilters = [
        {
          prop: "customer_name",
          label: "顧客名",
          type: "el-input",
          width: 200,
          props: { placeholder: "顧客名を入力してください", clearable: true }
        }
      ];
    },

    showEmployeeDialog() {
      this.dialogVisible = true;
      this.dialogTitle = "社員検索";
      this.dialogType = "employeeSearch";
      this.dialogColumns = [
        { prop: "name", label: "氏名", width: "200" },
        { prop: "employee_id", label: "社員ID", width: "200" }
      ];
      this.dialogFilters = [
        {
          prop: "name",
          label: "氏名",
          type: "el-input",
          width: 200,
          props: { placeholder: "社員名を入力してください", clearable: true }
        }
      ];
    },

    handleSelectCase(selectedCase) {
      if (this.dialogType === "employeeSearch") {
        this.form.employee_id = selectedCase.employee_id;
        this.form.name = selectedCase.name;
      } else if (this.dialogType === "customerSearch") {
        this.form.customer_id = selectedCase.customer_id;
        this.form.customer_name = selectedCase.customer_name;
        this.form.responsible_id = selectedCase.responsible_id;
      }
      this.dialogVisible = false;
    }
  }
};

// 共通小数バリデーション関数
function validateDecimal(value, maxDigits, maxDecimals, callback) {
  const pattern = new RegExp(`^-?\\d{1,${maxDigits}}(\\.\\d{1,${maxDecimals}})?$`);
  const num = Number(value);
  const max = parseFloat('9'.repeat(maxDigits) + '.' + '9'.repeat(maxDecimals));
  const min = -max;

  if (!pattern.test(value)) {
    callback(new Error("正しい値を入力してください"));
  } else if (num > max || num < min) {
    callback(new Error(`±${max} の範囲で入力してください`));
  } else {
    callback();
  }
}
</script>



<style scoped>
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
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.input-with-button {
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-with-button .el-input {
  flex: 1;
}
</style>
