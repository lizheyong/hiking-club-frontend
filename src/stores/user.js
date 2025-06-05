import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || "");
  const isAdmin = ref(localStorage.getItem("isAdmin") === "true");

  function setUser(userData) {
    user.value = userData;
  }

  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function setAdmin(status) {
    isAdmin.value = status;
    localStorage.setItem("isAdmin", status);
  }

  function logout() {
    user.value = null;
    token.value = "";
    isAdmin.value = false;
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  }

  return {
    user,
    token,
    isAdmin,
    setUser,
    setToken,
    setAdmin,
    logout,
  };
});
