<template>
  <div class="p-4">
    <el-card>
      <template #header>領収書 編集</template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="発行先" prop="issuer">
          <el-input v-model="form.issuer" />
        </el-form-item>
        <el-form-item label="発行日" prop="issueDate">
          <el-date-picker v-model="form.issueDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="金額" prop="amount">
          <el-input v-model.number="form.amount" />
        </el-form-item>
      </el-form>

      <div style="text-align:right">
        <el-button @click="goBack">戻る</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const formRef = ref()
const form = ref({ id, issuer: '', issueDate: '', amount: null })
const saving = ref(false)

const rules = {
  issuer: [{ required: true, message: '発行先は必須です', trigger: 'blur' }],
  issueDate: [{ required: true, message: '発行日を選択してください', trigger: 'change' }],
  amount: [
    { required: true, message: '金額は必須です', trigger: 'blur' },
    { validator: (_, v, cb) => Number.isInteger(v) && v >= 0 ? cb() : cb(new Error('0以上の整数')), trigger: 'blur' }
  ]
}

const load = async () => {
  try {
    const { data } = await api.get(`/ocr/receipts/${id}`)
    form.value.issuer = data.issuer || ''
    form.value.issueDate = data.issueDate || ''
    form.value.amount = data.amount ?? 0
  } catch (e) {
    console.error(e)
    ElMessage.error('詳細の取得に失敗しました')
  }
}

const save = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    await api.put(`/ocr/receipts/${id}`, {
      issuer: form.value.issuer,
      issueDate: form.value.issueDate,
      amount: form.value.amount
    })
    ElMessage.success('保存しました')
    router.push('/expense/receipt-list')
  } catch (e) {
    if (e?.message) console.warn(e.message)
    else {
      console.error(e)
      ElMessage.error('保存に失敗しました')
    }
  } finally {
    saving.value = false
  }
}

const goBack = () => router.push('/expense/receipt-list')
onMounted(load)
</script>

<style scoped>
.p-4 { padding: 16px; }
</style>
