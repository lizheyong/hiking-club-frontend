<template>
  <div class="activity-detail-page">
    <div class="header glass-card">
      <van-nav-bar left-arrow @click-left="goBack">
        <template #title>
          <div class="nav-title">
            <span class="title-text">{{ $t('activityDetail.title') }}</span>
            <van-tag
              v-if="activity && activity.status"
              :type="getStatusTagType(activity)"
              size="medium"
              class="status-tag"
            >
              {{ getCombinedStatusText(activity) }}
              {{
                activity.phase === "review" &&
                currentUser &&
                currentUser.isAdmin
                  ? $t('activityDetail.status.review')
                  : ""
              }}
            </van-tag>
          </div>
        </template>
        <template #right>
          <van-icon
            name="ellipsis"
            size="20"
            v-if="isCreatorOrAdmin && activity"
            @click="showAdminActions = true"
          />
          <van-icon
            name="star-o"
            size="20"
            v-if="activity && !activity.isFavorite"
            @click="handleToggleFavorite"
            style="margin-left: 10px"
          />
          <van-icon
            name="star"
            size="20"
            color="#f0a500"
            v-if="activity && activity.isFavorite"
            @click="handleToggleFavorite"
            style="margin-left: 10px"
          />
        </template>
      </van-nav-bar>
    </div>

    <van-loading v-if="loading" class="loading" type="spinner" vertical>
      {{ $t('activityDetail.loading') }}
    </van-loading>
    <van-empty v-else-if="error" :description="$t('activityDetail.loadFailed', { error })" />

    <div v-else-if="activity" class="content">
      <div class="cover-image glass-card">
        <van-image :src="activity.coverImage" fit="cover" lazy-load />
        <div class="image-overlay">
          <h1 class="title">{{ activity.title }}</h1>
          <div class="meta">
            <span class="location">
              <van-icon name="location-o" />
              {{ activity.location }}
            </span>
            <span class="time">
              <van-icon name="clock-o" />
              {{ formatDate(activity.startTime) }}
            </span>
          </div>
          <div class="creator-info">{{ $t('activityDetail.meta.creator', { name: activity.creatorName }) }}</div>
        </div>
      </div>

      <div class="info-section glass-card">
        <div class="description">{{ activity.description }}</div>
        <div class="tags">
          <van-tag
            v-for="tag in activity.tags"
            :key="tag"
            plain
            type="primary"
            class="tag"
          >
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <!-- 拒绝/取消原因 -->
      <div
        v-if="activity.status === 'rejected' && activity.rejectReason"
        class="reason-card glass-card rejected"
      >
        <h4>{{ $t('activityDetail.status.rejected.title') }}</h4>
        <p>{{ activity.rejectReason }}</p>
      </div>
      <div
        v-if="activity.status === 'cancelled' && activity.cancelReason"
        class="reason-card glass-card cancelled"
      >
        <h4>{{ $t('activityDetail.status.cancelled.title') }}</h4>
        <p>{{ activity.cancelReason }}</p>
      </div>

      <!-- 路线区域 -->
      <div
        class="routes-section glass-card"
        v-if="activity.routes && activity.routes.length"
      >
        <h3 v-if="activity.phase === 'voting'">{{ $t('activityDetail.routes.voting.title') }}</h3>
        <h3 v-else-if="selectedRoute">{{ $t('activityDetail.routes.selected.title') }}</h3>
        <h3 v-else>{{ $t('activityDetail.routes.info.title') }}</h3>

        <div class="routes-list">
          <!-- 投票阶段 -->
          <template v-if="activity.phase === 'voting'">
            <div
              v-for="route in activity.routes"
              :key="route.id"
              class="route-item"
              :class="{ 'voted-by-me': route.isVoted }"
            >
              <div class="route-info">
                <h4>{{ route.title }}</h4>
                <p>{{ route.description }}</p>
                <div class="route-meta">
                  <span>{{ $t('activityDetail.routes.info.distance', { distance: route.distance }) }}</span>
                  <span>{{ $t('activityDetail.routes.info.duration', { duration: route.duration }) }}</span>
                  <span>{{ $t('activityDetail.routes.info.difficulty', { level: route.difficulty }) }}</span>
                </div>
              </div>
              <div class="route-votes">
                <van-button
                  :type="route.isVoted ? 'success' : 'warning'"
                  size="small"
                  class="vote-button"
                  @click="handleVote(route.id)"
                  :disabled="hasVotedForThisActivity && !route.isVoted"
                  :loading="votingRouteId === route.id"
                >
                  {{
                    route.isVoted
                      ? $t('activityDetail.routes.voting.myVote')
                      : hasVotedForThisActivity
                      ? $t('activityDetail.routes.voting.votedOther')
                      : $t('activityDetail.routes.voting.voteThis')
                  }}
                </van-button>
                <span class="votes-count">{{ $t('activityDetail.routes.voting.votes', { count: route.votes }) }}</span>
              </div>
            </div>
          </template>
          <!-- 非投票阶段，显示选定路线或其他 -->
          <template v-else-if="selectedRoute">
            <div class="route-item selected-route-display">
              <div class="route-info">
                <h4>{{ selectedRoute.title }}</h4>
                <p>{{ selectedRoute.description }}</p>
                <div class="route-meta">
                  <span>{{ $t('activityDetail.routes.info.distance', { distance: selectedRoute.distance }) }}</span>
                  <span>{{ $t('activityDetail.routes.info.duration', { duration: selectedRoute.duration }) }}</span>
                  <span>{{ $t('activityDetail.routes.info.difficulty', { level: selectedRoute.difficulty }) }}</span>
                </div>
              </div>
              <div v-if="selectedRoute.votes > 0" class="route-votes">
                <van-tag type="primary" size="medium">
                  {{ $t('activityDetail.routes.selected.finalVotes', { count: selectedRoute.votes }) }}
                </van-tag>
              </div>
            </div>
          </template>
          <!-- 如果没有选定路线 (例如审核中或者已结束但未选的场景) -->
          <template v-else>
            <div
              v-for="route in activity.routes"
              :key="route.id"
              class="route-item"
            >
              <div class="route-info">
                <h4>{{ route.title }}</h4>
                <p>{{ route.description }}</p>
                <div class="route-meta">
                  <span>{{ $t('activityDetail.routes.info.distance', { distance: route.distance }) }}</span>
                  <span>{{ $t('activityDetail.routes.info.duration', { duration: route.duration }) }}</span>
                  <span>{{ $t('activityDetail.routes.info.difficulty', { level: route.difficulty }) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="participants-section glass-card">
        <h3>
          {{ $t('activityDetail.participants.title', {
            current: activity.currentParticipants,
            max: activity.maxParticipants
          }) }}
          <van-tag v-if="isFull" type="danger" style="margin-left: 5px">
            {{ $t('activityDetail.participants.full') }}
          </van-tag>
        </h3>
        <div
          v-if="activity.participants && activity.participants.length"
          class="participants-list"
        >
          <div
            v-for="participant in activity.participants"
            :key="participant.id"
            class="participant"
          >
            <van-image
              :src="participant.avatar || 'https://picsum.photos/40/40?random=' + participant.id"
              round
              width="40"
              height="40"
              class="avatar"
              error-icon="user-o"
            />
            <span class="name">{{ participant.name }}</span>
            <van-button
              v-if="
                isCreatorOrAdmin &&
                currentUser &&
                participant.id !== currentUser.id
              "
              size="mini"
              type="danger"
              icon="cross"
              class="remove-participant-btn"
              @click="handleRemoveParticipant(participant)"
              :title="$t('activityDetail.participants.remove')"
            />
          </div>
        </div>
        <van-empty v-else :description="$t('activityDetail.participants.empty')" image-size="60" />
      </div>

      <!-- 主要操作按钮 -->
      <div class="action-bar-wrapper" v-if="canShowMainActionButtons">
        <div class="action-bar glass-card">
          <!-- 报名/取消报名按钮 -->
          <template v-if="activity.phase === 'enrolling'">
            <van-button
              v-if="activity.isJoined"
              type="danger"
              block
              class="action-button cancel-button"
              :loading="cancelling"
              @click="handleCancelJoin"
            >
              {{ $t('activityDetail.actions.cancelJoin') }}
            </van-button>
            <van-button
              v-else
              type="primary"
              block
              class="action-button join-button"
              :loading="joining"
              :disabled="isFull"
              @click="handleJoin"
            >
              {{ $t('activityDetail.actions.join') }}
            </van-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <van-popup
      v-model:show="showEditPopup"
      position="bottom"
      round
      :style="{ height: '80%' }"
      class="edit-popup-container"
    >
      <div class="edit-form glass-inner">
        <van-nav-bar
          title="编辑活动"
          @click-left="showEditPopup = false"
          left-arrow
        />
        <van-form @submit="handleSaveActivity" style="margin-top: 10px">
          <van-cell-group inset class="form-group">
            <van-field
              v-model="editableActivity.title"
              name="title"
              label="标题"
              placeholder="请输入活动标题"
              :rules="[{ required: true, message: '请输入活动标题' }]"
            />
            <van-field
              v-model="editableActivity.description"
              name="description"
              label="描述"
              type="textarea"
              rows="3"
              autosize
              placeholder="请输入活动描述"
              :rules="[{ required: true, message: '请输入活动描述' }]"
            />
            <van-field
              v-model="editableActivity.location"
              name="location"
              label="地点"
              placeholder="请输入活动地点"
              :rules="[{ required: true, message: '请输入活动地点' }]"
            />
            <van-field
              v-model="formattedEditableStartTime"
              name="startTime"
              label="开始时间"
              readonly
              placeholder="请选择开始时间"
              @click="showDatePicker = true"
              :rules="[{ required: true, message: '请选择开始时间' }]"
            />
            <van-field
              v-model.number="editableActivity.maxParticipants"
              name="maxParticipants"
              label="最大人数"
              type="number"
              placeholder="请输入最大参与人数"
              :rules="[
                { required: true, message: '请输入最大参与人数' },
                { validator: (val) => val > 0, message: '人数需大于0' },
              ]"
            />
            <van-field name="tags" label="标签">
              <template #input>
                <div class="tags-input">
                  <van-tag
                    v-for="tag in editableActivity.tags"
                    :key="tag"
                    closeable
                    size="medium"
                    type="primary"
                    class="tag"
                    @close="handleRemoveEditableTag(tag)"
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
                    添加
                  </van-button>
                </div>
              </template>
            </van-field>
          </van-cell-group>
          <div class="form-actions">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              class="submit-button"
              :loading="updating"
            >
              保存更新
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-calendar
      v-model:show="showDatePicker"
      @confirm="handleDateConfirm"
      :min-date="minDate"
      class="calendar-popup"
    />

    <van-popup
      v-model:show="showTagPopup"
      position="bottom"
      round
      class="tag-popup-container"
    >
      <div class="tag-popup glass-inner">
        <h3>添加标签</h3>
        <van-field
          v-model="newTag"
          placeholder="请输入标签后按回车或点添加"
          @keyup.enter="handleSaveNewTag"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              class="add-tag-button"
              @click="handleSaveNewTag"
            >
              添加
            </van-button>
          </template>
        </van-field>
        <div class="tag-popup-actions">
          <van-button block class="done-button" @click="showTagPopup = false"
            >完成</van-button
          >
        </div>
      </div>
    </van-popup>

    <!-- 管理员/创建者操作面板 -->
    <van-action-sheet
      v-model:show="showAdminActions"
      :actions="adminActionOptions"
      cancel-text="取消"
      close-on-click-action
      @select="onAdminActionSelect"
      description="管理操作"
    />

    <!-- 底部导航栏 -->
    <div
      class="tabbar-container"
      v-if="
        !showEditPopup && !showTagPopup && !showDatePicker && !showAdminActions
      "
    >
      <div class="tabbar glass-card">
        <div
          v-for="(tab, index) in TABS_CONFIG"
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
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { activityApi } from "../api/activity";
import { userApi } from '../api/user';
import { mockApi } from '../api/mock';
import { showToast, Notify, showConfirmDialog } from "vant";
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { t } = useI18n();

// --- 状态 ---
const activity = ref(null);
const loading = ref(true);
const error = ref(null);
const currentUser = ref(null);

const joining = ref(false);
const cancelling = ref(false);
const updating = ref(false);
const votingRouteId = ref(null);

const showEditPopup = ref(false);
const editableActivity = reactive({
  id: null,
  title: "",
  description: "",
  location: "",
  startTime: new Date().toISOString(),
  maxParticipants: 0,
  tags: [],
});

const showDatePicker = ref(false);
const minDate = new Date();
const showTagPopup = ref(false);
const newTag = ref("");

const activeTab = ref(1);
const showAdminActions = ref(false);

const TABS_CONFIG = [
  { name: "home", icon: "home-o", textKey: "home.tabs.home", route: "/" },
  { name: "activities", icon: "search", textKey: "home.tabs.activities", route: "/activities" },
  { name: "profile", icon: "user-o", textKey: "home.tabs.profile", route: "/profile" },
];

// --- 计算属性 ---
const isCreatorOrAdmin = computed(() => {
  if (!activity.value || !currentUser.value) return false;
  return currentUser.value.isAdmin || activity.value.creatorId === currentUser.value.id;
});

const isFull = computed(() => {
  if (!activity.value) return false;
  return activity.value.currentParticipants >= activity.value.maxParticipants;
});

const selectedRoute = computed(() => {
  if (!activity.value || !activity.value.routes) return null;
  return activity.value.routes.find(r => r.isSelected);
});

const hasVotedForThisActivity = computed(() => {
  if (!activity.value || activity.value.phase !== 'voting' || !activity.value.routes) return false;
  return activity.value.routes.some(r => r.isVoted);
});

const formattedEditableStartTime = computed(() => {
    return formatDate(editableActivity.startTime, 'YYYY-MM-DD HH:mm');
});

const canShowMainActionButtons = computed(() => {
    if (!activity.value) return false;
    return ['enrolling', 'voting', 'ongoing', 'completed', 'cancelled', 'pending', 'rejected'].includes(activity.value.phase) ||
           ['enrolling', 'voting', 'ongoing', 'completed', 'cancelled', 'pending', 'rejected'].includes(activity.value.status);
});

const adminActionOptions = computed(() => {
    const actions = [];
    if (!activity.value || !isCreatorOrAdmin.value) return actions;

    if (activity.value.status === 'pending' && currentUser.value?.isAdmin) {
        actions.push({ name: '审核通过', actionType: 'approve' });
        actions.push({ name: '审核拒绝', actionType: 'reject', color: '#ee0a24' });
    }
    if (activity.value.phase === 'voting' && isCreatorOrAdmin.value) {
        actions.push({ name: '结束投票, 开始报名', actionType: 'startEnrollment' });
    }
    if (activity.value.status === 'upcoming' && activity.value.phase === 'enrolling' && isCreatorOrAdmin.value) {
        actions.push({ name: '开始活动', actionType: 'startActivity' });
    }
    if (activity.value.status === 'ongoing' && isCreatorOrAdmin.value) {
        actions.push({ name: '完成活动', actionType: 'completeActivity' });
    }
    if (['pending', 'upcoming', 'ongoing'].includes(activity.value.status) && isCreatorOrAdmin.value) {
         actions.push({ name: '取消活动', actionType: 'cancelActivity', color: '#ee0a24' });
    }
    if (isCreatorOrAdmin.value) {
        actions.push({ name: '编辑活动信息', actionType: 'editActivity' });
    }
     if (isCreatorOrAdmin.value && activity.value.status !== 'pending') {
        actions.push({ name: '删除活动', actionType: 'deleteActivity', color: '#ee0a24', subname: '此操作不可逆' });
    }
    return actions;
});

// --- 方法 ---
const loadActivityDetail = async () => {
  const activityId = route.params.id;
  if (!activityId) {
    error.value = "未提供活动ID";
    loading.value = false;
    return;
  }
  try {
    loading.value = true;
    error.value = null;
    if (!currentUser.value) {
        try {
            currentUser.value = await userApi.getUserInfo();
        } catch (userErr) {
            console.warn("获取用户信息失败 (mock):", userErr.message);
        }
    }

    const fetchedActivity = await activityApi.getActivityDetail(activityId);
    activity.value = fetchedActivity;

    if (fetchedActivity) {
      editableActivity.id = fetchedActivity.id;
      editableActivity.title = fetchedActivity.title;
      editableActivity.description = fetchedActivity.description;
      editableActivity.location = fetchedActivity.location;
      editableActivity.startTime = fetchedActivity.startTime;
      editableActivity.maxParticipants = fetchedActivity.maxParticipants;
      editableActivity.tags = [...(fetchedActivity.tags || [])];
    }

  } catch (err) {
    console.error("加载活动详情失败:", err);
    error.value = err.message || "未知错误";
    showToast(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadActivityDetail();
});

watch(() => route.params.id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        loadActivityDetail();
    }
});

