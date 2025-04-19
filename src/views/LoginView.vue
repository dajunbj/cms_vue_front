<template>
    <div class="login-container">
      <h2>登录</h2>
      <el-form class="login-form" @submit.native.prevent>
        <el-form-item label="用户名">
          <el-input v-model="username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  
  import axios from 'axios';

  export default {
    name: "LoginView",
    data() {
      return {
        username: "", // 响应式数据
        password: "",
      };
    },
    methods: {
      handleLogin() {
        if (this.username && this.password) {
            axios.post("http://localhost:8080/auth/login", {
            username: this.username,
            password: this.password,
            }).then((response) => {
              alert(response.data);
                if (response.data.sucess) {
                  const token = response.data.token;
                  sessionStorage.setItem("token", token);
                  this.$router.push("/home");                 
                } else {
                  alert(response.data.status);
                }

            });
        } else {
            alert("请输入用户名和密码");
        }
      },
      setLoginToken(){
          //不正ログイン防止のトークン
          const token = "mytoken";
          sessionStorage.setItem("token",token);
          
          const tokenExpirationTime = new Date().getTime() + 60000; // 1 小时有效期
          sessionStorage.setItem("tokenExpiration", tokenExpirationTime);
      },
    },
  };
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
  