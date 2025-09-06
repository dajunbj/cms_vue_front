<template>
  <div class="login-container">
    <h2>注册临时登录</h2>
    <el-form
      class="login-form"
      :label-width="'90px'"
      @submit.prevent
    >
      <el-form-item label="用户名">
        <el-input
          v-model="login_id"
          placeholder="请输入临时用户名"
        />
      </el-form-item>
      <el-form-item label="密码"> 
        <el-input
          v-model="pwd"
          type="password"
          placeholder="请输入临时密码"
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
import { ref, onMounted } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const login_id = ref('')
const pwd = ref('')
const token = ref('')

const router = useRouter()
const route = useRoute()

onMounted(() => {
  token.value = route.query.token || '';
})



const handleLogin = async () => {
  axios.defaults.withCredentials = true

  if (!login_id.value || !pwd.value) {
    ElMessage.error('请输入用户名和密码')
    return
  }


  try {
    const response = await axios.post('http://localhost:8080/regist/login', {
      login_id: login_id.value,
      pwd: pwd.value,
      token: token.value,
    })

    const data = response.data

    if (data.success) {
      router.push({
        name: 'trueRegister',
        params: { id: data.id }
      })
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