function formatDate(dateString, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateString) return '待定';
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  if (format === 'YYYY-MM-DD HH:mm') {
      return `${month} ${day}, ${year} ${hours}:${minutes}`;
  }
  return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
}

function getStatusTagType(act) {
  if (!act) return 'default';
  const statusMap = {
    upcoming: act.phase === 'voting' ? 'warning' : 'primary',
    ongoing: 'success',
    completed: 'default',
    cancelled: 'danger',
    pending: 'primary',
    rejected: 'danger',
  };
  return statusMap[act.status] || 'default';
}

function getCombinedStatusText(act) {
  if (act.status === 'upcoming') {
    return t(`activities.status.upcoming.${act.phase}`);
  }
  return t(`activities.status.${act.status}`);
}

async function handleVote(routeId) {
  if (!activity.value || !currentUser.value) {
    showToast('请先登录后再投票');
    return;
  }
  if (hasVotedForThisActivity.value && !activity.value.routes.find(r => r.id === routeId)?.isVoted) {
      showToast("您已经投过票了，每人只能投一次");
      return;
  }

  votingRouteId.value = routeId;
  try {
    await activityApi.voteRoute(activity.value.id, routeId);
    showToast("投票成功！");
    // 重新加载活动数据以获取最新的投票状态
    await loadActivityDetail();
  } catch (err) {
    console.error('投票失败:', err);
    showToast(`投票失败: ${err.message}`);
  } finally {
    votingRouteId.value = null;
  }
}

