<template>
  <div class="register-page">
    <van-nav-bar title="注册账号" left-arrow @click-left="router.back()" />

    <div class="register-container">
      <div class="register-header glass-card">
        <div class="logo-title-container">
          <img src="../assets/logo.png" alt="Logo" class="logo" />
          <h2 class="welcome-text">创建账号</h2>
        </div>
      </div>

      <div class="form-container glass-card">
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请输入用户名' }]"
            />
            <van-field
              v-model="form.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              :rules="[
                { required: true, message: '请输入邮箱' },
                { pattern: /.+@.+\..+/, message: '请输入正确的邮箱格式' },
              ]"
            />
            <van-field
              v-model="form.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              :rules="[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' },
              ]"
            />
            <van-field
              v-model="form.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度不能小于6位' },
              ]"
            />
            <van-field
              v-model="form.confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="[
                { required: true, message: '请确认密码' },
                {
                  validator: validateConfirmPassword,
                  message: '两次输入的密码不一致',
                },
              ]"
            />
          </van-cell-group>

          <div class="submit-btn">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-button"
            >
              注册
            </van-button>
          </div>

          <div class="login-link">
            已有账号？
            <router-link to="/login">立即登录</router-link>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { userApi } from "../api/user";
import { showToast } from "vant";

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const form = ref({
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

// 验证确认密码
const validateConfirmPassword = (val) => {
  return val === form.value.password;
};

// 提交表单
const onSubmit = async () => {
  try {
    loading.value = true;
    const res = await userApi.register({
      username: form.value.username,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
    });

    // 保存token
    userStore.setToken(res.data.token);
    // 获取用户信息
    await userStore.getUserInfo();

    showToast("注册成功");
    router.push("/");
  } catch (error) {
    showToast(error.message || "注册失败");
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 25%,
    #e2e2e2 50%,
    #c9d6ff 75%,
    #e0eafc 100%
  );
  position: relative;

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 20%,
        rgba(255, 255, 255, 0.4) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 80%,
        rgba(255, 255, 255, 0.2) 0%,
        transparent 50%
      );
    pointer-events: none;
    z-index: 0;
  }
}

.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border-radius: inherit;
    pointer-events: none;
  }
}

.register-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.register-header {
  text-align: center;
  margin: 20px 0;
  padding: 20px;

  .logo-title-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo {
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }

  .welcome-text {
    font-size: 28px;
    color: #000000;
    margin: 0;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
  }
}

.form-container {
  padding: 24px;
  margin-bottom: 30px;

  :deep(.van-cell) {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    margin-bottom: 16px;
  }

  :deep(.van-cell::after) {
    display: none;
  }

  .submit-btn {
    margin: 30px 0 20px;

    .submit-button {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.9) 0%,
        rgba(155, 89, 182, 0.9) 100%
      );
      border: none;
      box-shadow: 0 8px 16px rgba(52, 152, 219, 0.3);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  }

  .login-link {
    text-align: center;
    color: #2c3e50;
    font-size: 14px;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);

    a {
      color: #3498db;
      text-decoration: none;
      margin-left: 4px;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

:deep(.van-nav-bar) {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.van-nav-bar__title) {
  color: #000000;
  font-weight: 600;
}

:deep(.van-icon) {
  color: #000000 !important;
}

:deep(.van-field__label) {
  color: #2c3e50;
  font-weight: 500;
}

:deep(.van-cell-group) {
  background: transparent;
}

// 移动端适配
@media screen and (max-width: 768px) {
  .register-container {
    padding: 16px;
  }

  .form-container {
    padding: 20px;
  }
}
</style>
