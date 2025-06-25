<template>
  <div class="create-activity-page">
    <div class="header glass-card">
      <van-nav-bar
        left-arrow
        @click-left="goBack"
      >
        <template #title>
          <span class="title-text">{{ $t('createActivity.title') }}</span>
        </template>
      </van-nav-bar>
    </div>

    <div class="content">
      <van-form @submit="onSubmit">
        <div class="form-section glass-card">
          <h3 class="section-title">{{ $t('createActivity.basicInfo.title') }}</h3>
          
          <van-field
            v-model="formData.title"
            name="title"
            :label="$t('createActivity.basicInfo.title')"
            :placeholder="$t('createActivity.basicInfo.titlePlaceholder')"
            :rules="[{ required: true, message: $t('createActivity.basicInfo.titleRequired') }]"
          />

          <van-field
            v-model="formData.description"
            name="description"
            :label="$t('createActivity.basicInfo.description')"
            :placeholder="$t('createActivity.basicInfo.descriptionPlaceholder')"
            type="textarea"
            rows="4"
            :rules="[{ required: true, message: $t('createActivity.basicInfo.descriptionRequired') }]"
          />

          <van-field
            v-model="formData.location"
            name="location"
            :label="$t('createActivity.basicInfo.location')"
            :placeholder="$t('createActivity.basicInfo.locationPlaceholder')"
            :rules="[{ required: true, message: $t('createActivity.basicInfo.locationRequired') }]"
          />

          <van-field
            v-model="formData.startTime"
            name="startTime"
            :label="$t('createActivity.basicInfo.startTime')"
            :placeholder="$t('createActivity.basicInfo.startTimePlaceholder')"
            readonly
            :rules="[{ required: true, message: $t('createActivity.basicInfo.startTimeRequired') }]"
            @click="showDatePicker = true"
          />

          <van-field
            v-model="formData.maxParticipants"
            name="maxParticipants"
            :label="$t('createActivity.basicInfo.maxParticipants')"
            :placeholder="$t('createActivity.basicInfo.maxParticipantsPlaceholder')"
            type="number"
            :rules="[
              { required: true, message: $t('createActivity.basicInfo.maxParticipantsRequired') },
              { validator: validateMaxParticipants, message: $t('createActivity.basicInfo.maxParticipantsInvalid') }
            ]"
          />
        </div>

        <div class="form-section glass-card">
          <h3 class="section-title">{{ $t('createActivity.routes.title') }}</h3>
          
          <div class="routes-list">
            <div
              v-for="(route, index) in formData.routes"
              :key="index"
              class="route-item glass-card"
            >
              <div class="route-header">
                <h4>{{ $t('createActivity.routes.route', { number: index + 1 }) }}</h4>
                <van-button
                  v-if="formData.routes.length > 1"
                  type="danger"
                  size="small"
                  icon="delete-o"
                  @click="removeRoute(index)"
                >
                  {{ $t('createActivity.routes.remove') }}
                </van-button>
              </div>

              <van-field
                v-model="route.title"
                :label="$t('createActivity.routes.title')"
                :placeholder="$t('createActivity.routes.titlePlaceholder')"
                :rules="[{ required: true, message: $t('createActivity.routes.titleRequired') }]"
              />

              <van-field
                v-model="route.description"
                :label="$t('createActivity.routes.description')"
                :placeholder="$t('createActivity.routes.descriptionPlaceholder')"
                type="textarea"
                rows="3"
                :rules="[{ required: true, message: $t('createActivity.routes.descriptionRequired') }]"
              />

              <van-field
                v-model="route.distance"
                :label="$t('createActivity.routes.distance')"
                :placeholder="$t('createActivity.routes.distancePlaceholder')"
                type="number"
                :rules="[
                  { required: true, message: $t('createActivity.routes.distanceRequired') },
                  { validator: validateDistance, message: $t('createActivity.routes.distanceInvalid') }
                ]"
              />

              <van-field
                v-model="route.duration"
                :label="$t('createActivity.routes.duration')"
                :placeholder="$t('createActivity.routes.durationPlaceholder')"
                type="number"
                :rules="[
                  { required: true, message: $t('createActivity.routes.durationRequired') },
                  { validator: validateDuration, message: $t('createActivity.routes.durationInvalid') }
                ]"
              />

                            <van-field
                :model-value="getDifficultyText(route.difficulty)"
                :label="$t('createActivity.routes.difficulty')"
                :placeholder="$t('createActivity.routes.difficultyPlaceholder')"
                readonly
                :rules="[{ required: true, message: $t('createActivity.routes.difficultyRequired') }]"
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
              {{ $t('createActivity.routes.add') }}
            </van-button>
          </div>
        </div>

        <div class="form-section glass-card">
          <h3 class="section-title">{{ $t('createActivity.tags.title') }}</h3>
          
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
            :placeholder="$t('createActivity.tags.placeholder')"
            @keyup.enter="addTag"
          >
            <template #button>
              <van-button
                size="small"
                type="primary"
                @click="addTag"
              >
                {{ $t('createActivity.tags.add') }}
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
            {{ $t('createActivity.submit') }}
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 日期选择器 -->
    <van-popup 
      v-model:show="showDatePicker" 
      position="bottom"
    >
      <van-date-picker
        v-model="currentDate"
        :title="$t('createActivity.datePicker.title')"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 难度选择器 -->
    <van-popup 
      v-model:show="showDifficultyPicker" 
      position="bottom"
    >
      <van-picker
        v-model="currentDifficulty"
        :title="$t('createActivity.difficultyPicker.title')"
        :columns="difficultyOptions"
        @confirm="onDifficultyConfirm"
        @cancel="showDifficultyPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { activityApi } from "../api/activity";
import { showToast } from "vant";
import { useI18n } from 'vue-i18n';

const router = useRouter();
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
const currentDate = ref(['2024', '01', '01']); // DatePicker在Vant 4中使用数组格式
const currentDifficulty = ref([]);

const difficultyOptions = computed(() => [
  { text: t('createActivity.difficultyPicker.easy'), value: 'Easy' },
  { text: t('createActivity.difficultyPicker.medium'), value: 'Medium' },
  { text: t('createActivity.difficultyPicker.hard'), value: 'Hard' },
]);

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

const onDateConfirm = () => {
  // 处理日期确认 - Vant 4.x DatePicker返回数组格式 [year, month, day]
  const [year, month, day] = currentDate.value;
  formData.startTime = `${year}-${month}-${day}`;
  showDatePicker.value = false;
};

const onDifficultyConfirm = ({ selectedOptions }) => {
  // 处理难度确认
  formData.routes[currentRouteIndex.value].difficulty = selectedOptions[0].value;
  showDifficultyPicker.value = false;
};

const getDifficultyText = (value) => {
  const option = difficultyOptions.value.find(opt => opt.value === value);
  return option ? option.text : '';
};

const onSubmit = async () => {
  console.log('Submitting formData:', JSON.stringify(formData, null, 2));
  try {
    submitting.value = true;
    const activity = await activityApi.createActivity(formData);
    showToast(t('createActivity.success'));
    router.push(`/activity/${activity.id}`);
  } catch (error) {
    showToast(t('createActivity.errors.createFailed'));
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.create-activity-page {
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
  z-index: 10000 !important;
}

:deep(.van-picker) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 10001 !important;
}

:deep(.van-date-picker) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 10001 !important;
}

:deep(.van-overlay) {
  z-index: 9999 !important;
}
</style>