<template>
  <div class="admin-activities-page">
    <div class="header">
      <van-search
        v-model="searchText"
        placeholder="搜索活动"
        @search="onSearch"
      />
      <van-button type="primary" icon="plus" @click="showCreatePopup = true">
        创建活动
      </van-button>
    </div>

    <div class="content">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="全部">
          <div class="activities-list">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="activity-card"
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
                <div class="creator">
                  <van-icon name="manager-o" />
                  创建者：{{ activity.creatorName }}
                </div>
              </div>
              <div class="card-actions">
                <van-button
                  size="small"
                  type="primary"
                  plain
                  icon="edit"
                  @click="editActivity(activity)"
                >
                  编辑
                </van-button>
                <van-button
                  size="small"
                  type="danger"
                  plain
                  icon="delete-o"
                  @click="deleteActivity(activity)"
                >
                  删除
                </van-button>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="待审核">
          <div class="activities-list">
            <div
              v-for="activity in pendingActivities"
              :key="activity.id"
              class="activity-card"
            >
              <div class="card-header">
                <van-image
                  :src="activity.coverImage"
                  fit="cover"
                  class="cover-image"
                />
                <div class="status-tag">
                  <van-tag type="warning">待审核</van-tag>
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
                <div class="creator">
                  <van-icon name="manager-o" />
                  创建者：{{ activity.creatorName }}
                </div>
              </div>
              <div class="card-actions">
                <van-button
                  size="small"
                  type="success"
                  plain
                  icon="passed"
                  @click="approveActivity(activity)"
                >
                  通过
                </van-button>
                <van-button
                  size="small"
                  type="danger"
                  plain
                  icon="close"
                  @click="rejectActivity(activity)"
                >
                  拒绝
                </van-button>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <van-popup
      v-model:show="showCreatePopup"
      position="bottom"
      round
      :style="{ height: '90%' }"
    >
      <div class="edit-popup">
        <div class="popup-header">
          <h3>创建活动</h3>
          <van-icon name="cross" @click="showCreatePopup = false" />
        </div>
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.title"
              name="title"
              label="活动标题"
              placeholder="请输入活动标题"
              :rules="[{ required: true, message: '请输入活动标题' }]"
            />
            <van-field
              v-model="form.description"
              name="description"
              label="活动描述"
              type="textarea"
              placeholder="请输入活动描述"
              :rules="[{ required: true, message: '请输入活动描述' }]"
            />
            <van-field
              v-model="form.location"
              name="location"
              label="活动地点"
              placeholder="请输入活动地点"
              :rules="[{ required: true, message: '请输入活动地点' }]"
            />
            <van-field
              v-model="form.startTime"
              name="startTime"
              label="开始时间"
              placeholder="请选择开始时间"
              readonly
              :rules="[{ required: true, message: '请选择开始时间' }]"
              @click="showDatePicker = true"
            />
            <van-field
              v-model="form.maxParticipants"
              name="maxParticipants"
              label="最大参与人数"
              type="number"
              placeholder="请输入最大参与人数"
              :rules="[{ required: true, message: '请输入最大参与人数' }]"
            />
            <van-field name="tags" label="活动标签">
              <template #input>
                <van-tag
                  v-for="tag in form.tags"
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
                  @click="showTagPopup = true"
                >
                  添加标签
                </van-button>
              </template>
            </van-field>
          </van-cell-group>
          <div class="submit-btn">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="submitting"
            >
              创建活动
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-calendar v-model:show="showDatePicker" @confirm="onDateConfirm" />

    <van-popup
      v-model:show="showTagPopup"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <div class="tag-popup">
        <div class="popup-header">
          <h3>选择标签</h3>
          <van-icon name="cross" @click="showTagPopup = false" />
        </div>
        <div class="tag-list">
          <van-tag
            v-for="tag in availableTags"
            :key="tag"
            :type="form.tags.includes(tag) ? 'primary' : 'default'"
            size="medium"
            class="tag"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </van-tag>
        </div>
        <div class="popup-footer">
          <van-button block type="primary" @click="showTagPopup = false">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { activityApi } from "../../api/activity";
import { showToast, showConfirmDialog } from "vant";

const searchText = ref("");
const activeTab = ref(0);
const activities = ref([]);
const showCreatePopup = ref(false);
const showDatePicker = ref(false);
const showTagPopup = ref(false);
const submitting = ref(false);

