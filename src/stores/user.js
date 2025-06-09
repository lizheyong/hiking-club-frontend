import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../api/supabase";

export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || "");
  const isAdmin = ref(localStorage.getItem("isAdmin") === "true");

  function setUser(userData) {
    user.value = userData;
    if (userData?.is_admin !== undefined) {
      setAdmin(userData.is_admin);
    }
  }

  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function setAdmin(status) {
    isAdmin.value = status;
    localStorage.setItem("isAdmin", status);
  }

  async function logout() {
    // Supabase登出
    await supabase.auth.signOut();
    
    user.value = null;
    token.value = "";
    isAdmin.value = false;
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  }

  // 初始化时检查Supabase会话
  async function initAuth() {
    // 检查是否使用Supabase模式
    const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
    if (API_MODE !== 'supabase') {
      return; // 非Supabase模式不需要初始化
    }

    // 检查Supabase环境变量
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase环境变量未配置，跳过认证初始化');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
        // 获取用户信息
        try {
          const { supabaseApi } = await import("../api/supabase");
          const userData = await supabaseApi.getUserInfo();
          setUser(userData);
        } catch (error) {
          console.error("获取用户信息失败:", error);
        }
      }
    } catch (error) {
      console.error("Supabase认证初始化失败:", error);
    }
  }

  // 监听认证状态变化 (仅在Supabase模式下)
  if (import.meta.env.VITE_API_MODE === 'supabase' && 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_ANON_KEY) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        user.value = null;
        token.value = "";
        isAdmin.value = false;
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
      }
    });
  }

  return {
    user,
    token,
    isAdmin,
    setUser,
    setToken,
    setAdmin,
    logout,
    initAuth,
  };
});
