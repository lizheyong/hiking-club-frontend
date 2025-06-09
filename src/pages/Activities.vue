<template>
  <div class="activities-page">
    <div class="search-bar glass-card">
      <van-search
        v-model="searchText"
        :placeholder="$t('activities.search.placeholder')"
        shape="round"
        @search="onSearch"
      />
      <div class="filter-tags">
        <van-tag
          v-for="tag in selectedTags"
          :key="tag"
          closeable
          type="primary"
          size="medium"
          class="tag"
          @close="removeTag(tag)"
        >
          {{ tag }}
        </van-tag>
        <van-button
          size="small"
          type="primary"
          plain
          icon="plus"
          class="tag-button"
          @click="showTagPopup = true"
        >
          {{ $t('activities.search.filterTags') }}
        </van-button>
      </div>
    </div>

    <div class="activity-list">
      <transition-group name="activity-item">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-card glass-card"
          @click="goToDetail(activity.id)"
        >
          <div class="activity-image">
            <van-image :src="activity.coverImage" fit="cover" lazy-load />
            <div
              class="activity-status"
              :class="[activity.status, activity.phase]"
            >
              {{ getStatusText(activity) }}
            </div>
          </div>
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-desc">{{ activity.description }}</p>
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
            <div class="activity-footer">
              <div class="participants">
                <van-icon name="friends-o" />
                {{ $t('activities.meta.participants', {
                  current: activity.currentParticipants,
                  max: activity.maxParticipants
                }) }}
              </div>
              <div class="tags">
                <van-tag
                  v-for="tag in activity.tags"
                  :key="tag"
                  plain
                  type="primary"
                  size="small"
                >
                  {{ tag }}
                </van-tag>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 更新后的标签选择弹窗 -->
    <van-popup
      v-model:show="showTagPopup"
      position="bottom"
      round
      class="tag-popup-container"
      :style="{ height: '50%' }"
    >
      <div class="tag-popup glass-inner">
        <div class="popup-header">
          <h3 class="popup-title">{{ $t('activities.tagPopup.title') }}</h3>
          <van-icon
            name="cross"
            class="close-icon"
            @click="showTagPopup = false"
          />
        </div>
        <div class="tag-list">
          <div
            v-for="tag in availableTags"
            :key="tag"
            :class="['tag-item', selectedTags.includes(tag) ? 'selected' : '']"
            @click="toggleTag(tag)"
          >
            <span class="tag-text">{{ tag }}</span>
            <van-icon
              v-if="selectedTags.includes(tag)"
              name="success"
              class="selected-icon"
            />
          </div>
        </div>
        <div class="popup-footer">
          <van-button
            block
            class="confirm-button"
            @click="showTagPopup = false"
          >
            {{ $t('activities.tagPopup.confirm') }}
          </van-button>
        </div>
      </div>
    </van-popup>

    <van-calendar
      v-model:show="showDatePicker"
      @confirm="onDateConfirm"
      class="calendar-popup"
    />

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
import { showToast } from "vant";
import { useI18n } from 'vue-i18n';

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

// 状态
const searchText = ref("");
const selectedTags = ref([]);
const showTagPopup = ref(false);
const showDatePicker = ref(false);
const activeTab = ref(1); // 活动页面默认选中第二个标签

// 可用标签
const availableTags = computed(() => t('activities.availableTags'));

// 底部标签栏
const tabs = [
  { name: "home", icon: "home-o", textKey: "home.tabs.home", route: "/" },
  { name: "activities", icon: "search", textKey: "home.tabs.activities", route: "/activities" },
  { name: "profile", icon: "user-o", textKey: "home.tabs.profile", route: "/profile" },
];

const handleTabChange = (tab, index) => {
  activeTab.value = index;
  router.push(tab.route);
};

// 活动数据
const activities = ref([]);

// 加载活动数据
const loadActivities = async () => {
  try {
    const res = await activityApi.getActivities();
    activities.value = res.data;
  } catch (error) {
    showToast(t('activities.errors.loadFailed'));
  }
};

// 获取活动状态文本
const getStatusText = (activity) => {
  if (activity.status === 'upcoming') {
    return t(`activities.status.upcoming.${activity.phase}`);
  }
  return t(`activities.status.${activity.status}`);
};

// 过滤活动
const filteredActivities = computed(() => {
  return activities.value.filter((activity) => {
    const matchSearch =
      activity.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      activity.description
        .toLowerCase()
        .includes(searchText.value.toLowerCase());
    const matchTags =
      selectedTags.value.length === 0 ||
      selectedTags.value.every((tag) => activity.tags.includes(tag));
    return matchSearch && matchTags;
  });
});

// 标签相关方法
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
};

const removeTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  }
};

// 日期选择
const onDateConfirm = (date) => {
  showDatePicker.value = false;
};