async function handleJoin() {
  if (!activity.value || !currentUser.value) {
     showToast('请先登录后再报名');
    return;
  }
  joining.value = true;
  try {
    await activityApi.joinActivity(activity.value.id);
    activity.value.isJoined = true;
    activity.value.currentParticipants++;
    if (currentUser.value && !activity.value.participants.find(p => p.id === currentUser.value.id)) {
        activity.value.participants.push({
            id: currentUser.value.id,
            name: currentUser.value.name,
            avatar: currentUser.value.avatar,
            joinTime: new Date().toISOString(),
        });
    }
    showToast("报名成功！");
  } catch (err) {
    showToast(`报名失败: ${err.message}`);
  } finally {
    joining.value = false;
  }
}

async function handleCancelJoin() {
  if (!activity.value) return;
  cancelling.value = true;
  try {
    await activityApi.cancelJoin(activity.value.id);
    activity.value.isJoined = false;
    activity.value.currentParticipants--;
    if (currentUser.value) {
        activity.value.participants = activity.value.participants.filter(p => p.id !== currentUser.value.id);
    }
    showToast("已取消报名。");
  } catch (err) {
    showToast(`取消报名失败: ${err.message}`);
  } finally {
    cancelling.value = false;
  }
}

async function handleToggleFavorite() {
    if (!activity.value) return;
    try {
        const response = await activityApi.toggleFavorite(activity.value.id);
        activity.value.isFavorite = response.isFavorite;
        showToast(response.message);
    } catch (err) {
        showToast(`操作失败: ${err.message}`);
    }
}

