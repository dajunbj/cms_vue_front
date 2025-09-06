<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="login-container">
    <h2>アカウント有効化登録</h2>

    <el-form
      class="login-form"
      :label-width="'90px'"
      @submit.prevent
    >
      <!-- 二维码显示区域 -->
      <el-form-item label="QRコード">
        <div v-if="qrImage">
          <img :src="qrImage" alt="QR Code" style="max-width: 100%;">
        </div>
        <div v-else>
          読み取り情報がありません。
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          style="width: 100%;"
          @click="handleRegist"
        >
          确认
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>


<script setup>
import { ref,onMounted } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import axios from 'axios'
import QRCode from 'qrcode'

const qrImage = ref('')
const route = useRoute()
const otpurl = ref(route.params.otpurl)

const router = useRouter()

onMounted(async () => {
  // 从 query 中获取 otpauth:// URL
 otpurl.value = decodeURIComponent(route.params.otpurl || '')
  if (otpurl.value) {
    try {
      qrImage.value = await QRCode.toDataURL(otpurl.value)
    } catch (err) {
      console.error('二维码生成失败:', err)
    }
  }
})
const handleRegist = async () => {
  axios.defaults.withCredentials = true
router.push('/login')
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
