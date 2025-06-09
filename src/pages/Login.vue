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

        <!-- 第三方登录 -->
        <div class="third-party-login">
          <div class="divider">
            <span>{{ $t('login.orLogin') }}</span>
          </div>
          
          <div class="social-buttons">
            <!-- 邮箱登录按钮 (在手机登录页面显示) -->
            <van-button 
              v-if="loginType === 'phone'"
              class="email-btn"
              @click="switchLoginType"
            >
              <div class="btn-content">
                <van-icon name="envelop-o" class="btn-icon" />
                <span>{{ $t('login.email.login') }}</span>
              </div>
            </van-button>
            
            <!-- 手机登录按钮 (在邮箱登录页面显示) -->
            <van-button 
              v-if="loginType === 'email'"
              class="phone-btn"
              @click="switchLoginType"
            >
              <div class="btn-content">
                <van-icon name="phone" class="btn-icon" />
                <span>{{ $t('login.phone.login') }}</span>
              </div>
            </van-button>
            
            <!-- Google登录按钮 -->
            <van-button 
              class="google-btn"
              @click="handleGoogleLogin"
            >
              <div class="btn-content">
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                  alt="Google" 
                  class="btn-icon"
                />
                <span>Google {{ $t('login.login') }}</span>
              </div>
            </van-button>
          </div>
        </div>

        <!-- 其他操作选项 -->
        <div class="action-options">
          <!-- 忘记密码 -->
          <div v-if="loginType === 'email'" class="forgot-password">
            <span @click="handleForgotPassword">
              {{ $t('login.forgotPassword') }}
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
const loginType = ref("email"); // 默认使用邮箱登录

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

// Google登录
const handleGoogleLogin = async () => {
  try {
    const result = await userApi.loginWithGoogle();
    if (result.url && result.url !== "#mock-google-redirect") {
      // 真实的Google登录会跳转到OAuth页面
      window.location.href = result.url;
    } else {
      // Mock模式显示提示
      showToast("Mock模式：Google登录功能需要配置Supabase");
    }
  } catch (error) {
    console.error("Google登录失败:", error);
    showToast(error.message || "Google登录失败");
  }
};

// 忘记密码
const handleForgotPassword = async () => {
  if (!emailForm.value.email) {
    showToast("请先输入邮箱地址");
    return;
  }
  
  try {
    await userApi.resetPassword(emailForm.value.email);
    showToast("密码重置邮件已发送");
  } catch (error) {
    console.error("密码重置失败:", error);
    showToast(error.message || "密码重置失败");
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

.third-party-login {
  margin: 20px 0;
  
  .divider {
    text-align: center;
    margin: 20px 0;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.3);
    }
    
    span {
      background: rgba(255, 255, 255, 0.25);
      padding: 0 16px;
      color: #666;
      font-size: 14px;
      position: relative;
      z-index: 1;
    }
  }
  
  .social-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      height: 100%;
    }
    
    .btn-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .email-btn,
    .phone-btn,
    .google-btn {
      width: 100%;
      height: 44px;
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
        background: rgba(255, 255, 255, 0.95);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
    
    .email-btn {
      .btn-icon {
        color: #4285f4; // 蓝色 - 类似邮箱品牌色
        font-size: 24px;
      }
    }
    
    .phone-btn {
      .btn-icon {
        color: #34a853; // 绿色 - 类似电话/短信品牌色
        font-size: 24px;
      }
    }
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

.forgot-password {
  text-align: center;
  
  span {
    color: #3498db;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
    
    &:hover {
      color: #2980b9;
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
