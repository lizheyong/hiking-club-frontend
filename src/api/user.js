import request from "./request";
import { mockApi } from "./mock";
import { supabaseApi } from "./supabase";

// API模式配置: 'mock' | 'supabase' | 'backend'
const API_MODE = import.meta.env.VITE_API_MODE || 'mock';

const createUserApi = () => {
  switch (API_MODE) {
    case 'supabase':
      return {
        // 手机验证码登录
        loginByPhone(phone, code) {
          return supabaseApi.loginByPhone(phone, code);
        },

        // 邮箱登录
        loginByEmail(email, password) {
          return supabaseApi.loginByEmail(email, password);
        },

        // 发送验证码
        sendVerificationCode(phone) {
          return supabaseApi.sendVerificationCode(phone);
        },

        // 注册
        register(data) {
          return supabaseApi.register(data);
        },

        // 获取用户信息
        getUserInfo() {
          return supabaseApi.getUserInfo();
        },

        // 更新用户信息
        updateUserInfo(data) {
          return supabaseApi.updateUserInfo(data);
        },

        // 修改密码
        changePassword(data) {
          return supabaseApi.changePassword(data);
        },

        // Google登录
        loginWithGoogle() {
          return supabaseApi.loginWithGoogle();
        },

        // 重置密码
        resetPassword(email) {
          return supabaseApi.resetPassword(email);
        },

        // 管理员方法
        getAllUsers() {
          return supabaseApi.getAllUsers();
        },

        deleteUser(id) {
          return supabaseApi.deleteUser(id);
        },

        updateUser(id, data) {
          return supabaseApi.updateUser(id, data);
        },

        createUser(data) {
          return supabaseApi.createUser(data);
        },
      };

    case 'backend':
      return {
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

        // Google登录
        loginWithGoogle() {
          return request.post("/auth/google");
        },

        // 重置密码
        resetPassword(email) {
          return request.post("/auth/reset-password", { email });
        },

        // 管理员方法
        getAllUsers() {
          return request.get("/admin/users");
        },

        deleteUser(id) {
          return request.delete(`/admin/users/${id}`);
        },

        updateUser(id, data) {
          return request.put(`/admin/users/${id}`, data);
        },

        createUser(data) {
          return request.post("/admin/users", data);
        },
      };

    default: // mock
      return {
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

        // Google登录 (Mock版本)
        loginWithGoogle() {
          return Promise.resolve({
            message: "Mock Google登录",
            url: "#mock-google-redirect"
          });
        },

        // 重置密码 (Mock版本)
        resetPassword(email) {
          return Promise.resolve({
            message: "Mock密码重置邮件已发送"
          });
        },

        // 管理员方法
        getAllUsers() {
          return mockApi.getAllUsers();
        },

        deleteUser(id) {
          return mockApi.deleteUser(id);
        },

        updateUser(id, data) {
          return mockApi.updateUser(id, data);
        },

        createUser(data) {
          return mockApi.createUser(data);
        },
      };
  }
};

export const userApi = createUserApi();