const openEditPopup = () => {
    if (!activity.value) return;
    editableActivity.id = activity.value.id;
    editableActivity.title = activity.value.title;
    editableActivity.description = activity.value.description;
    editableActivity.location = activity.value.location;
    editableActivity.startTime = activity.value.startTime;
    editableActivity.maxParticipants = activity.value.maxParticipants;
    editableActivity.tags = [...(activity.value.tags || [])];
    showEditPopup.value = true;
}

const handleDateConfirm = (date) => {
    editableActivity.startTime = date.toISOString();
    showDatePicker.value = false;
};

const handleRemoveEditableTag = (tagToRemove) => {
  editableActivity.tags = editableActivity.tags.filter(tag => tag !== tagToRemove);
}

const handleSaveNewTag = () => {
  if (newTag.value && !editableActivity.tags.includes(newTag.value.trim())) {
    editableActivity.tags.push(newTag.value.trim());
  }
  newTag.value = "";
}

async function handleSaveActivity() {
  if (!editableActivity.id) return;
  updating.value = true;
  try {
    const dataToUpdate = {
        ...editableActivity,
        startTime: new Date(editableActivity.startTime).toISOString(),
    };
    delete dataToUpdate.id;

    const updated = await activityApi.updateActivity(editableActivity.id, dataToUpdate);
    activity.value = { ...activity.value, ...updated };
    showEditPopup.value = false;
    showToast("活动已更新");
  } catch (err) {
    showToast(`更新失败: ${err.message}`);
  } finally {
    updating.value = false;
  }
}

