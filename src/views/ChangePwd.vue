<template>
  <div class="login-container">
    <h2>重置密码</h2>
    <el-form
      class="login-form"
      :label-width="'90px'"
      @submit.prevent
    >
      <el-form-item label="新的密码">
        <el-input
          v-model="password"
          placeholder="请输入新的密码"
        />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input
          v-model="confirmPwd"
          placeholder="请确认新的密码"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          style="width: 100%;"
          @click="handleResetPassword"
        >
          重置密码
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const password = ref('')
const confirmPwd = ref('')
const router = useRouter()

const handleResetPassword = async () => {
  axios.defaults.withCredentials = true

  if (!password.value) {
    ElMessage.error('请输入新的密码')
    return
  }
    if (!confirmPwd.value) {
    ElMessage.error('请确认新的密码')
    return
  }
  if (password.value !== confirmPwd.value) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  try {
    const response = await axios.post('/rest/sendMail', {
      password: password.value,
    })

    const data = response.data

    if (data.success) {
      router.push('/home')
    } else {
      ElMessage.error(data.message)
    }
  } catch (err) {
    ElMessage.error('登录失败，请检查网络或服务器错误')
  }
}

</script>

<style scoped>
.login-container {
  width: 300px;
  margin: 100px auto;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}
h2 {
  text-align: center;
}
</style>
