import request from "./request";
import { mockApi } from "./mock";

// 是否使用模拟数据
const USE_MOCK = true;

export const userApi = USE_MOCK
  ? {
      // 手机验证码登录
      loginByPhone(phone, code) {
        return mockApi.loginByPhone(phone, code);
      },

      // 邮箱登录
      loginByEmail(email, password) {
        return mockApi.loginByEmail(email, password);
      },

      // 发送验证码
      sendVerificationCode(phone) {
        return mockApi.sendVerificationCode(phone);
      },

      // 注册
      register(data) {
        return mockApi.register(data);
      },

      // 获取用户信息
      getUserInfo() {
        return mockApi.getUserInfo();
      },

      // 更新用户信息
      updateUserInfo(data) {
        return mockApi.updateUserInfo(data);
      },

      // 修改密码
      changePassword(data) {
        return mockApi.changePassword(data);
      },
    }
  : {
      // 手机验证码登录
      loginByPhone(phone, code) {
        return request.post("/auth/phone-login", { phone, code });
      },

      // 邮箱登录
      loginByEmail(email, password) {
        return request.post("/auth/email-login", { email, password });
      },

      // 发送验证码
      sendVerificationCode(phone) {
        return request.post("/auth/send-code", { phone });
      },

      // 注册
      register(data) {
        return request.post("/auth/register", data);
      },

      // 获取用户信息
      getUserInfo() {
        return request.get("/user/info");
      },

      // 更新用户信息
      updateUserInfo(data) {
        return request.put("/user/info", data);
      },

      // 修改密码
      changePassword(data) {
        return request.put("/user/password", data);
      },
    };
