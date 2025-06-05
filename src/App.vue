<script setup>
import { onMounted } from "vue";
import { useUserStore } from "./stores/user";
import { userApi } from "./api/user";

const userStore = useUserStore();

onMounted(async () => {
  if (userStore.token) {
    try {
      const userInfo = await userApi.getUserInfo();
      userStore.setUser(userInfo);
    } catch (error) {
      userStore.logout();
    }
  }
});
</script>

<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style lang="scss">
.app {
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