async function onAdminActionSelect(item) {
    if (!activity.value) return;
    const activityId = activity.value.id;

    try {
        switch (item.actionType) {
            case 'editActivity':
                openEditPopup();
                break;
            case 'approve':
                await mockApi.approveActivity(activityId);
                activity.value.status = "upcoming";
                activity.value.phase = "voting";
                showToast("活动已审核通过");
                break;
            case 'reject':
                try {
                    await showConfirmDialog({
                        title: '拒绝活动',
                        message: '确定要拒绝这个活动吗？'
                    });
                    await activityApi.rejectActivity(activityId, '活动已被拒绝');
                    showToast('活动已拒绝');
                    loadActivityDetail();
                } catch (err) {
                    // 用户取消，无需处理
                }
                break;
            case 'startEnrollment':
                if (!activity.value.routes || activity.value.routes.length === 0) {
                    showToast("活动没有路线，无法开始报名。");
                    return;
                }
                const hasVotes = activity.value.routes.some(r => r.votes > 0);
                if (!hasVotes && activity.value.routes.length > 1) {
                    try {
                        await showConfirmDialog({ title: '提示', message: '当前没有任何路线获得投票。确定要随机选择一条并开始报名吗？' });
                    } catch (err) {
                        return; // 用户取消
                    }
                }
                await mockApi.startEnrollment(activityId);
                const updatedActivityEnroll = await activityApi.getActivityDetail(activityId);
                activity.value = updatedActivityEnroll;
                showToast("已开始报名阶段");
                break;
            case 'startActivity':
                await mockApi.startActivity(activityId);
                activity.value.status = "ongoing";
                activity.value.phase = "active";
                showToast("活动已开始");
                break;
            case 'completeActivity':
                await mockApi.completeActivity(activityId);
                activity.value.status = "completed";
                activity.value.phase = "finished";
                showToast("活动已完成");
                break;
            case 'cancelActivity':
                try {
                    await showConfirmDialog({
                        title: '取消活动',
                        message: '确定要取消这个活动吗？'
                    });
                    await activityApi.cancelActivity(activityId, '活动已被取消');
                    showToast('活动已取消');
                    loadActivityDetail();
                } catch (err) {
                    // 用户取消，无需处理
                }
                break;
            case 'deleteActivity':
                try {
                    await showConfirmDialog({ title: '确认删除', message: '确定要永久删除此活动吗？此操作不可恢复。' });
                    await activityApi.deleteActivity(activityId);
                    showToast("活动已删除");
                    router.replace('/activities');
                } catch (err) {
                    // 用户取消，无需处理
                }
                break;
            default:
                console.warn("未知的管理操作:", item.actionType);
        }
    } catch (err) {
        if (err && err.action === 'cancel') {
            // 用户取消输入，不做处理
        } else if (err.name === 'DialogCancel') {
             // 用户取消确认，不做处理
        }
        else {
            showToast(`操作失败: ${err.message || '未知错误'}`);
        }
    }
    showAdminActions.value = false;
}