// 工具函数
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/activity/${id}`);
};

// 搜索
const onSearch = () => {
  // 实现搜索逻辑
};

onMounted(() => {
  loadActivities();
});
</script>

<style lang="scss" scoped>
.activities-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 25%,
    #e2e2e2 50%,
    #c9d6ff 75%,
    #e0eafc 100%
  );
  padding: 16px 16px 100px;
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

.glass-inner {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  height: 100%;
  border-radius: inherit;
}

.search-bar {
  position: sticky;
  top: 16px;
  z-index: 100;
  padding: 16px;
  margin-bottom: 20px;

  :deep(.van-search) {
    padding: 0;
    background: transparent;
    margin-bottom: 12px;
  }

  :deep(.van-search__content) {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 20px;
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;

    .tag {
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.7) 0%,
        rgba(155, 89, 182, 0.7) 100%
      );
      border: 1px solid rgba(52, 152, 219, 0.3);
      color: #000000;
      font-weight: 500;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .tag-button {
      background: rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(52, 152, 219, 0.3);
      color: #000000;
      font-weight: 500;
    }
  }
}

.activity-list {
  padding: 0;
  margin-bottom: 80px;
}

.activity-card {
  margin-bottom: 20px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;

  &:active {
    transform: scale(0.98);
  }

  .activity-image {
    position: relative;
    height: 200px;

    .van-image {
      width: 100%;
      height: 100%;
    }

    .activity-status {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 6px 12px;
      border-radius: 10px;
      color: #000000;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);

      &.upcoming {
        background: linear-gradient(
          135deg,
          rgba(52, 152, 219, 0.7) 0%,
          rgba(52, 152, 219, 0.5) 100%
        );
        border: 1px solid rgba(52, 152, 219, 0.3);

        &.voting {
          background: linear-gradient(
            135deg,
            rgba(241, 196, 15, 0.7) 0%,
            rgba(241, 196, 15, 0.5) 100%
          );
          border: 1px solid rgba(241, 196, 15, 0.3);
        }

        &.enrolling {
          background: linear-gradient(
            135deg,
            rgba(46, 204, 113, 0.7) 0%,
            rgba(46, 204, 113, 0.5) 100%
          );
          border: 1px solid rgba(46, 204, 113, 0.3);
        }
      }

      &.ongoing {
        background: linear-gradient(
          135deg,
          rgba(46, 204, 113, 0.7) 0%,
          rgba(46, 204, 113, 0.5) 100%
        );
        border: 1px solid rgba(46, 204, 113, 0.3);
      }

      &.completed {
        background: linear-gradient(
          135deg,
          rgba(149, 165, 166, 0.7) 0%,
          rgba(149, 165, 166, 0.5) 100%
        );
        border: 1px solid rgba(149, 165, 166, 0.3);
      }

      &.cancelled {
        background: linear-gradient(
          135deg,
          rgba(231, 76, 60, 0.7) 0%,
          rgba(231, 76, 60, 0.5) 100%
        );
        border: 1px solid rgba(231, 76, 60, 0.3);
      }
    }
  }

  .activity-content {
    padding: 20px;

    .activity-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #000000;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
    }

    .activity-desc {
      color: #000000;
      font-size: 14px;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
    }

    .activity-meta {
      display: flex;
      gap: 16px;
      color: #000000;
      font-size: 13px;
      margin-bottom: 12px;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);

      .van-icon {
        margin-right: 4px;
        color: #000000;
      }
    }

    .activity-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .participants {
        color: #000000;
        font-size: 13px;
        text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);

        .van-icon {
          margin-right: 4px;
          color: #000000;
        }
      }

      .tags {
        display: flex;
        gap: 8px;

        .van-tag {
          background: transparent;
          border: 1px solid rgba(52, 152, 219, 0.5);
          color: #000000;
        }
      }
    }
  }
}

/* 更新后的标签弹窗样式 */
.tag-popup-container {
  border-radius: 24px 24px 0 0;
  overflow: hidden;

  .tag-popup {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.2) 100%
      );

      .popup-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #000000;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
      }

      .close-icon {
        font-size: 22px;
        color: #000000;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        padding: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .tag-list {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      background: linear-gradient(
        135deg,
        rgba(245, 247, 250, 0.7) 0%,
        rgba(195, 207, 226, 0.7) 100%
      );

      .tag-item {
        padding: 12px 16px;
        font-size: 14px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

        &.selected {
          background: linear-gradient(
            135deg,
            rgba(52, 152, 219, 0.7) 0%,
            rgba(155, 89, 182, 0.7) 100%
          );
          color: #ffffff;
          font-weight: 500;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);

          .tag-text {
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }

          .selected-icon {
            color: #ffffff;
          }
        }

        &:not(.selected) {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.8);

          .tag-text {
            color: #000000;
            text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
          }

          &:hover {
            background: rgba(255, 255, 255, 0.7);
            transform: translateY(-1px);
          }
        }

        .tag-text {
          font-weight: 500;
        }

        .selected-icon {
          font-size: 16px;
        }
      }
    }

    .popup-footer {
      padding: 16px 20px 24px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.2) 100%
      );
      border-top: 1px solid rgba(255, 255, 255, 0.6);

      .confirm-button {
        height: 48px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 16px;
        background: linear-gradient(
          135deg,
          rgba(52, 152, 219, 0.9) 0%,
          rgba(155, 89, 182, 0.9) 100%
        );
        border: none;
        color: #ffffff;
        box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

.calendar-popup {
  :deep(.van-calendar__header) {
    background: linear-gradient(
      135deg,
      rgba(52, 152, 219, 0.1) 0%,
      rgba(155, 89, 182, 0.1) 100%
    );
  }

  :deep(.van-calendar__confirm) {
    background: linear-gradient(
      135deg,
      rgba(52, 152, 219, 0.9) 0%,
      rgba(155, 89, 182, 0.9) 100%
    );
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

// 动画
.activity-item-enter-active,
.activity-item-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.activity-item-enter-from,
.activity-item-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.activity-item-move {
  transition: transform 0.4s ease;
}

// 移动端适配
@media screen and (max-width: 768px) {
  .activity-card {
    .activity-image {
      height: 160px;
    }

    .activity-content {
      .activity-title {
        font-size: 16px;
      }

      .activity-desc {
        font-size: 13px;
      }
    }
  }
}
</style>
