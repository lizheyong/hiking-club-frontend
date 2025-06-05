<template>
  <div class="profile-page">
    <div class="header glass-card">
      <div class="user-info" v-if="userStore.user">
        <van-image
          round
          width="80"
          height="80"
          :src="userStore.user.avatar"
          class="avatar"
        />
        <h2 class="username">{{ userStore.user.name }}</h2>
        <p class="user-id">ID: {{ userStore.user.id }}</p>
      </div>
      <div class="login-prompt" v-else>
        <p>登录后查看更多信息</p>
        <van-button
          type="primary"
          size="small"
          class="login-button"
          @click="goToLogin"
        >
          立即登录
        </van-button>
      </div>
    </div>

    <div class="stats-bar glass-card">
      <div class="stat-item">
        <span class="number">{{
          userStore.user?.activities?.length || 0
        }}</span>
        <span class="label">参与活动</span>
      </div>
      <div class="stat-item">
        <span class="number">{{ userStore.user?.favorites?.length || 0 }}</span>
        <span class="label">收藏活动</span>
      </div>
      <div class="stat-item">
        <span class="number">{{
          userStore.user?.createdActivities?.length || 0
        }}</span>
        <span class="label">发布活动</span>
      </div>
    </div>

    <div class="menu-list">
      <van-cell-group inset class="menu-group glass-card">
        <van-cell
          title="我的活动"
          is-link
          to="/profile/activities"
          icon="friends-o"
          class="menu-item"
        />
        <van-cell
          title="收藏的活动"
          is-link
          to="/profile/favorites"
          icon="like-o"
          class="menu-item"
        />
        <van-cell
          title="发布的活动"
          is-link
          to="/profile/created"
          icon="plus"
          class="menu-item"
        />
        <van-cell
          title="个人信息"
          is-link
          to="/profile/info"
          icon="user-o"
          class="menu-item"
        />
        <van-cell
          title="设置"
          is-link
          to="/profile/settings"
          icon="setting-o"
          class="menu-item"
        />
      </van-cell-group>
    </div>

    <div class="admin-section" v-if="userStore.user?.isAdmin">
      <h3 class="section-title">管理员功能</h3>
      <van-cell-group inset class="menu-group glass-card">
        <van-cell
          title="活动管理"
          is-link
          to="/admin/activities"
          icon="guide-o"
          class="menu-item"
        />
        <van-cell
          title="用户管理"
          is-link
          to="/admin/users"
          icon="friends-o"
          class="menu-item"
        />
        <van-cell
          title="系统设置"
          is-link
          to="/admin/settings"
          icon="setting-o"
          class="menu-item"
        />
      </van-cell-group>
    </div>

    <div class="logout-section" v-if="userStore.user">
      <van-button
        block
        type="danger"
        class="logout-button glass-button"
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>

    <div class="tabbar-container">
      <div class="tabbar glass-card">
        <div
          v-for="(tab, index) in tabs"
          :key="tab.name"
          class="tab-item"
          :class="{ active: activeTab === index }"
          @click="handleTabChange(tab, index)"
        >
          <van-icon :name="tab.icon" />
          <span>{{ tab.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { showDialog } from "vant";

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref(2);

const tabs = [
  { name: "home", icon: "home-o", text: "首页", route: "/" },
  { name: "activities", icon: "search", text: "活动", route: "/activities" },
  { name: "profile", icon: "user-o", text: "我的", route: "/profile" },
];

const handleTabChange = (tab, index) => {
  activeTab.value = index;
  router.push(tab.route);
};

const goToLogin = () => {
  router.push("/login");
};

const handleLogout = () => {
  showDialog({
    title: "确认退出",
    message: "确定要退出登录吗？",
    showCancelButton: true,
  }).then(() => {
    userStore.logout();
    router.push("/login");
  });
};
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 25%,
    #e2e2e2 50%,
    #c9d6ff 75%,
    #e0eafc 100%
  );
  padding: 20px 16px 100px;
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

.header {
  padding: 32px 16px;
  text-align: center;
  margin-bottom: 20px;

  .user-info {
    .avatar {
      margin-bottom: 16px;
      border: 4px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .username {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #000000;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
    }

    .user-id {
      color: #000000;
      font-size: 14px;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
    }
  }

  .login-prompt {
    p {
      margin-bottom: 16px;
      color: #000000;
      font-weight: 500;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
    }

    .login-button {
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.9) 0%,
        rgba(155, 89, 182, 0.9) 100%
      );
      border: none;
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      font-weight: 600;
    }
  }
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 20px 16px;
  margin-bottom: 24px;

  .stat-item {
    text-align: center;

    .number {
      display: block;
      font-size: 28px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 6px;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
    }

    .label {
      font-size: 14px;
      color: #000000;
      font-weight: 500;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
    }
  }
}

.menu-list {
  margin-bottom: 24px;

  .menu-group {
    overflow: hidden;
    padding: 0;
  }

  :deep(.menu-item) {
    background: transparent;
    margin: 0;
    position: relative;

    .van-cell__title {
      color: #000000;
      font-weight: 500;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
    }

    .van-icon {
      color: #000000;
    }

    &::after {
      content: "";
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.3);
    }

    &:last-child::after {
      display: none;
    }
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 24px 16px 16px;
  color: #000000;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

.admin-section {
  margin-bottom: 30px;
}

.logout-section {
  padding: 0 16px;
  margin-bottom: 80px;

  .logout-button {
    border-radius: 20px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(
      135deg,
      rgba(231, 76, 60, 0.8) 0%,
      rgba(192, 57, 43, 0.8) 100%
    );
    border: none;
    box-shadow: 0 8px 16px rgba(231, 76, 60, 0.3);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
}

.tabbar-container {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 100;

  .tabbar {
    display: flex;
    justify-content: space-around;
    padding: 12px 0;

    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 16px;
      border-radius: 12px;
      transition: all 0.2s ease;
      cursor: pointer;

      &.active {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.3) 0%,
          rgba(255, 255, 255, 0.15) 100%
        );
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

        .van-icon {
          color: #000000;
          filter: drop-shadow(0 1px 2px rgba(255, 255, 255, 0.8));
        }

        span {
          color: #000000;
          font-weight: 600;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
        }
      }

      .van-icon {
        font-size: 20px;
        color: #000000;
        margin-bottom: 4px;
      }

      span {
        font-size: 12px;
        color: #000000;
      }
    }
  }
}

:deep(.van-dialog) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
}

:deep(.van-dialog__content) {
  padding: 24px 20px;
}

:deep(.van-dialog__message) {
  color: #2c3e50;
  font-size: 16px;
}

:deep(.van-dialog__footer) {
  padding: 8px;
}

:deep(.van-button--default) {
  background: rgba(255, 255, 255, 0.3);
  color: #34495e;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.van-button--primary) {
  background: linear-gradient(
    135deg,
    rgba(52, 152, 219, 0.9) 0%,
    rgba(155, 89, 182, 0.9) 100%
  );
  border: none;
}
</style>
