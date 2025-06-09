<template>
  <div class="login-container">
    <h2>登录</h2>
    <el-form
      class="login-form"
      @submit.prevent
    >
      <el-form-item label="用户名">
        <el-input
          v-model="username"
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="password"
          type="password"
          placeholder="请输入密码"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          style="width: 100%;"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const username = ref('')
const password = ref('')

const router = useRouter()
const store = useStore()

const handleLogin = async () => {
  axios.defaults.withCredentials = true

  if (!username.value || !password.value) {
    ElMessage.error('请输入用户名和密码')
    return
  }

  try {
    const response = await axios.post('http://localhost:8080/auth/login', {
      username: username.value,
      password: password.value,
    })

    const data = response.data

    if (data.success) {
      const token = data.token
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('tokenExpiration', new Date().getTime() + 60 * 60 * 1000) // 1小时有效

      store.commit('setPlanCode', data.company.plan_code)

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
