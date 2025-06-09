<template>
  <div class="profile-page">
    <div class="header glass-card">
      <van-nav-bar>
        <template #title>
          <span class="title-text">{{ $t('profile.title') }}</span>
        </template>
      </van-nav-bar>
    </div>

    <div class="content">
      <div class="user-info glass-card">
        <div class="avatar-section">
          <van-image
            round
            width="80"
            height="80"
            :src="userInfo.avatar"
            class="avatar"
          />
          <div class="user-meta">
            <h2 class="username">{{ userInfo.name }}</h2>
            <p class="user-id">{{ $t('profile.userId', { id: userInfo.id }) }}</p>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <span class="value">{{ userInfo.createdActivities }}</span>
            <span class="label">{{ $t('profile.stats.createdActivities') }}</span>
          </div>
          <div class="stat-item">
            <span class="value">{{ userInfo.joinedActivities }}</span>
            <span class="label">{{ $t('profile.stats.joinedActivities') }}</span>
          </div>
          <div class="stat-item">
            <span class="value">{{ userInfo.favoriteActivities }}</span>
            <span class="label">{{ $t('profile.stats.favoriteActivities') }}</span>
          </div>
        </div>
      </div>

      <div class="section-title">{{ $t('profile.myActivities.title') }}</div>
      <div class="tabs glass-card">
        <van-tabs v-model:active="activeTab" animated swipeable>
          <van-tab :title="$t('profile.myActivities.created')">
            <div v-if="createdActivities.length" class="activity-list">
              <div
                v-for="activity in createdActivities"
                :key="activity.id"
                class="activity-item glass-card"
                @click="goToActivity(activity.id)"
              >
                <div class="activity-cover">
                  <van-image :src="activity.coverImage" fit="cover" />
                  <van-tag
                    :type="getStatusTagType(activity)"
                    class="status-tag"
                  >
                    {{ getCombinedStatusText(activity) }}
                  </van-tag>
                </div>
                <div class="activity-info">
                  <h3 class="activity-title">{{ activity.title }}</h3>
                  <div class="activity-meta">
                    <span class="location">
                      <van-icon name="location-o" />
                      {{ activity.location }}
                    </span>
                    <span class="time">
                      <van-icon name="clock-o" />
                      {{ formatDate(activity.startTime) }}
                    </span>
                  </div>
                  <div class="activity-stats">
                    <span class="participants">
                      <van-icon name="friends-o" />
                      {{ activity.currentParticipants }}/{{ activity.maxParticipants }}
                    </span>
                    <span class="routes">
                      <van-icon name="guide-o" />
                      {{ activity.routes?.length || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <van-empty
              v-else
              :description="$t('profile.myActivities.empty.created')"
              image-size="60"
            />
          </van-tab>

          <van-tab :title="$t('profile.myActivities.joined')">
            <div v-if="joinedActivities.length" class="activity-list">
              <div
                v-for="activity in joinedActivities"
                :key="activity.id"
                class="activity-item glass-card"
                @click="goToActivity(activity.id)"
              >
                <div class="activity-cover">
                  <van-image :src="activity.coverImage" fit="cover" />
                  <van-tag
                    :type="getStatusTagType(activity)"
                    class="status-tag"
                  >
                    {{ getCombinedStatusText(activity) }}
                  </van-tag>
                </div>
                <div class="activity-info">
                  <h3 class="activity-title">{{ activity.title }}</h3>
                  <div class="activity-meta">
                    <span class="location">
                      <van-icon name="location-o" />
                      {{ activity.location }}
                    </span>
                    <span class="time">
                      <van-icon name="clock-o" />
                      {{ formatDate(activity.startTime) }}
                    </span>
                  </div>
                  <div class="activity-stats">
                    <span class="participants">
                      <van-icon name="friends-o" />
                      {{ activity.currentParticipants }}/{{ activity.maxParticipants }}
                    </span>
                    <span class="routes">
                      <van-icon name="guide-o" />
                      {{ activity.routes?.length || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <van-empty
              v-else
              :description="$t('profile.myActivities.empty.joined')"
              image-size="60"
            />
          </van-tab>

          <van-tab :title="$t('profile.myActivities.favorite')">
            <div v-if="favoriteActivities.length" class="activity-list">
              <div
                v-for="activity in favoriteActivities"
                :key="activity.id"
                class="activity-item glass-card"
                @click="goToActivity(activity.id)"
              >
                <div class="activity-cover">
                  <van-image :src="activity.coverImage" fit="cover" />
                  <van-tag
                    :type="getStatusTagType(activity)"
                    class="status-tag"
                  >
                    {{ getCombinedStatusText(activity) }}
                  </van-tag>
                </div>
                <div class="activity-info">
                  <h3 class="activity-title">{{ activity.title }}</h3>
                  <div class="activity-meta">
                    <span class="location">
                      <van-icon name="location-o" />
                      {{ activity.location }}
                    </span>
                    <span class="time">
                      <van-icon name="clock-o" />
                      {{ formatDate(activity.startTime) }}
                    </span>
                  </div>
                  <div class="activity-stats">
                    <span class="participants">
                      <van-icon name="friends-o" />
                      {{ activity.currentParticipants }}/{{ activity.maxParticipants }}
                    </span>
                    <span class="routes">
                      <van-icon name="guide-o" />
                      {{ activity.routes?.length || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <van-empty
              v-else
              :description="$t('profile.myActivities.empty.favorite')"
              image-size="60"
            />
          </van-tab>
        </van-tabs>
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { activityApi } from "../api/activity";
import { userApi } from "../api/user";
import { showToast } from "vant";
import { useI18n } from 'vue-i18n';

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

const userInfo = ref({
  id: "",
  name: "",
  avatar: "",
  createdActivities: 0,
  joinedActivities: 0,
  favoriteActivities: 0,
});

const activeTab = ref(2); // 默认选中第三个标签（profile）
const createdActivities = ref([]);
const joinedActivities = ref([]);
const favoriteActivities = ref([]);

const tabs = [
  { name: "home", icon: "home-o", textKey: "home.tabs.home", route: "/" },
  { name: "activities", icon: "search", textKey: "home.tabs.activities", route: "/activities" },
  { name: "profile", icon: "user-o", textKey: "home.tabs.profile", route: "/profile" },
];

onMounted(async () => {
  try {
    const user = await userApi.getUserInfo();
    userInfo.value = user;

    const [created, joined, favorite] = await Promise.all([
      activityApi.getUserCreatedActivities(),
      activityApi.getUserJoinedActivities(),
      activityApi.getUserFavoriteActivities(),
    ]);

    createdActivities.value = created;
    joinedActivities.value = joined;
    favoriteActivities.value = favorite;
  } catch (error) {
    showToast(t('profile.errors.loadFailed'));
    console.error(error);
  }
});

const goToActivity = (id) => {
  router.push(`/activity/${id}`);
};

const getStatusTagType = (activity) => {
  const typeMap = {
    upcoming: "primary",
    ongoing: "success",
    completed: "default",
    cancelled: "danger",
    pending: "warning",
    rejected: "danger",
  };
  return typeMap[activity.status] || "default";
};

const getCombinedStatusText = (activity) => {
  if (activity.status === 'upcoming') {
    return t(`activities.status.upcoming.${activity.phase}`);
  }
  return t(`activities.status.${activity.status}`);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const handleTabChange = (tab, index) => {
  activeTab.value = index;
  router.push(tab.route);
};
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
  position: relative;
  box-sizing: border-box;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(25px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  margin-left: 0;
  margin-right: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;

  :deep(.van-nav-bar) {
    background: transparent !important;
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
    box-sizing: border-box;

    .van-nav-bar__content {
      height: 50px;
    }

    .van-nav-bar__title {
      color: #000000;
      font-weight: 600;
      max-width: calc(100% - 120px);
    }
  }
}

.content {
  padding: 16px;
}

.user-info {
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(25px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .avatar-section {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .avatar {
      border: 3px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .user-meta {
      margin-left: 16px;

      .username {
        margin: 0 0 4px;
        font-size: 20px;
        font-weight: 600;
        color: #2c3e50;
      }

      .user-id {
        margin: 0;
        font-size: 14px;
        color: #7f8c8d;
      }
    }
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    text-align: center;

    .stat-item {
      .value {
        display: block;
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4px;
      }

      .label {
        font-size: 12px;
        color: #7f8c8d;
      }
    }
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 24px 0 16px;
  padding-left: 4px;
}

.tabs {
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(25px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  :deep(.van-tabs__wrap) {
    background: rgba(255, 255, 255, 0.5);
  }

  :deep(.van-tab) {
    color: #7f8c8d;
    font-size: 14px;
  }

  :deep(.van-tab--active) {
    color: #2c3e50;
    font-weight: 600;
  }
}

.activity-list {
  padding: 16px;
}

.activity-item {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  .activity-cover {
    position: relative;
    height: 160px;

    :deep(.van-image) {
      width: 100%;
      height: 100%;
    }

    .status-tag {
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .activity-info {
    padding: 16px;

    .activity-title {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }

    .activity-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 13px;
      color: #7f8c8d;

      .location,
      .time {
        display: flex;
        align-items: center;

        .van-icon {
          margin-right: 4px;
          font-size: 14px;
        }
      }
    }

    .activity-stats {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #7f8c8d;

      .participants,
      .routes {
        display: flex;
        align-items: center;

        .van-icon {
          margin-right: 4px;
          font-size: 14px;
        }
      }
    }
  }
}

:deep(.van-empty) {
  padding: 32px 0;
  background: transparent;

  .van-empty__description {
    color: #7f8c8d;
    font-size: 14px;
  }
}

.tabbar-container {
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 99;
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  box-sizing: border-box;

  .tabbar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 6px 0;
    height: 55px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);

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
