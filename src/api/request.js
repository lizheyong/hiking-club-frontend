import axios from "axios";
import { useUserStore } from "../stores/user";
import { mockApi } from "./mock";

// 是否使用模拟数据
const USE_MOCK = true;

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const request = axios.create({
  baseURL,
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      userStore.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 导出 API 实例
export default USE_MOCK ? mockApi : request;
