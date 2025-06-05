<template>
  <div class="admin-page">
    <van-nav-bar title="管理后台" left-arrow @click-left="router.back()" />

    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item to="/admin/activities" icon="calendar-o">
        活动管理
      </van-tabbar-item>
      <van-tabbar-item to="/admin/users" icon="friends-o">
        用户管理
      </van-tabbar-item>
      <van-tabbar-item to="/admin/settings" icon="setting-o">
        系统设置
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const activeTab = ref(0);
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  background-color: var(--background-color);
  padding-bottom: 50px;
}

.content {
  padding: 16px;
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 移动端适配
@media screen and (max-width: 768px) {
  .content {
    padding: 12px;
  }
}
</style>
