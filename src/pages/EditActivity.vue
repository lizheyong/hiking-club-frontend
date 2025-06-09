<template>
  <div class="edit-activity-page">
    <div class="header glass-card">
      <van-nav-bar
        left-arrow
        @click-left="goBack"
      >
        <template #title>
          <span class="title-text">{{ $t('editActivity.title') }}</span>
        </template>
      </van-nav-bar>
    </div>

    <div class="content">
      <van-form @submit="onSubmit">
        <div class="form-section glass-card">
          <h3 class="section-title">{{ $t('editActivity.basicInfo.title') }}</h3>
          
          <van-field
            v-model="formData.title"
            name="title"
            :label="$t('editActivity.basicInfo.title')"
            :placeholder="$t('editActivity.basicInfo.titlePlaceholder')"
            :rules="[{ required: true, message: $t('editActivity.basicInfo.titleRequired') }]"
          />

          <van-field
            v-model="formData.description"
            name="description"
            :label="$t('editActivity.basicInfo.description')"
            :placeholder="$t('editActivity.basicInfo.descriptionPlaceholder')"
            type="textarea"
            rows="4"
            :rules="[{ required: true, message: $t('editActivity.basicInfo.descriptionRequired') }]"
          />

          <van-field
            v-model="formData.location"
            name="location"
            :label="$t('editActivity.basicInfo.location')"
            :placeholder="$t('editActivity.basicInfo.locationPlaceholder')"
            :rules="[{ required: true, message: $t('editActivity.basicInfo.locationRequired') }]"
          />

          <van-field
            v-model="formData.startTime"
            name="startTime"
            :label="$t('editActivity.basicInfo.startTime')"
            :placeholder="$t('editActivity.basicInfo.startTimePlaceholder')"
            readonly
            :rules="[{ required: true, message: $t('editActivity.basicInfo.startTimeRequired') }]"
            @click="showDatePicker = true"
          />

          <van-field
            v-model="formData.maxParticipants"
            name="maxParticipants"
            :label="$t('editActivity.basicInfo.maxParticipants')"
            :placeholder="$t('editActivity.basicInfo.maxParticipantsPlaceholder')"
            type="number"
            :rules="[
              { required: true, message: $t('editActivity.basicInfo.maxParticipantsRequired') },
              { validator: validateMaxParticipants, message: $t('editActivity.basicInfo.maxParticipantsInvalid') }
            ]"
          />
        </div>

        <div class="form-section glass-card">
          <h3 class="section-title">{{ $t('editActivity.routes.title') }}</h3>
          
          <div class="routes-list">
            <div
              v-for="(route, index) in formData.routes"
              :key="index"
              class="route-item glass-card"
            >
              <div class="route-header">
                <h4>{{ $t('editActivity.routes.route', { number: index + 1 }) }}</h4>
                <van-button
                  v-if="formData.routes.length > 1"
                  type="danger"
                  size="small"
                  icon="delete-o"
                  @click="removeRoute(index)"
                >
                  {{ $t('editActivity.routes.remove') }}
                </van-button>
              </div>

              <van-field
                v-model="route.title"
                :label="$t('editActivity.routes.title')"
                :placeholder="$t('editActivity.routes.titlePlaceholder')"
                :rules="[{ required: true, message: $t('editActivity.routes.titleRequired') }]"
              />

              <van-field
                v-model="route.description"
                :label="$t('editActivity.routes.description')"
                :placeholder="$t('editActivity.routes.descriptionPlaceholder')"
                type="textarea"
                rows="3"
                :rules="[{ required: true, message: $t('editActivity.routes.descriptionRequired') }]"
              />

              <van-field
                v-model="route.distance"
                :label="$t('editActivity.routes.distance')"
                :placeholder="$t('editActivity.routes.distancePlaceholder')"
                type="number"
                :rules="[
                  { required: true, message: $t('editActivity.routes.distanceRequired') },
                  { validator: validateDistance, message: $t('editActivity.routes.distanceInvalid') }
                ]"
              />

              <van-field
                v-model="route.duration"
                :label="$t('editActivity.routes.duration')"
                :placeholder="$t('editActivity.routes.durationPlaceholder')"
                type="number"
                :rules="[
                  { required: true, message: $t('editActivity.routes.durationRequired') },
                  { validator: validateDuration, message: $t('editActivity.routes.durationInvalid') }
                ]"
              />

              <van-field
                v-model="route.difficulty"
                :label="$t('editActivity.routes.difficulty')"
                :placeholder="$t('editActivity.routes.difficultyPlaceholder')"
                readonly
                :rules="[{ required: true, message: $t('editActivity.routes.difficultyRequired') }]"
                @click="showDifficultyPicker = true; currentRouteIndex = index"
              />
            </div>
          </div>

          <div class="add-route">
            <van-button
              type="primary"
              size="small"
              icon="plus"
              @click="addRoute"
            >
              {{ $t('editActivity.routes.add') }}
            </van-button>
          </div>
        </div>

        <div class="form-section glass-card">
          <h3 class="section-title">{{ $t('editActivity.tags.title') }}</h3>
          
          <div class="tags-container">
            <van-tag
              v-for="tag in formData.tags"
              :key="tag"
              closeable
              type="primary"
              class="tag"
              @close="removeTag(tag)"
            >
              {{ tag }}
            </van-tag>
          </div>

          <van-field
            v-model="newTag"
            :placeholder="$t('editActivity.tags.placeholder')"
            @keyup.enter="addTag"
          >
            <template #button>
              <van-button
                size="small"
                type="primary"
                @click="addTag"
              >
                {{ $t('editActivity.tags.add') }}
              </van-button>
            </template>
          </van-field>
        </div>

        <div class="submit-section">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="submitting"
          >
            {{ $t('editActivity.submit') }}
          </van-button>
        </div>
      </van-form>
    </div>

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        :title="$t('editActivity.datePicker.title')"
        :min-date="minDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDifficultyPicker" position="bottom">
      <van-picker
        :title="$t('editActivity.difficultyPicker.title')"
        :columns="difficultyOptions"
        @confirm="onDifficultyConfirm"
        @cancel="showDifficultyPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { activityApi } from "../api/activity";
