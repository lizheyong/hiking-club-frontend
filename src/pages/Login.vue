<template>
  <div class="login-page">
    <van-nav-bar :title="$t('login.title')" left-arrow @click-left="router.back()" />

    <div class="login-container">
      <div class="login-header glass-card">
        <div class="logo-title-container">
          <img src="../assets/logo.png" alt="Logo" class="logo" />
          <h2 class="welcome-text">{{ $t('login.welcome') }}</h2>
        </div>
      </div>

      <div class="login-form glass-card">
        <!-- 手机号登录表单 -->
        <van-form
          v-if="loginType === 'phone'"
          @submit="onPhoneSubmit"
          class="form-content"
        >
          <van-cell-group inset>
            <van-field
              v-model="phoneForm.phone"
              name="phone"
              :label="$t('login.phone.phoneNumber')"
              :placeholder="$t('login.phone.phonePlaceholder')"
              :rules="[{ required: true, message: $t('login.phone.phoneRequired') }]"
            />
            <van-field
              v-model="phoneForm.code"
              center
              clearable
              :label="$t('login.phone.verificationCode')"
              :placeholder="$t('login.phone.codePlaceholder')"
              :rules="[{ required: true, message: $t('login.phone.codeRequired') }]"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  class="code-button"
                  :disabled="!!countdown"
                  @click="sendCode"
                >
                  {{ countdown ? $t('login.phone.resendCode', { countdown }) : $t('login.phone.sendCode') }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>
          <div class="submit-btn">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              class="submit-button"
            >
              {{ $t('login.phone.login') }}
            </van-button>
          </div>
        </van-form>

        <!-- 邮箱登录表单 -->
        <van-form v-else @submit="onEmailSubmit" class="form-content">
          <van-cell-group inset>
            <van-field
              v-model="emailForm.email"
              name="email"
              :label="$t('login.email.email')"
              :placeholder="$t('login.email.emailPlaceholder')"
              :rules="[{ required: true, message: $t('login.email.emailRequired') }]"
            />
            <van-field
              v-model="emailForm.password"
              type="password"
              name="password"
              :label="$t('login.email.password')"
              :placeholder="$t('login.email.passwordPlaceholder')"
              :rules="[{ required: true, message: $t('login.email.passwordRequired') }]"
            />
          </van-cell-group>
          <div class="submit-btn">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              class="submit-button"
            >
              {{ $t('login.email.login') }}
            </van-button>
          </div>
        </van-form>

        <!-- 切换登录方式 -->
        <div class="action-options">
          <div class="switch-login-type">
            <span @click="switchLoginType">
              {{ loginType === "phone" ? $t('login.switchToEmail') : $t('login.switchToPhone') }}
            </span>
          </div>

          <div class="register-link">
            {{ $t('login.noAccount') }}
            <router-link to="/register">{{ $t('login.registerNow') }}</router-link>
          </div>
        </div>
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
const countdown = ref(0);
const loginType = ref("phone"); // 默认使用手机号登录

const phoneForm = ref({
  phone: "",
  code: "",
});

const emailForm = ref({
  email: "",
  password: "",
});

const switchLoginType = () => {
  loginType.value = loginType.value === "phone" ? "email" : "phone";
};

const startCountdown = () => {
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const sendCode = async () => {
  try {
    await userApi.sendVerificationCode(phoneForm.value.phone);
    showToast(t('login.codeSent'));
    startCountdown();
  } catch (error) {
    showToast(t('login.sendFailed'));
  }
};

const onPhoneSubmit = async () => {
  try {
    console.log("开始手机号登录:", phoneForm.value);
    const { token, user } = await userApi.loginByPhone(
      phoneForm.value.phone,
      phoneForm.value.code
    );
    console.log("登录成功，返回数据:", { token, user });
    userStore.setToken(token);
    userStore.setUser(user);
    showToast(t('login.loginSuccess'));
    router.push("/");
  } catch (error) {
    console.error("登录失败:", error);
    showToast(error.message || t('login.loginFailed'));
  }
};

const onEmailSubmit = async () => {
  try {
    console.log("开始邮箱登录:", emailForm.value);
    const { token, user } = await userApi.loginByEmail(
      emailForm.value.email,
      emailForm.value.password
    );
    console.log("登录成功，返回数据:", { token, user });
    userStore.setToken(token);
    userStore.setUser(user);
    showToast(t('login.loginSuccess'));
    router.push("/");
  } catch (error) {
    console.error("登录失败:", error);
    showToast(error.message || t('login.loginFailed'));
  }
};
</script>

<style lang="scss" scoped>
.login-page {
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

.login-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.login-header {
  text-align: center;
  margin: 30px 0;
  padding: 24px;

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

.login-form {
  border-radius: 20px;
  padding: 24px;
}

.form-content {
  margin-top: 10px;

  :deep(.van-cell) {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    margin-bottom: 16px;
  }

  :deep(.van-cell::after) {
    display: none;
  }
}

.code-button {
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(52, 152, 219, 0.9) 0%,
    rgba(52, 152, 219, 0.7) 100%
  );
  border: none;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.submit-btn {
  margin: 24px 0;

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

.action-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.switch-login-type {
  text-align: center;

  span {
    color: #2c3e50;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);

    &:hover {
      color: #34495e;
      text-decoration: underline;
    }
  }
}

.register-link {
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
</style>
