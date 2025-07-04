<template>
  <div class="home-page">
    <div class="header">
      <div class="header-content glass-card">
        <div class="header-top">
          <div class="logo-title-container">
            <img
              src="../assets/logo.png"
              alt="Hiking Club Logo"
              class="logo-image"
            />
            <h1 class="title">{{ $t('home.title') }}</h1>
          </div>
          <LanguageSwitcher />
        </div>
        <p class="subtitle">{{ $t('home.subtitle') }}</p>
      </div>
    </div>

    <div class="quick-actions">
      <div class="actions-container glass-card">
        <div class="actions-grid">
          <div
            v-for="action in quickActions"
            :key="action.name"
            class="action-item"
            @click="action.handler"
          >
            <div class="action-icon">
              <van-icon :name="action.icon" />
            </div>
            <span class="action-text">{{ action.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 活动报名中 -->
    <div class="enrolling-activities">
      <div class="section-header glass-card enrolling-header">
        <h2 class="section-title">{{ $t('home.sections.enrolling.title') }}</h2>
      </div>

      <div class="activity-list">
        <div
          v-for="activity in enrollingActivities"
          :key="activity.id"
          class="activity-item glass-card"
          @click="goToDetail(activity.id)"
        >
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <div class="activity-meta">
              <div class="meta-item">
                <van-icon name="location-o" />
                <span>{{ activity.location }}</span>
              </div>
              <div class="meta-item">
                <van-icon name="clock-o" />
                <span>{{ formatDate(activity.startTime) }}</span>
              </div>
            </div>
            <div class="activity-status">
              <div class="status-tag enrolling">{{ $t('home.sections.enrolling.status') }}</div>
              <span class="participants">
                {{ $t('home.sections.enrolling.participants', {
                  current: activity.currentParticipants,
                  max: activity.maxParticipants
                }) }}
              </span>
            </div>
          </div>
          <!-- 图片容器 -->
          <div class="activity-image-wrapper">
            <van-image
              :src="activity.coverImage"
              class="activity-image"
              fit="cover"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 活动投票中 -->
    <div class="voting-activities">
      <div class="section-header glass-card voting-header">
        <h2 class="section-title">{{ $t('home.sections.voting.title') }}</h2>
      </div>

      <div class="activity-list">
        <div
          v-for="activity in votingActivities"
          :key="activity.id"
          class="activity-item glass-card"
          @click="goToDetail(activity.id)"
        >
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <div class="activity-meta">
              <div class="meta-item">
                <van-icon name="location-o" />
                <span>{{ activity.location }}</span>
              </div>
              <div class="meta-item">
                <van-icon name="clock-o" />
                <span>{{ formatDate(activity.startTime) }}</span>
              </div>
            </div>
            <div class="activity-tags">
              <span v-for="tag in activity.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
            <div class="activity-status">
              <div class="status-tag voting">{{ $t('home.sections.voting.status') }}</div>
              <span class="routes-count">
                {{ $t('home.sections.voting.routes', { count: activity.routes.length }) }}
              </span>
            </div>
          </div>
          <!-- 图片容器 -->
          <div class="activity-image-wrapper">
            <van-image
              :src="activity.coverImage"
              class="activity-image"
              fit="cover"
            />
          </div>
        </div>
      </div>
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
          <span>{{ $t(tab.textKey) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { activityApi } from "../api/activity";
import { Toast } from "vant";
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

const activeTab = ref(0);
const searchText = ref("");
const activities = ref([]);

// 计算属性：报名中的活动
const enrollingActivities = computed(() => {
  // 假设所有活动都有 coverImage，这里添加一个占位图以防万一
  const placeholderImage =
    "https://source.unsplash.com/random/400x400?nature,hike";
  return activities.value
    .filter(
      (activity) =>
        activity.status === "upcoming" && activity.phase === "enrolling"
    )
    .map((activity) => ({
      ...activity,
      coverImage: activity.coverImage || placeholderImage,
    }));
});

// 计算属性：投票中的活动
const votingActivities = computed(() => {
  const placeholderImage =
    "https://source.unsplash.com/random/400x400?mountain,trail";
  return activities.value
    .filter(
      (activity) =>
        activity.status === "upcoming" && activity.phase === "voting"
    )
    .map((activity) => ({
      ...activity,
      coverImage: activity.coverImage || placeholderImage,
    }));
});

const quickActions = computed(() => [
  {
    icon: "plus",
    text: t('home.quickActions.createActivity'),
    handler: () => {
      if (!userStore.user) {
        router.push("/login");
        return;
      }
      router.push("/create-activity");
    },
  },
  {
    icon: "friends-o",
    text: t('home.quickActions.myActivities'),
    handler: () => {
      if (!userStore.user) {
        router.push("/login");
        return;
      }
      router.push("/profile/activities");
    },
  },
  {
    icon: "like-o",
    text: t('home.quickActions.favoriteActivities'),
    handler: () => {
      if (!userStore.user) {
        router.push("/login");
        return;
      }
      router.push("/profile/favorites");
    },
  },
  {
    icon: "guide-o",
    text: t('home.quickActions.activityGuide'),
    handler: () => {
      router.push("/guide");
    },
  },
]);

const tabs = [
  { name: "home", icon: "home-o", textKey: "home.tabs.home", route: "/" },
  { name: "activities", icon: "search", textKey: "home.tabs.activities", route: "/activities" },
  { name: "profile", icon: "user-o", textKey: "home.tabs.profile", route: "/profile" },
];

// Tab切换处理函数
const handleTabChange = (tab, index) => {
  activeTab.value = index;
  router.push(tab.route);
};

// 加载活动数据
const loadActivities = async () => {
  try {
    const res = await activityApi.getActivities();
    activities.value = res.data;
  } catch (error) {
    Toast(t('activities.errors.loadFailed'));
  }
};

// 工具函数
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const goToDetail = (id) => {
  router.push(`/activity/${id}`);
};

onMounted(() => {
  loadActivities();
});
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 25%,
    #e2e2e2 50%,
    #c9d6ff 75%,
    #e0eafc 100%
  );
  padding: 0 16px 100px;
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
  padding: 32px 0 24px;

  .header-content {
    padding: 24px;
    text-align: center;

    .header-top {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;
      position: relative;
    }

    .logo-title-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-image {
      width: 40px;
      height: auto;
      margin-right: 12px;
    }

    .title {
      font-size: 32px;
      font-weight: 700;
      color: #2c3e50;
      text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8),
        0 1px 2px rgba(0, 0, 0, 0.1);
      letter-spacing: -0.5px;
      margin: 0;
    }

    .subtitle {
      color: #000000;
      font-size: 16px;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
    }

    // 语言切换器定位
    .language-switcher {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 9999;
    }
  }
}

.section-header {
  margin-bottom: 16px;
  padding: 16px 20px;

  &.enrolling-header {
    background: linear-gradient(
      135deg,
      rgba(52, 199, 89, 0.15) 0%,
      rgba(78, 205, 196, 0.15) 100%
    );
    border: 1px solid rgba(52, 199, 89, 0.3);
  }

  &.voting-header {
    background: linear-gradient(
      135deg,
      rgba(255, 149, 0, 0.15) 0%,
      rgba(255, 217, 61, 0.15) 100%
    );
    border: 1px solid rgba(255, 149, 0, 0.3);
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #000000;
    margin: 0;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
  }
}

.enrolling-activities,
.voting-activities {
  margin-bottom: 24px;
}

.quick-actions {
  margin-bottom: 24px;

  .actions-container {
    padding: 20px;

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 8px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.2s ease;
        cursor: pointer;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .action-icon {
          margin-bottom: 8px;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
            inset 0 1px 1px rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);

          .van-icon {
            font-size: 24px;
            color: #000000;
          }
        }

        .action-text {
          font-size: 12px;
          color: #000000;
          text-align: center;
          font-weight: 500;
        }
      }
    }
  }
}

