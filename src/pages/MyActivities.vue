<template>
  <div class="my-activities-page">
    <van-nav-bar title="我的活动" left-arrow @click-left="router.back()" />

    <div class="content">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="已报名">
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
        <van-tab title="已结束">
          <div class="activities-list">
            <div
              v-for="activity in completedActivities"
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
                  <van-tag type="default">已结束</van-tag>
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { activityApi } from "../api/activity";
import { showToast } from "vant";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref(0);
const activities = ref([]);
const completedActivities = ref([]);

// 加载活动列表
const loadActivities = async () => {
  try {
    const res = await activityApi.getMyActivities();
    activities.value = res.data.filter(
      (activity) => activity.status !== "completed"
    );
    completedActivities.value = res.data.filter(
      (activity) => activity.status === "completed"
    );
  } catch (error) {
    showToast("加载失败");
  }
};

// 工具函数
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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
  loadActivities();
});
</script>

<style lang="scss" scoped>
.my-activities-page {
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