// 表单数据
const form = ref({
  title: "",
  description: "",
  location: "",
  startTime: "",
  maxParticipants: "",
  tags: [],
});

// 可用标签
const availableTags = [
  "徒步",
  "登山",
  "露营",
  "摄影",
  "观星",
  "野餐",
  "亲子",
  "交友",
];

// 计算属性
const pendingActivities = computed(() => {
  return activities.value.filter((activity) => activity.status === "pending");
});

// 加载活动列表
const loadActivities = async () => {
  try {
    console.log('Loading activities...');
    const res = await activityApi.getActivities();
    console.log('Activities response:', res);
    activities.value = res.data || [];
    console.log('Activities loaded:', activities.value.length);
  } catch (error) {
    console.error('加载活动失败:', error);
    showToast("加载失败");
  }
};

// 搜索活动
const onSearch = () => {
  // TODO: 实现搜索功能
};

// 编辑活动
const editActivity = (activity) => {
  form.value = {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    location: activity.location,
    startTime: activity.startTime,
    maxParticipants: activity.maxParticipants,
    tags: [...activity.tags],
  };
  showCreatePopup.value = true;
};

// 删除活动
const deleteActivity = async (activity) => {
  try {
    await showConfirmDialog({
      title: "删除活动",
      message: "确定要删除该活动吗？",
      showCancelButton: true,
    });

    await activityApi.deleteActivity(activity.id);
    activities.value = activities.value.filter((a) => a.id !== activity.id);
    showToast("删除成功");
  } catch (error) {
    if (error) {
      showToast("删除失败");
    }
  }
};

// 审核活动
const approveActivity = async (activity) => {
  try {
    await activityApi.approveActivity(activity.id);
    activity.status = "upcoming";
    showToast("已通过");
  } catch (error) {
    showToast("操作失败");
  }
};

const rejectActivity = async (activity) => {
  try {
    await showConfirmDialog({
      title: "拒绝活动",
      message: "确定要拒绝该活动吗？",
      showCancelButton: true,
    });

    await activityApi.rejectActivity(activity.id);
    activity.status = "cancelled";
    showToast("已拒绝");
  } catch (error) {
    if (error) {
      showToast("操作失败");
    }
  }
};

// 标签相关方法
const toggleTag = (tag) => {
  const index = form.value.tags.indexOf(tag);
  if (index > -1) {
    form.value.tags.splice(index, 1);
  } else {
    form.value.tags.push(tag);
  }
};

const removeTag = (tag) => {
  const index = form.value.tags.indexOf(tag);
  if (index > -1) {
    form.value.tags.splice(index, 1);
  }
};

// 日期选择
const onDateConfirm = (date) => {
  form.value.startTime = formatDate(date);
  showDatePicker.value = false;
};

// 提交表单
const onSubmit = async () => {
  try {
    submitting.value = true;
    if (form.value.id) {
      await activityApi.updateActivity(form.value.id, form.value);
      showToast("保存成功");
    } else {
      await activityApi.createActivity(form.value);
      showToast("创建成功");
    }
    showCreatePopup.value = false;
    loadActivities();
  } catch (error) {
    showToast("操作失败");
  } finally {
    submitting.value = false;
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
    pending: "warning",
    upcoming: "primary",
    ongoing: "success",
    completed: "default",
    cancelled: "danger",
  };
  return types[status] || "default";
};

const getStatusText = (status) => {
  const texts = {
    pending: "待审核",
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
.admin-activities-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

.header {
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  background: white;

  .van-search {
    flex: 1;
  }
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

        .participants,
        .creator {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 8px;

          .van-icon {
            margin-right: 4px;
          }
        }
      }

      .card-actions {
        padding: 12px 16px;
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  }
}

.edit-popup,
.tag-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);

    h3 {
      margin: 0;
      font-size: 18px;
    }
  }

  .van-form {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
  }

  .submit-btn {
    padding: 16px;
    border-top: 1px solid var(--border-color);
  }
}

.tag-popup {
  .tag-list {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .header {
    padding: 12px;
  }

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
          .participants,
          .creator {
            font-size: 12px;
          }
        }

        .card-actions {
          padding: 8px 12px;

          .van-button {
            padding: 0 8px;
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