async function handleRemoveParticipant(participant) {
    if (!activity.value || !isCreatorOrAdmin.value) return;
    try {
        await showConfirmDialog({
            title: "移除参与者",
            message: `确定要从活动中移除 ${participant.name} 吗？`,
        });

        await mockApi.removeParticipant(activity.value.id, participant.id);
        activity.value.participants = activity.value.participants.filter(p => p.id !== participant.id);
        activity.value.currentParticipants--;
        if (currentUser.value && participant.id === currentUser.value.id) {
            activity.value.isJoined = false;
        }
        showToast("参与者已移除。");
    } catch (err) {
       if (err && err.action === 'cancel') return;
       showToast(`移除失败: ${err.message}`);
    }
}

const handleTabChange = (tab, index) => {
  activeTab.value = index;
  if (tab.route) {
    router.push(tab.route);
  }
};

const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.activity-detail-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 25%,
    #e2e2e2 50%,
    #c9d6ff 75%,
    #e0eafc 100%
  );
  padding-bottom: calc(
    60px + env(safe-area-inset-bottom)
  );
  position: relative;
  box-sizing: border-box;

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
  margin: 0 16px 20px;

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
  padding: 15px;
  box-sizing: border-box;
  overflow-y: auto;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  margin-bottom: 16px;
  border-radius: 0 0 12px 12px;
  overflow: hidden;

  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.4);
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
    .van-nav-bar__right .van-icon {
      margin-left: 10px;
      font-size: 22px;
    }
    .van-nav-bar__left .van-icon {
      font-size: 22px;
    }
  }

  .nav-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    overflow: hidden;

    .title-text {
      color: #000000;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-tag {
      flex-shrink: 0;
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.7) 0%,
        rgba(155, 89, 182, 0.7) 100%
      );
      &.van-tag--warning {
        background: linear-gradient(
          135deg,
          rgba(241, 196, 15, 0.8) 0%,
          rgba(243, 156, 18, 0.8) 100%
        );
      }
      &.van-tag--danger {
        background: linear-gradient(
          135deg,
          rgba(231, 76, 60, 0.8) 0%,
          rgba(192, 57, 43, 0.8) 100%
        );
      }
      &.van-tag--success {
        background: linear-gradient(
          135deg,
          rgba(46, 204, 113, 0.8) 0%,
          rgba(39, 174, 96, 0.8) 100%
        );
      }
      border: none;
      color: #ffffff;
      font-weight: 500;
      padding: 3px 8px;
      border-radius: 10px;
      font-size: 11px;
    }
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding-top: 50px;
  :deep(.van-loading__spinner) {
    color: var(--van-primary-color, #1989fa);
  }
  :deep(.van-loading__text) {
    color: #000000;
  }
}
:deep(.van-empty) {
  padding-top: 50px;
  .van-empty__description {
    color: #000000;
  }
}

.content {
  padding-top: 10px;
}

.cover-image {
  position: relative;
  height: 240px;
  overflow: hidden;
  margin-bottom: 24px;
  .van-image {
    width: 100%;
    height: 100%;
  }
  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;
    background: linear-gradient(
      transparent,
      rgba(0, 0, 0, 0.75) 80%
    );
    .title {
      margin: 0 0 8px;
      font-size: 24px;
      color: #ffffff;
      font-weight: 600;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    }
    .meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 14px;
      color: #f0f0f0;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      .van-icon {
        margin-right: 6px;
        vertical-align: middle;
      }
    }
    .creator-info {
      font-size: 13px;
      color: #e0e0e0;
      margin-top: 10px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
  }
}

.info-section {
  padding: 20px;
  .description {
    margin-bottom: 20px;
    line-height: 1.7;
    color: #2c3e50;
    font-size: 15px;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    .tag {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: #34495e;
      font-weight: 500;
      padding: 5px 12px;
      border-radius: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }
}

.reason-card {
  padding: 15px 20px;
  margin-top: -10px;
  margin-bottom: 20px;
  h4 {
    margin: 0 0 10px;
    font-size: 17px;
    font-weight: 600;
  }
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
  }
  &.rejected {
    border-left: 5px solid #ee0a24;
    background: rgba(238, 10, 36, 0.05);
    h4 {
      color: #c82333;
    }
    p {
      color: #5a1219;
    }
  }
  &.cancelled {
    border-left: 5px solid #ff976a;
    background: rgba(255, 151, 106, 0.05);
    h4 {
      color: #e67e22;
    }
    p {
      color: #7d4a1f;
    }
  }
}

.participants-section {
  padding: 20px;
  h3 {
    margin: 0 0 18px;
    font-size: 18px;
    color: #2c3e50;
    font-weight: 600;
  }
  .participants-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    gap: 16px;
    .participant {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
      .avatar {
        border: 2px solid rgba(255, 255, 255, 0.7);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 48px;
        height: 48px;
      }
      .name {
        font-size: 13px;
        color: #333;
        text-align: center;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 2px;
      }
      .remove-participant-btn {
        position: absolute;
        top: -6px;
        right: -6px;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(238, 10, 36, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.5);
        :deep(.van-icon) {
          font-size: 14px;
          color: white;
        }
      }
    }
  }
  :deep(.van-empty__description) {
    color: #666;
  }
}