/* 共享的列表样式 - 全新布局 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .activity-item {
    display: flex;
    // 使用 position: relative 来定位图片
    position: relative;
    padding: 16px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    // overflow: hidden 确保图片圆角和渐变被裁切在卡片内
    overflow: hidden;

    &:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: translateY(-3px);
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.7);
    }

    .activity-content {
      // 占据所有可用空间
      flex: 1;
      // 设置右边内边距，防止文字和图片区域重叠
      padding-right: 90px;
      min-height: 90px; // 保证卡片有个最小高度
      display: flex;
      flex-direction: column;
      justify-content: center;

      .activity-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #2c3e50;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
      }

      .activity-meta {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 8px;

        .meta-item {
          display: flex;
          align-items: center;
          color: #000000;
          font-size: 12px;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);

          .van-icon {
            margin-right: 4px;
            font-size: 14px;
            color: #000000;
          }
        }
      }

      .activity-tags {
        display: flex;
        flex-wrap: wrap; // 允许标签换行
        gap: 8px;
        margin-bottom: 8px;

        .tag {
          padding: 4px 10px;
          background: linear-gradient(
            135deg,
            rgba(52, 152, 219, 0.2) 0%,
            rgba(155, 89, 182, 0.2) 100%
          );
          border-radius: 10px;
          font-size: 11px;
          color: #000000;
          border: 1px solid rgba(52, 152, 219, 0.3);
        }
      }

      .activity-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: auto; // 将状态推到底部

        .status-tag {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;

          &.enrolling {
            background: linear-gradient(
              135deg,
              rgba(52, 199, 89, 0.4) 0%,
              rgba(78, 205, 196, 0.4) 100%
            );
            color: #000000;
            border: 1px solid rgba(52, 199, 89, 0.6);
          }

          &.voting {
            background: linear-gradient(
              135deg,
              rgba(255, 149, 0, 0.4) 0%,
              rgba(255, 217, 61, 0.4) 100%
            );
            color: #000000;
            border: 1px solid rgba(255, 149, 0, 0.6);
          }
        }

        .participants,
        .routes-count {
          color: #000000;
          font-size: 12px;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
        }
      }
    }

    // 图片容器 - 实现渐变融合的关键
    .activity-image-wrapper {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 280px; // 图片区域的宽度
      pointer-events: none; // 让点击事件穿透到父级 .activity-item

      .activity-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.7; // 轻微透明，更好地融入背景

        // 核心：CSS 蒙版实现渐变
        mask-image: linear-gradient(to left, black 60%, transparent 100%);
        -webkit-mask-image: linear-gradient(
          to left,
          black 50%,
          transparent 100%
        );
      }
    }
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
</style>