import { showToast } from "vant";
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { t } = useI18n();

const formData = reactive({
  title: "",
  description: "",
  location: "",
  startTime: "",
  maxParticipants: "",
  routes: [
    {
      title: "",
      description: "",
      distance: "",
      duration: "",
      difficulty: "",
    },
  ],
  tags: [],
});

const newTag = ref("");
const submitting = ref(false);
const showDatePicker = ref(false);
const showDifficultyPicker = ref(false);
const currentRouteIndex = ref(0);
const minDate = new Date();

const difficultyOptions = [
  t('editActivity.difficultyPicker.easy'),
  t('editActivity.difficultyPicker.medium'),
  t('editActivity.difficultyPicker.hard'),
];

const validateMaxParticipants = (value) => {
  const num = parseInt(value);
  return num >= 2 && num <= 100;
};

const validateDistance = (value) => {
  const num = parseFloat(value);
  return num > 0 && num <= 100;
};

const validateDuration = (value) => {
  const num = parseFloat(value);
  return num > 0 && num <= 24;
};

const addRoute = () => {
  formData.routes.push({
    title: "",
    description: "",
    distance: "",
    duration: "",
    difficulty: "",
  });
};

const removeRoute = (index) => {
  formData.routes.splice(index, 1);
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag);
    newTag.value = "";
  }
};

const removeTag = (tag) => {
  const index = formData.tags.indexOf(tag);
  if (index > -1) {
    formData.tags.splice(index, 1);
  }
};

const onDateConfirm = (date) => {
  formData.startTime = date.toLocaleDateString();
  showDatePicker.value = false;
};

const onDifficultyConfirm = (value) => {
  formData.routes[currentRouteIndex.value].difficulty = value;
  showDifficultyPicker.value = false;
};

const loadActivity = async () => {
  try {
    const activityId = route.params.id;
    const activity = await activityApi.getActivity(activityId);
    
    // 检查是否是活动创建者
    if (activity.creator.id !== userStore.user?.id) {
      showToast(t('editActivity.errors.notCreator'));
      router.push(`/activity/${activityId}`);
      return;
    }

    // 填充表单数据
    formData.title = activity.title;
    formData.description = activity.description;
    formData.location = activity.location;
    formData.startTime = activity.startTime;
    formData.maxParticipants = activity.maxParticipants;
    formData.routes = activity.routes;
    formData.tags = activity.tags;
  } catch (error) {
    showToast(t('editActivity.errors.loadFailed'));
    console.error(error);
    router.push('/activities');
  }
};

const onSubmit = async () => {
  try {
    submitting.value = true;
    const activityId = route.params.id;
    await activityApi.updateActivity(activityId, formData);
    showToast(t('editActivity.success'));
    router.push(`/activity/${activityId}`);
  } catch (error) {
    showToast(t('editActivity.errors.updateFailed'));
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  if (!userStore.user) {
    showToast(t('editActivity.errors.notLoggedIn'));
    router.push('/login');
    return;
  }
  loadActivity();
});
</script>

<style lang="scss" scoped>
.edit-activity-page {
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

    .van-icon {
      color: #000000 !important;
    }
  }
}

.content {
  padding: 16px;
}

.form-section {
  margin-bottom: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(25px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .section-title {
    margin: 0;
    padding: 16px 16px 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
  }

  :deep(.van-field) {
    background: transparent;
    padding: 12px 16px;

    &::after {
      display: none;
    }

    .van-field__label {
      color: #2c3e50;
      font-weight: 500;
    }

    .van-field__control {
      color: #2c3e50;
    }
  }
}

.routes-list {
  padding: 0 16px 16px;

  .route-item {
    margin-bottom: 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.35);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.5);

      h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: #2c3e50;
      }
    }

    :deep(.van-field) {
      padding: 12px 16px;
    }
  }
}

.add-route {
  padding: 0 16px 16px;
  text-align: center;
}

.tags-container {
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .tag {
    background: rgba(255, 255, 255, 0.35);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #2c3e50;
    font-weight: 500;
    padding: 5px 12px;
    border-radius: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.submit-section {
  padding: 20px 16px;
  margin-bottom: 20px;

  .van-button {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    border: none;
    box-shadow: 0 8px 20px rgba(46, 204, 113, 0.3);
  }
}

:deep(.van-popup) {
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

:deep(.van-picker) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

:deep(.van-date-picker) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}
</style> 