.routes-section {
  padding: 20px;
  h3 {
    margin: 0 0 18px;
    font-size: 18px;
    color: #2c3e50;
    font-weight: 600;
  }
  .routes-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
    .route-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      background: rgba(255, 255, 255, 0.35);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s ease-in-out;

      &:hover {
        transform: translateY(-2px);
      }

      &.voted-by-me {
        border-left: 5px solid #2ecc71;
        background: rgba(46, 204, 113, 0.1);
      }
      &.selected-route-display {
        border-left: 5px solid var(--van-primary-color, #1989fa);
        background: rgba(var(--van-primary-color-rgb, 25, 137, 250), 0.1);
      }

      .route-info {
        flex: 1;
        h4 {
          margin: 0 0 10px;
          font-size: 17px;
          color: #333;
          font-weight: 600;
        }
        p {
          margin: 0 0 10px;
          color: #555;
          font-size: 14px;
          line-height: 1.5;
        }
        .route-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 15px;
          font-size: 13px;
          color: #666;
          span {
            padding: 2px 0;
          }
        }
      }
      .route-votes {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        min-width: 90px;
        text-align: center;
        padding-top: 5px;
        .vote-button {
          min-width: 80px;
          height: 32px;
          font-size: 13px;
          border-radius: 16px;
          font-weight: 500;
          border: none;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          color: #fff;

          &.van-button--warning {
            background: linear-gradient(135deg, #fbc531, #f9a825);
          }
          &.van-button--success {
            background: linear-gradient(135deg, #45aaf2, #2d98da);
          }
          &:disabled {
            background: #bdc3c7;
            opacity: 0.8;
            box-shadow: none;
          }
          :deep(.van-loading__spinner) {
            color: white !important;
          }
        }
        .votes-count {
          font-size: 14px;
          color: #333;
          font-weight: 600;
        }
      }
    }
  }
}

