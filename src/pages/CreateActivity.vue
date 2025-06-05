<template>
  <div class="create-activity-page">
    <div class="header glass-card">
      <div class="header-actions">
        <van-icon name="arrow-left" @click="router.back()" />
        <h2>发布活动</h2>
        <div class="placeholder"></div>
      </div>
    </div>

    <div class="form-container">
      <van-form @submit="onSubmit">
        <div class="form-section glass-card">
          <h3 class="section-title">基本信息</h3>
          <van-cell-group inset class="form-group">
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
              rows="4"
              autosize
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
          </van-cell-group>
        </div>

        <div class="form-section glass-card">
          <h3 class="section-title">时间与人数</h3>
          <van-cell-group inset class="form-group">
            <van-field
              v-model="form.startTime"
              name="startTime"
              label="开始时间"
              placeholder="请选择开始时间"
              readonly
              :rules="[{ required: true, message: '请选择开始时间' }]"
              @click="showDatePicker = true"
            >
              <template #right-icon>
                <van-icon name="calendar-o" />
              </template>
            </van-field>
            <van-field
              v-model="form.maxParticipants"
              name="maxParticipants"
              label="最大参与人数"
              type="number"
              placeholder="请输入最大参与人数"
              :rules="[
                { required: true, message: '请输入最大参与人数' },
                {
                  validator: maxParticipantsValidator,
                  message: '最大参与人数不能超过30人',
                },
              ]"
            >
              <template #right-icon>
                <van-icon name="friends-o" />
              </template>
            </van-field>
          </van-cell-group>
        </div>

        <div class="form-section glass-card">
          <h3 class="section-title">活动标签 (最多5个)</h3>
          <van-cell-group inset class="form-group">
            <div class="tag-container">
              <div class="selected-tags">
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
                  v-if="form.tags.length < 5"
                  size="small"
                  type="primary"
                  plain
                  icon="plus"
                  class="tag-button"
                  @click="showTagPopup = true"
                >
                  添加标签
                </van-button>
              </div>
            </div>
          </van-cell-group>
        </div>

        <div class="form-section glass-card">
          <h3 class="section-title">封面图片 (1张)</h3>
          <van-cell-group inset class="form-group">
            <van-uploader
              v-model="fileList"
              :max-count="1"
              :after-read="afterRead"
              upload-text="上传封面图片"
              class="uploader"
            />
          </van-cell-group>
        </div>

        <div class="submit-btn">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            class="submit-button"
            :loading="loading"
          >
            发布活动
          </van-button>
        </div>
      </van-form>
    </div>

    <van-popup
      v-model:show="showTagPopup"
      position="bottom"
      round
      class="tag-popup-container"
      :style="{ height: '50%' }"
    >
      <div class="tag-popup glass-inner">
        <div class="popup-header">
          <h3 class="popup-title">选择标签</h3>
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
            :class="['tag-item', form.tags.includes(tag) ? 'selected' : '']"
            @click="toggleTag(tag)"
          >
            <span class="tag-text">{{ tag }}</span>
            <van-icon
              v-if="form.tags.includes(tag)"
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
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <van-calendar
      v-model:show="showDatePicker"
      @confirm="onDateConfirm"
      class="calendar-popup"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { activityApi } from "../api/activity";
import { Toast } from "vant";

const router = useRouter();
const userStore = useUserStore();

// 状态变量
const showTagPopup = ref(false);
const showDatePicker = ref(false);
const loading = ref(false);
const fileList = ref([]);

