<template>
  <div class="favorite-activities-page">
    <van-nav-bar title="收藏的活动" left-arrow @click-left="router.back()" />

    <div class="content">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="全部">
          <div class="activities-list">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="activity-card"
              @click="router.push(`/activity/${activity.id}`)"
            >
              <div class="card-header">
                <van-image
                  :src="activity.coverImage"
                  fit="cover"
                  class="cover-image"
                />
                <div class="status-tag">
                  <van-tag :type="getStatusType(activity.status)">
                    {{ getStatusText(activity.status) }}
                  </van-tag>
                </div>
                <div
                  class="favorite-btn"
                  @click.stop="toggleFavorite(activity)"
                >
                  <van-icon
                    :name="activity.isFavorite ? 'star-fill' : 'star-o'"
                    :class="{ 'is-favorite': activity.isFavorite }"
                  />
                </div>
              </div>
              <div class="card-content">
                <h3 class="title">{{ activity.title }}</h3>
                <div class="info">
                  <span class="location">
                    <van-icon name="location-o" />
                    {{ activity.location }}
                  </span>
                  <span class="time">
                    <van-icon name="clock-o" />
                    {{ formatDate(activity.startTime) }}
                  </span>
                </div>
                <div class="participants">
                  <van-icon name="friends-o" />
                  {{ activity.currentParticipants }}/{{
                    activity.maxParticipants
                  }}人
                </div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="即将开始">
          <div class="activities-list">
            <div
              v-for="activity in upcomingActivities"
              :key="activity.id"
              class="activity-card"
              @click="router.push(`/activity/${activity.id}`)"
            >
              <div class="card-header">
                <van-image
                  :src="activity.coverImage"
                  fit="cover"
                  class="cover-image"
                />
                <div class="status-tag">
                  <van-tag type="primary">即将开始</van-tag>
                </div>
                <div
                  class="favorite-btn"
                  @click.stop="toggleFavorite(activity)"
                >
                  <van-icon
                    :name="activity.isFavorite ? 'star-fill' : 'star-o'"
                    :class="{ 'is-favorite': activity.isFavorite }"
                  />
                </div>
              </div>
              <div class="card-content">
                <h3 class="title">{{ activity.title }}</h3>
                <div class="info">
                  <span class="location">
                    <van-icon name="location-o" />
                    {{ activity.location }}
                  </span>
                  <span class="time">
                    <van-icon name="clock-o" />
                    {{ formatDate(activity.startTime) }}
                  </span>
                </div>
                <div class="participants">
                  <van-icon name="friends-o" />
                  {{ activity.currentParticipants }}/{{
                    activity.maxParticipants
                  }}人
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { activityApi } from "../api/activity";
import { Toast } from "vant";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref(0);
const activities = ref([]);

// 计算属性：即将开始的活动
const upcomingActivities = computed(() => {
  return activities.value.filter((activity) => activity.status === "upcoming");
});

// 加载收藏的活动
const loadFavoriteActivities = async () => {
  try {
    const res = await activityApi.getFavoriteActivities();
    activities.value = res.data;
  } catch (error) {
    Toast("加载失败");
  }
};

// 切换收藏状态
const toggleFavorite = async (activity) => {
  try {
    if (activity.isFavorite) {
      await activityApi.unfavoriteActivity(activity.id);
      activity.isFavorite = false;
      Toast("已取消收藏");
    } else {
      await activityApi.favoriteActivity(activity.id);
      activity.isFavorite = true;
      Toast("已收藏");
    }
  } catch (error) {
    Toast("操作失败");
  }
};

// 工具函数
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const getStatusType = (status) => {
  const types = {
    upcoming: "primary",
    ongoing: "success",
    completed: "default",
    cancelled: "danger",
  };
  return types[status] || "default";
};

const getStatusText = (status) => {
  const texts = {
    upcoming: "即将开始",
    ongoing: "进行中",
    completed: "已结束",
    cancelled: "已取消",
  };
  return texts[status] || status;
};

onMounted(() => {
  loadFavoriteActivities();
});
</script>

<style lang="scss" scoped>
.favorite-activities-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

.content {
  .activities-list {
    padding: 16px;

    .activity-card {
      margin-bottom: 16px;
      border-radius: 12px;
      background: white;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s;

      &:active {
        transform: scale(0.98);
      }

      .card-header {
        position: relative;
        height: 160px;

        .cover-image {
          width: 100%;
          height: 100%;
        }

        .status-tag {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .favorite-btn {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          .van-icon {
            font-size: 20px;
            color: var(--text-secondary);

            &.is-favorite {
              color: #ffd700;
            }
          }
        }
      }

      .card-content {
        padding: 16px;

        .title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .info {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-size: 14px;

          .van-icon {
            margin-right: 4px;
          }
        }

        .participants {
          color: var(--text-secondary);
          font-size: 14px;

          .van-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .content {
    .activities-list {
      padding: 12px;

      .activity-card {
        margin-bottom: 12px;

        .card-header {
          height: 140px;

          .favorite-btn {
            width: 28px;
            height: 28px;

            .van-icon {
              font-size: 18px;
            }
          }
        }

        .card-content {
          padding: 12px;

          .title {
            font-size: 14px;
          }

          .info,
          .participants {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