.action-bar-wrapper {
  padding: 0 16px;
  margin-bottom: 20px;
}
.action-bar {
  padding: 15px 20px;
  margin: 0;
  .action-button {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 24px;
    border: none;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: transform 0.1s ease-out;

    &:active {
      transform: scale(0.98);
    }

    &.join-button {
      background: linear-gradient(135deg, #2ecc71, #27ae60);
    }
    &.cancel-button {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
    }
    &.van-button--default[disabled] {
      background: #dcdde1;
      color: #7f8c8d;
      opacity: 1;
      box-shadow: none;
    }
  }
  .van-tag {
    width: 100%;
    padding: 12px 0;
    justify-content: center;
    font-size: 15px;
    border-radius: 10px;
    font-size: 15px; // 标签字体
    border-radius: 10px; // 标签圆角
    &.van-tag--plain.van-tag--warning {
      color: #f39c12;
      border-color: #f39c12;
    }
    // 其他状态的 plain tag 颜色可以类似定义
  }
}

.edit-popup-container {
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  .edit-form {
    // glass-inner
    padding-bottom: 20px; // 给底部按钮留空间
    .van-nav-bar {
      background: transparent;
      margin: -15px -15px 10px -15px; // 调整导航栏与边缘的距离
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      :deep(.van-nav-bar__title) {
        color: #333;
        font-weight: 600;
      }
      :deep(.van-icon) {
        color: #555 !important;
      }
    }
    .form-group {
      background: transparent;
      margin-bottom: 20px;
      :deep(.van-cell) {
        background: rgba(255, 255, 255, 0.65);
        border-radius: 12px;
        margin-bottom: 12px;
        padding: 10px 16px; // 调整 cell 内边距
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
        &::after {
          display: none;
        } // 移除默认下边框
      }
      :deep(.van-field__label) {
        color: #333;
        font-weight: 500;
      }
      .tags-input {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        padding: 5px 0; // 给标签输入区域一点垂直空间
        .tag {
          background: linear-gradient(135deg, #3498db, #2980b9); // 蓝色系
          border: none;
          color: #ffffff;
          font-weight: 500;
          box-shadow: 0 2px 6px rgba(52, 152, 219, 0.2);
          padding: 4px 8px; // 标签内边距
        }
        .tag-button {
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(52, 152, 219, 0.4);
          color: #2980b9;
          font-weight: 500;
          height: 28px; // 固定添加按钮高度
          padding: 0 10px;
        }
      }
    }
    .form-actions {
      margin-top: 24px;
      padding: 0 10px; // 按钮与弹窗边缘的间距
      .submit-button {
        height: 48px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 24px;
        background: linear-gradient(135deg, #3498db, #8e44ad); // 主题渐变色
        border: none;
        box-shadow: 0 8px 16px rgba(52, 152, 219, 0.25);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.tag-popup-container {
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  .tag-popup {
    // glass-inner
    padding-bottom: calc(15px + env(safe-area-inset-bottom)); // 考虑安全区域
    h3 {
      margin: 0 0 20px;
      text-align: center;
      font-size: 18px;
      color: #333;
      font-weight: 600;
    }
    :deep(.van-field) {
      background: rgba(255, 255, 255, 0.65);
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
      .add-tag-button {
        background: linear-gradient(135deg, #3498db, #2980b9);
        border: none;
        color: #ffffff;
        font-weight: 500;
        border-radius: 8px; // 按钮圆角
        height: 32px;
      }
    }
    .tag-popup-actions {
      margin-top: 16px;
      padding: 0 10px;
      .done-button {
        height: 44px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: #333;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.calendar-popup {
  :deep(.van-calendar__header) {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      /* 更淡的背景，让文字更突出 */ rgba(255, 255, 255, 0.05) 100%
    );
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  :deep(.van-calendar__confirm) {
    background: linear-gradient(135deg, #3498db, #2980b9); // 主题色
    height: 44px;
    border-radius: 22px;
    margin: 8px 16px;
  }
}

.tabbar-container {
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 99; // 比 header 低一级，避免 Header 是 glass card 时覆盖
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom)); // 安全区域
  box-sizing: border-box;

  .tabbar {
    display: flex;
    justify-content: space-around;
    align-items: center; // 确保tab项垂直居中
    padding: 6px 0; // 调整垂直padding
    height: 55px; // 固定tabbar高度
    border-radius: 28px; // 更大的圆角
    // glass-card 样式已应用

    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center; // 确保图标和文字在tab项内居中
      flex: 1; // 让每个tab项平分宽度
      height: 100%; // 占满父容器高度
      // padding: 8px 0; // 移除这里的padding，由父级控制
      border-radius: 20px; // 给激活状态背景用
      transition: all 0.25s ease-in-out;
      cursor: pointer;
      user-select: none; // 禁止选中文本

      &.active {
        background: rgba(255, 255, 255, 0.35); // 激活背景
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1),
          inset 0 0 5px rgba(255, 255, 255, 0.2);

        .van-icon {
          color: var(--van-primary-color, #1989fa); // 激活图标颜色
          transform: scale(1.1); // 轻微放大
        }
        span {
          color: var(--van-primary-color, #1989fa); // 激活文字颜色
          font-weight: 600;
        }
      }

      .van-icon {
        font-size: 22px; // 调整图标大小
        color: #333; // 默认图标颜色
        margin-bottom: 3px; // 图标与文字间距
        transition: color 0.2s ease, transform 0.2s ease;
      }
      span {
        font-size: 11px; // 调整文字大小
        color: #555; // 默认文字颜色
        transition: color 0.2s ease;
        line-height: 1.2; // 确保文字不被截断
      }
    }
  }
}

:deep(.van-dialog) {
  background: rgba(255, 255, 255, 0.9); // 更透明一点
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 18px; // Dialog 圆角
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
:deep(.van-dialog__header) {
  padding-top: 20px;
  font-weight: 600;
  color: #333;
}
:deep(.van-dialog__content) {
  padding: 15px 20px 20px; // 调整内容padding
}
:deep(.van-dialog__message) {
  color: #444; // 消息文字颜色
  font-size: 15px;
  line-height: 1.6;
}
:deep(.van-dialog__footer) {
  padding: 10px 15px; // 底部按钮区域padding
  &::after {
    border-color: rgba(0, 0, 0, 0.08); // 分割线颜色
  }
}
:deep(.van-dialog__confirm),
:deep(.van-dialog__cancel) {
  height: 40px; // 按钮高度
  font-weight: 500;
}
:deep(.van-dialog__confirm) {
  color: var(--van-primary-color, #1989fa);
}
:deep(.van-dialog__cancel) {
  color: #666;
}
:deep(.van-dialog-prompt) {
  .van-field {
    margin: 10px 0;
    border: 1px solid #eee;
    border-radius: 8px;
    background-color: #fcfcfc;
  }
}

// ActionSheet 样式
:deep(.van-action-sheet) {
  border-radius: 16px 16px 0 0;
  background-color: rgba(248, 249, 250, 0.95); // 半透明背景
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  max-height: 70%; // 限制最大高度
  .van-action-sheet__description {
    text-align: center;
    color: #6c757d; // 描述文字颜色
    padding: 12px 16px;
    font-size: 13px;
  }
  .van-action-sheet__item {
    color: #343a40; // 选项文字颜色
    font-size: 16px;
    &:not(:last-child)::after {
      border-bottom-color: rgba(0, 0, 0, 0.06); // 分割线颜色
    }
    &.van-action-sheet__item--loading {
      color: #6c757d;
    }
  }
  .van-action-sheet__cancel {
    color: #495057;
    font-weight: 500;
    background-color: rgba(255, 255, 255, 0.7);
    margin-top: 8px; // 与选项的间距
  }
  .van-action-sheet__gap {
    height: 8px; // 顶部安全区域的垫片
    background-color: transparent; // 通常不需要背景
  }
}
</style>