// 表单数据
const form = ref({
  title: "",
  description: "",
  location: "",
  startTime: "",
  maxParticipants: "",
  tags: [],
  coverImage: "", // 将存储图片URL
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

// 日期选择
const onDateConfirm = (date) => {
  form.value.startTime = formatDate(date);
  showDatePicker.value = false;
};

// 标签相关方法
const toggleTag = (tag) => {
  const index = form.value.tags.indexOf(tag);
  if (index > -1) {
    // 如果存在，则移除
    form.value.tags.splice(index, 1);
  } else {
    // 如果不存在，检查是否已达到数量上限
    if (form.value.tags.length >= 5) {
      Toast("最多只能选择5个标签");
      return;
    }
    // 未达到上限，则添加
    form.value.tags.push(tag);
  }
};

const removeTag = (tag) => {
  const index = form.value.tags.indexOf(tag);
  if (index > -1) {
    form.value.tags.splice(index, 1);
  }
};

// 图片上传
const afterRead = (file) => {
  // 阻止默认行为，开始上传
  file.status = 'uploading';
  file.message = '上传中...';

  // 在实际应用中，这里应该调用上传API
  // 为了演示，我们模拟一个上传过程，然后直接使用本地URL
  setTimeout(() => {
    // 假设上传成功
    form.value.coverImage = file.content; // 将图片的base64存入表单
    file.status = 'done';
    file.message = '';
    Toast.success("图片上传成功");
  }, 1000); // 模拟1秒上传时间
};

// 表单提交
const onSubmit = async () => {
  if (!userStore.user) {
    router.push("/login");
    return;
  }
  
  if (!form.value.coverImage) {
    Toast("请上传封面图片");
    return;
  }

  try {
    loading.value = true;
    // 假设 createActivity 接受整个 form 对象
    await activityApi.createActivity(form.value);
    Toast.success("发布成功");
    router.push("/activities");
  } catch (error) {
    Toast.fail("发布失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// Vant Form 自定义校验函数
const maxParticipantsValidator = (val) => {
  if (val > 30) {
    return false;
  }
  return true;
};

// 工具函数
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  // 注意：Vant 的 Calendar 默认返回的日期不含时间，这里我们手动格式化
  // 如果需要选择时间，建议使用 van-datetime-picker
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} 09:00`; // 默认一个开始时间
};

// 检查登录状态
onMounted(() => {
  if (!userStore.user) {
    Toast("请先登录");
    router.push("/login");
  }
});
</script>

<style lang="scss" scoped>
.create-activity-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 25%,
    #e2e2e2 50%,
    #c9d6ff 75%,
    #e0eafc 100%
  );
  padding: 0 0 32px;
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

.header {
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 0 0 20px 20px;

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .van-icon {
      font-size: 24px;
      color: #000000;
      cursor: pointer;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #000000;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
    }

    .placeholder {
      width: 24px;
    }
  }
}

.form-container {
  padding: 0 16px;
}

.form-section {
  margin-bottom: 20px;
  padding: 20px;

  .section-title {
    margin: 0 0 16px;
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
  }

  .form-group {
    background: transparent;

    :deep(.van-cell) {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 12px;
      margin-bottom: 12px;
      padding: 12px 16px;
    }

    :deep(.van-cell:last-child) {
      margin-bottom: 0;
    }

    :deep(.van-cell::after) {
      display: none;
    }

    :deep(.van-field__label) {
      color: #000000;
      font-weight: 500;
    }
  }

  .tag-container {
    padding: 12px;

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;

      .tag {
        background: linear-gradient(
          135deg,
          rgba(52, 152, 219, 0.7) 0%,
          rgba(155, 89, 182, 0.7) 100%
        );
        border: 1px solid rgba(52, 152, 219, 0.3);
        color: #ffffff;
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

  .uploader {
    padding: 12px;
    :deep(.van-uploader__wrapper) {
      justify-content: center;
    }

    :deep(.van-uploader__upload) {
      width: 100%;
      height: 120px;
      margin: 0;
      background: rgba(255, 255, 255, 0.3);
      border: 1px dashed rgba(52, 152, 219, 0.5);
      border-radius: 12px;
    }
    
    :deep(.van-uploader__preview) {
        margin: 0;
    }

    :deep(.van-uploader__preview-image) {
      width: 100%;
      height: 160px;
      border-radius: 12px;
      overflow: hidden;
      display: block;
    }
  }
}

.submit-btn {
  padding: 16px;
  margin-top: 32px;

  .submit-button {
    height: 50px;
    font-size: 18px;
    font-weight: 600;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      rgba(52, 152, 219, 0.9) 0%,
      rgba(155, 89, 182, 0.9) 100%
    );
    border: none;
    box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
}

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
      align-content: flex-start;
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
          margin-left: 8px;
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
</style>