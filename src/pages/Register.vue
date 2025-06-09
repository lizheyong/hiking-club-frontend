<template>
  <div class="register-page">
    <van-nav-bar :title="$t('register.title')" left-arrow @click-left="router.back()" />

    <div class="register-container">
      <div class="register-header glass-card">
        <div class="logo-title-container">
          <img src="../assets/logo.png" alt="Logo" class="logo" />
          <h2 class="welcome-text">{{ $t('register.welcome') }}</h2>
        </div>
      </div>

      <div class="form-container glass-card">
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.username"
              name="username"
              :label="$t('register.form.username.label')"
              :placeholder="$t('register.form.username.placeholder')"
              :rules="[{ required: true, message: $t('register.form.username.required') }]"
            />
            <van-field
              v-model="form.email"
              name="email"
              :label="$t('register.form.email.label')"
              :placeholder="$t('register.form.email.placeholder')"
              :rules="[
                { required: true, message: $t('register.form.email.required') },
                { pattern: /.+@.+\..+/, message: $t('register.form.email.invalid') },
              ]"
            />
            <van-field
              v-model="form.phone"
              name="phone"
              :label="$t('register.form.phone.label')"
              :placeholder="$t('register.form.phone.placeholder')"
              :rules="[
                { required: true, message: $t('register.form.phone.required') },
                { pattern: /^1[3-9]\d{9}$/, message: $t('register.form.phone.invalid') },
              ]"
            />
            <van-field
              v-model="form.password"
              type="password"
              name="password"
              :label="$t('register.form.password.label')"
              :placeholder="$t('register.form.password.placeholder')"
              :rules="[
                { required: true, message: $t('register.form.password.required') },
                { min: 6, message: $t('register.form.password.minLength') },
              ]"
            />
            <van-field
              v-model="form.confirmPassword"
              type="password"
              name="confirmPassword"
              :label="$t('register.form.confirmPassword.label')"
              :placeholder="$t('register.form.confirmPassword.placeholder')"
              :rules="[
                { required: true, message: $t('register.form.confirmPassword.required') },
                {
                  validator: validateConfirmPassword,
                  message: $t('register.form.confirmPassword.mismatch'),
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
              {{ $t('register.submit') }}
            </van-button>
          </div>

          <div class="login-link">
            {{ $t('register.hasAccount') }}
            <router-link to="/login">{{ $t('register.loginNow') }}</router-link>
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
import { useI18n } from 'vue-i18n';

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

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
    const result = await userApi.register({
      name: form.value.username,  // 修正字段名
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
    });

    // 处理不同的注册结果
    if (result.needEmailConfirmation) {
      // 需要邮箱验证
      showToast(result.message || '注册成功！请检查邮箱验证链接');
      router.push('/login');
    } else if (result.token && result.user) {
      // 直接注册成功
      userStore.setToken(result.token);
      userStore.setUser(result.user);
      showToast('注册成功！');
      router.push("/");
    } else {
      // 未知情况
      showToast(result.message || '注册完成');
      router.push('/login');
    }
  } catch (error) {
    console.error('注册失败:', error);
    showToast(error.message || '注册失败');
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
