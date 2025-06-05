<template>
  <div class="activity-detail-page">
    <div class="header glass-card">
      <van-nav-bar left-arrow @click-left="goBack">
        <template #title>
          <div class="nav-title">
            <span class="title-text">活动详情</span>
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
                  ? "(待审核)"
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

    <van-loading v-if="loading" class="loading" type="spinner" vertical
      >加载中...</van-loading
    >
    <van-empty v-else-if="error" :description="`加载失败: ${error}`" />

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
          <div class="creator-info">发起人: {{ activity.creatorName }}</div>
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
        <h4>活动被拒原因</h4>
        <p>{{ activity.rejectReason }}</p>
      </div>
      <div
        v-if="activity.status === 'cancelled' && activity.cancelReason"
        class="reason-card glass-card cancelled"
      >
        <h4>活动取消原因</h4>
        <p>{{ activity.cancelReason }}</p>
      </div>

      <!-- 路线区域 -->
      <div
        class="routes-section glass-card"
        v-if="activity.routes && activity.routes.length"
      >
        <h3 v-if="activity.phase === 'voting'">路线投票 (选择一条)</h3>
        <h3 v-else-if="selectedRoute">活动路线</h3>
        <h3 v-else>路线信息</h3>

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
                  <span>距离: {{ route.distance }}公里</span>
                  <span>时长: {{ route.duration }}小时</span>
                  <span>难度: {{ route.difficulty }}</span>
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
                      ? "我的投票"
                      : hasVotedForThisActivity
                      ? "已投其他"
                      : "投此路线"
                  }}
                </van-button>
                <span class="votes-count">{{ route.votes }}票</span>
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
                  <span>距离: {{ selectedRoute.distance }}公里</span>
                  <span>时长: {{ selectedRoute.duration }}小时</span>
                  <span>难度: {{ selectedRoute.difficulty }}</span>
                </div>
              </div>
              <div v-if="selectedRoute.votes > 0" class="route-votes">
                <van-tag type="primary" size="medium"
                  >最终票数: {{ selectedRoute.votes }}</van-tag
                >
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
                  <span>距离: {{ route.distance }}公里</span>
                  <span>时长: {{ route.duration }}小时</span>
                  <span>难度: {{ route.difficulty }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="participants-section glass-card">
        <h3>
          参与者 ({{ activity.currentParticipants }}/{{
            activity.maxParticipants
          }})
          <van-tag v-if="isFull" type="danger" style="margin-left: 5px"
            >已满员</van-tag
          >
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
              :src="participant.avatar"
              round
              width="40"
              height="40"
              class="avatar"
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
              title="移除该参与者"
            />
          </div>
        </div>
        <van-empty v-else description="暂无参与者" image-size="60" />
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
              取消报名
            </van-button>
            <van-button
              v-else-if="!isFull"
              type="primary"
              block
              class="action-button join-button"
              :loading="joining"
              @click="handleJoin"
            >
              立即报名
            </van-button>
            <van-button
              v-else
              type="default"
              block
              class="action-button"
              disabled
            >
              已满员
            </van-button>
          </template>
          <!-- 其他阶段提示 -->
          <van-tag
            v-else-if="activity.phase === 'voting'"
            type="warning"
            size="large"
            block
            plain
            >路线投票中，暂不能报名</van-tag
          >
          <van-tag
            v-else-if="activity.status === 'ongoing'"
            type="success"
            size="large"
            block
            plain
            >活动进行中</van-tag
          >
          <van-tag
            v-else-if="activity.status === 'completed'"
            type="default"
            size="large"
            block
            plain
            >活动已结束</van-tag
          >
          <van-tag
            v-else-if="activity.status === 'cancelled'"
            type="danger"
            size="large"
            block
            plain
            >活动已取消</van-tag
          >
          <van-tag
            v-else-if="activity.status === 'pending'"
            type="primary"
            size="large"
            block
            plain
            >活动审核中</van-tag
          >
          <van-tag
            v-else-if="activity.status === 'rejected'"
            type="danger"
            size="large"
            block
            plain
            >活动未通过审核</van-tag
          >
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
          <span>{{ tab.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
// import { useUserStore } from "../stores/user"; // 假设你用Pinia
import { activityApi } from "../api/activity"; // 你的 activity.js
import { userApi } from '../api/user'; // 你的 user.js
import { mockApi } from '../api/mock'; //直接用mockApi里的管理员操作
import { showToast, Dialog, Notify } from "vant";

const router = useRouter();
const route = useRoute();
// const userStore = useUserStore(); // 如果使用 Pinia

// --- 状态 ---
const activity = ref(null);
const loading = ref(true);
const error = ref(null);
const currentUser = ref(null); // 模拟当前登录用户

const joining = ref(false);
const cancelling = ref(false);
const updating = ref(false);
const votingRouteId = ref(null); // 记录正在投票的路线ID，用于loading

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
const minDate = new Date(); // 日期选择器最小可选今天
const showTagPopup = ref(false);
const newTag = ref("");

const activeTab = ref(1); // 活动页面默认选中第二个标签 (根据你的TABS_CONFIG)
const showAdminActions = ref(false);


// --- Mock User ---
// onMounted(async () => {
//   // 模拟从 store 或 auth service 获取当前用户
//   if (userStore.user) {
//       currentUser.value = userStore.user;
//   } else {
//       // 如果store中没有，尝试从API获取（对于mock，这会返回mockUsers[0]）
//       try {
//         currentUser.value = await userApi.getUserInfo();
//         userStore.setUser(currentUser.value); // 可选：如果希望存入store
//       } catch (e) {
//         console.warn("无法获取模拟用户信息:", e.message)
//       }
//   }
// });
// --- END Mock User ---

// --- 底部标签栏配置 (从你原来的代码迁移) ---
const TABS_CONFIG = [
  { name: "home", icon: "home-o", text: "首页", route: "/" },
  { name: "activities", icon: "search", text: "活动", route: "/activities" },
  { name: "profile", icon: "user-o", text: "我的", route: "/profile" },
];

const handleTabChange = (tab, index) => {
  activeTab.value = index;
  if (route.path !== tab.route) {
     router.push(tab.route);
  }
};
const goBack = () => router.back();

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
  // mock.js 中 isVoted 代表用户对 *这条* 路线的投票状态
  // 所以需要检查所有路线中是否有 isVoted 为 true 的
  return activity.value.routes.some(r => r.isVoted);
});

const formattedEditableStartTime = computed(() => {
    return formatDate(editableActivity.startTime, 'YYYY-MM-DD HH:mm');
});

const canShowMainActionButtons = computed(() => {
    if (!activity.value) return false;
    // 只在特定阶段显示主要的报名/取消报名按钮区域
    return ['enrolling', 'voting', 'ongoing', 'completed', 'cancelled', 'pending', 'rejected'].includes(activity.value.phase) ||
           ['enrolling', 'voting', 'ongoing', 'completed', 'cancelled', 'pending', 'rejected'].includes(activity.value.status);
});

// --- 管理员操作选项 ---
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
    if (isCreatorOrAdmin.value) { // 任何时候创建者或管理员都可以编辑
        actions.push({ name: '编辑活动信息', actionType: 'editActivity' });
    }
     if (isCreatorOrAdmin.value && activity.value.status !== 'pending' && activity.value.status !== 'cancelled' && activity.value.status !== 'rejected') {
        actions.push({ name: '删除活动', actionType: 'deleteActivity', color: '#ee0a24', subname: '此操作不可逆' });
    }
    return actions;
});

// --- 方法 ---
const loadActivityDetail = async () => {
  const activityId = Number(route.params.id);
  if (!activityId) {
    error.value = "未提供活动ID";
    loading.value = false;
    return;
  }
  try {
    loading.value = true;
    error.value = null; // 重置错误
    // 模拟获取当前用户
    if (!currentUser.value) { // 避免重复获取
        try {
            currentUser.value = await userApi.getUserInfo();
        } catch (userErr) {
            console.warn("获取用户信息失败 (mock):", userErr.message);
            // 即使获取用户失败，也尝试加载活动详情，但某些操作可能受限
        }
    }

    const fetchedActivity = await activityApi.getActivityDetail(activityId);
    activity.value = fetchedActivity;

    // 初始化编辑表单数据
    if (fetchedActivity) {
      editableActivity.id = fetchedActivity.id;
      editableActivity.title = fetchedActivity.title;
      editableActivity.description = fetchedActivity.description;
      editableActivity.location = fetchedActivity.location;
      editableActivity.startTime = fetchedActivity.startTime; // 保持ISO字符串
      editableActivity.maxParticipants = fetchedActivity.maxParticipants;
      editableActivity.tags = [...(fetchedActivity.tags || [])];
    }

  } catch (err) {
    console.error("加载活动详情失败:", err);
    error.value = err.message || "未知错误";
    showToast(error.value);
    // router.back(); // 考虑是否自动返回
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadActivityDetail();
});

// 监听路由变化，如果 activity id 变了，重新加载 (例如从一个详情页跳到另一个)
watch(() => route.params.id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        loadActivityDetail();
    }
});


function formatDate(dateString, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateString) return '待定';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  if (format === 'YYYY-MM-DD HH:mm') {
      return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getStatusTagType(act) {
  if (!act) return 'default';
  const statusMap = {
    upcoming: act.phase === 'voting' ? 'warning' : 'primary',
    ongoing: 'success',
    completed: 'default',
    cancelled: 'danger',
    pending: 'primary', // Vant 没有 'warning' plain tag, 用 primary 代替
    rejected: 'danger',
  };
  return statusMap[act.status] || 'default';
}

function getCombinedStatusText(act) {
  if (!act) return '';
  const statusTextMap = {
    upcoming: '即将开始',
    ongoing: '正在进行',
    completed: '已结束',
    cancelled: '已取消',
    pending: '审核中',
    rejected: '已拒绝',
  };
  const phaseTextMap = {
    voting: ' (路线投票中)',
    enrolling: ' (报名中)',
    // active, finished, cancelled, review, rejected 通常不需额外phase文字，status已说明
  };
  let text = statusTextMap[act.status] || act.status;
  if (act.phase && (act.phase === 'voting' || act.phase === 'enrolling')) {
      text += phaseTextMap[act.phase] || '';
  }
  return text;
}

async function handleVote(routeId) {
  if (!activity.value || !currentUser.value) { // 检查用户是否登录
    showToast('请先登录后再投票');
    // router.push('/login'); // 跳转到登录页
    return;
  }
  if (hasVotedForThisActivity.value && !activity.value.routes.find(r => r.id === routeId)?.isVoted) {
      showToast("您已经投过票了，每人只能投一次");
      return;
  }

  votingRouteId.value = routeId;
  try {
    await activityApi.voteRoute(activity.value.id, routeId);
    // 更新本地数据以反映投票状态 - mock.js 的 voteRoute 应该会更新 isVoted 和 votes
    // 为确保一致性，可以重新获取活动详情，或者相信 mock.js 的修改
    const votedActivityRoute = activity.value.routes.find(r => r.id === routeId);
    if (votedActivityRoute) {
        // 如果 mock API 没有正确增加 votes 或设置 isVoted, 在这里手动改
        if (!votedActivityRoute.isVoted) votedActivityRoute.votes++; // 假设 API 会处理重复投票
        votedActivityRoute.isVoted = true;

        // 如果业务逻辑是只能投一个，需要把其他路线的 isVoted 置为 false (如果之前投过别的)
        activity.value.routes.forEach(r => {
            if (r.id !== routeId && r.isVoted) r.isVoted = false;
        });
    }
    showToast("投票成功！");
    // 如果mockAPI不能保证数据一致性，可以考虑重新加载
    // await loadActivityDetail();
  } catch (err) {
    showToast(`投票失败: ${err.message}`);
  } finally {
    votingRouteId.value = null;
  }
}

async function handleJoin() {
  if (!activity.value || !currentUser.value) {
     showToast('请先登录后再报名');
    // router.push('/login');
    return;
  }
  joining.value = true;
  try {
    await activityApi.joinActivity(activity.value.id);
    activity.value.isJoined = true;
    activity.value.currentParticipants++;
    // 添加当前用户到参与者列表（简化，实际应从API响应获取或重新拉取）
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
    // 从参与者列表移除当前用户
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
        const response = await mockApi.toggleFavorite(activity.value.id); // 使用 mockApi 中的
        activity.value.isFavorite = response.isFavorite;
        showToast(response.message);
    } catch (err) {
        showToast(`操作失败: ${err.message}`);
    }
}


// --- 编辑相关 ---
const openEditPopup = () => {
    if (!activity.value) return;
    // 重新从 activity ref填充，确保是最新数据
    editableActivity.id = activity.value.id;
    editableActivity.title = activity.value.title;
    editableActivity.description = activity.value.description;
    editableActivity.location = activity.value.location;
    editableActivity.startTime = activity.value.startTime; // ISO String
    editableActivity.maxParticipants = activity.value.maxParticipants;
    editableActivity.tags = [...(activity.value.tags || [])];
    showEditPopup.value = true;
}

const handleDateConfirm = (date) => { // date 是 Date 对象
    // Vant Calendar 返回的 date 参数本身就是一个 Date 对象
    // 所以不需要 new Date(date.getFullYear(), ...) 除非你有特殊目的只取年月日
    // 直接使用 date.toISOString() 即可

    // 如果你的意图是只保留日期部分，并将时间设置为当天的开始（00:00:00 本地时间）
    // const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    // editableActivity.startTime = selectedDateOnly.toISOString();

    // 如果直接使用 Vant Calendar 返回的日期（可能包含它默认的时间，通常是选择当天的某个时间点）
    editableActivity.startTime = date.toISOString();
    showDatePicker.value = false;
}; // 注意这里有分号，虽然在很多情况下JS会自动插入，但明确写上更好
const handleRemoveEditableTag = (tagToRemove) => {
  editableActivity.tags = editableActivity.tags.filter(tag => tag !== tagToRemove);
}

const handleSaveNewTag = () => {
  if (newTag.value && !editableActivity.tags.includes(newTag.value.trim())) {
    editableActivity.tags.push(newTag.value.trim());
  }
  newTag.value = ""; // 清空输入
  // showTagPopup.value = false; // 添加后可以选择不立即关闭，让用户连续添加
}

async function handleSaveActivity() {
  if (!editableActivity.id) return;
  updating.value = true;
  try {
    // 确保 startTime 是 ISO 字符串
    const dataToUpdate = {
        ...editableActivity,
        startTime: new Date(editableActivity.startTime).toISOString(), // 确保是标准格式
    };
    delete dataToUpdate.id; // API 通常不需要在body中传id

    const updated = await activityApi.updateActivity(editableActivity.id, dataToUpdate);
    // 更新主 activity 对象
    activity.value = { ...activity.value, ...updated };
    showEditPopup.value = false;
    showToast("活动已更新");
  } catch (err) {
    showToast(`更新失败: ${err.message}`);
  } finally {
    updating.value = false;
  }
}

// --- 管理员/创建者操作处理 ---
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
                const rejectReason = await Dialog.prompt({ title: '拒绝原因', message: '请输入拒绝此活动的原因 (可选)' });
                if (rejectReason.action === 'confirm') { // Vant 3 Dialog.prompt
                    await mockApi.rejectActivity(activityId, rejectReason.value || "管理员未提供原因");
                    activity.value.status = "rejected";
                    activity.value.phase = "rejected";
                    activity.value.rejectReason = rejectReason.value || "管理员未提供原因";
                    showToast("活动已拒绝");
                }
                break;
            case 'startEnrollment':
                if (!activity.value.routes || activity.value.routes.length === 0) {
                    showToast("活动没有路线，无法开始报名。");
                    return;
                }
                const hasVotes = activity.value.routes.some(r => r.votes > 0);
                if (!hasVotes && activity.value.routes.length > 1) {
                    const confirmed = await Dialog.confirm({ title: '提示', message: '当前没有任何路线获得投票。确定要随机选择一条并开始报名吗？' });
                    if (confirmed.action !== 'confirm') return;
                }
                await mockApi.startEnrollment(activityId);
                const updatedActivityEnroll = await activityApi.getActivityDetail(activityId); // 重新获取以更新路线选择状态
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
                const cancelReasonResult = await Dialog.prompt({ title: '取消活动', message: '请输入取消活动的原因 (可选)' });
                 if (cancelReasonResult.action === 'confirm') {
                    await mockApi.cancelActivity(activityId, cancelReasonResult.value || "组织者取消");
                    activity.value.status = "cancelled";
                    activity.value.phase = "cancelled";
                    activity.value.cancelReason = cancelReasonResult.value || "组织者取消";
                    showToast("活动已取消");
                }
                break;
            case 'deleteActivity':
                const confirmDelete = await Dialog.confirm({ title: '确认删除', message: '确定要永久删除此活动吗？此操作不可恢复。', confirmButtonColor: '#ee0a24'});
                if (confirmDelete.action === 'confirm') {
                    await activityApi.deleteActivity(activityId); // 使用 activityApi 里的删除
                    showToast("活动已删除");
                    router.replace('/activities'); // 或其他合适的页面
                }
                break;
            default:
                console.warn("未知的管理操作:", item.actionType);
        }
    } catch (err) {
        if (err && err.action === 'cancel') { // Dialog.prompt 取消
            // 用户取消输入，不做处理
        } else if (err.name === 'DialogCancel') { // Dialog.confirm 取消 (Vant 2.x)
             // 用户取消确认，不做处理
        }
        else {
            showToast(`操作失败: ${err.message || '未知错误'}`);
        }
    }
    showAdminActions.value = false; // 关闭动作面板
}

async function handleRemoveParticipant(participant) {
    if (!activity.value || !isCreatorOrAdmin.value) return;
    try {
        const confirmResult = await Dialog.confirm({
            title: "移除参与者",
            message: `确定要从活动中移除 ${participant.name} 吗？`,
        });

        if (confirmResult.action === 'confirm') {
            await mockApi.removeParticipant(activity.value.id, participant.id);
            // 更新参与者列表和计数
            activity.value.participants = activity.value.participants.filter(p => p.id !== participant.id);
            activity.value.currentParticipants--;
            if (currentUser.value && participant.id === currentUser.value.id) {
                activity.value.isJoined = false;
            }
            showToast("参与者已移除。");
        }
    } catch (err) {
       if (err && err.action === 'cancel') return;
       showToast(`移除失败: ${err.message}`);
    }
}
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
  ); // 为底部tabbar留出空间，并考虑安全区域
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
  overflow: hidden; // 防止内部内容溢出影响圆角

  // 应用 glass-card 样式到 header 本身，而不是作为子元素
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  margin-left: 0; // sticky 时占满宽度
  margin-right: 0; // sticky 时占满宽度
  border-top-left-radius: 0; // 顶部不需要圆角
  border-top-right-radius: 0;

  :deep(.van-nav-bar) {
    background: transparent !important; // 确保透明
    width: 100%; // 确保导航栏内容区占满
    padding-left: 16px; // 给左箭头留出空间
    padding-right: 16px; // 给右侧图标留出空间
    box-sizing: border-box;

    .van-nav-bar__content {
      height: 50px; // 可以根据需要调整导航栏高度
    }

    .van-nav-bar__title {
      color: #000000;
      font-weight: 600;
      max-width: calc(100% - 120px); // 留出左右按钮空间
    }
    .van-icon {
      color: #000000 !important;
    }
    .van-nav-bar__right .van-icon {
      margin-left: 10px; // 右侧图标之间的间距
      font-size: 22px; // 图标大小
    }
    .van-nav-bar__left .van-icon {
      font-size: 22px; // 返回箭头图标大小
    }
  }

  .nav-title {
    display: flex;
    align-items: center;
    justify-content: center; // 使标题内容居中
    gap: 8px;
    width: 100%; // 确保 flex 容器占满可用空间
    overflow: hidden; // 防止文字过长溢出

    .title-text {
      color: #000000;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-tag {
      flex-shrink: 0; // 防止tag被压缩
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
      padding: 3px 8px; // 调整padding
      border-radius: 10px;
      font-size: 11px; // 调整字体大小
    }
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding-top: 50px; // 避免被sticky header遮挡
  :deep(.van-loading__spinner) {
    color: var(--van-primary-color, #1989fa);
  }
  :deep(.van-loading__text) {
    color: #000000;
  }
}
:deep(.van-empty) {
  padding-top: 50px; // 避免被sticky header遮挡
  .van-empty__description {
    color: #000000;
  }
}

.content {
  padding-top: 10px; // 与 header 的间距
}

.cover-image {
  position: relative;
  height: 240px; // 稍微高一点
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
    padding: 16px 20px; // 调整padding
    background: linear-gradient(
      transparent,
      rgba(0, 0, 0, 0.75) 80%
    ); // 渐变调整
    .title {
      margin: 0 0 8px;
      font-size: 24px; // 调整字体
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
        vertical-align: middle; // 图标与文字对齐
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
    color: #2c3e50; // 深灰色，更易读
    font-size: 15px;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px; // 标签间距
    .tag {
      background: rgba(255, 255, 255, 0.1); // 半透明背景
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: #34495e; // 深色文字
      font-weight: 500;
      padding: 5px 12px;
      border-radius: 15px; // 更圆润的标签
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }
}

.reason-card {
  padding: 15px 20px;
  margin-top: -10px; // 调整与上方卡片的间距
  margin-bottom: 20px; // 确保与下方卡片有间距
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
    background: rgba(238, 10, 36, 0.05); // 更淡的背景
    h4 {
      color: #c82333;
    }
    p {
      color: #5a1219;
    }
  }
  &.cancelled {
    border-left: 5px solid #ff976a;
    background: rgba(255, 151, 106, 0.05); // 更淡的背景
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
    margin: 0 0 18px; // 增加与列表的间距
    font-size: 18px;
    color: #2c3e50;
    font-weight: 600;
  }
  .participants-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); // 调整最小宽度
    gap: 16px;
    .participant {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
      .avatar {
        border: 2px solid rgba(255, 255, 255, 0.7);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // 增加阴影
        width: 48px; // 统一大小
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
        padding: 0 2px; // 防止文字紧贴边缘
      }
      .remove-participant-btn {
        position: absolute;
        top: -6px; // 调整位置
        right: -6px;
        border-radius: 50%;
        width: 22px; // 稍大一点
        height: 22px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(238, 10, 36, 0.8); // 按钮背景色
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
    gap: 18px; // 路线间距
    .route-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start; // 垂直方向顶部对齐
      gap: 12px; // 内部元素间距
      background: rgba(255, 255, 255, 0.35); // 背景更明显些
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08); // 阴影调整
      transition: transform 0.2s ease-in-out;

      &:hover {
        transform: translateY(-2px); // 轻微上浮效果
      }

      &.voted-by-me {
        border-left: 5px solid #2ecc71; // Vant success color
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
          gap: 8px 15px; // 行间距和列间距
          font-size: 13px;
          color: #666;
          span {
            padding: 2px 0; // 给meta一点垂直空间
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
        padding-top: 5px; // 给投票按钮一点上边距
        .vote-button {
          min-width: 80px;
          height: 32px; // 固定按钮高度
          font-size: 13px;
          border-radius: 16px; // 圆角按钮
          font-weight: 500;
          border: none; // 通常渐变按钮不需要边框
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          color: #fff; // 统一文字颜色为白色

          &.van-button--warning {
            // 投票按钮
            background: linear-gradient(135deg, #fbc531, #f9a825); // 黄色系渐变
          }
          &.van-button--success {
            // 已投票/我的投票
            background: linear-gradient(135deg, #45aaf2, #2d98da); // 蓝色系渐变
          }
          &:disabled {
            // 已投其他或loading时
            background: #bdc3c7; // 灰色
            opacity: 0.8;
            box-shadow: none;
          }
          :deep(.van-loading__spinner) {
            color: white !important; // loading图标颜色
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
  padding: 15px 20px; // 增加内边距
  margin: 0;
  .action-button {
    height: 48px; // 按钮高度
    font-size: 16px;
    font-weight: 600;
    border-radius: 24px; // 更圆的按钮
    border: none;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: transform 0.1s ease-out;

    &:active {
      transform: scale(0.98);
    }

    &.join-button {
      background: linear-gradient(135deg, #2ecc71, #27ae60); // 绿色报名
    }
    &.cancel-button {
      background: linear-gradient(135deg, #e74c3c, #c0392b); // 红色取消
    }
    &.van-button--default[disabled] {
      //满员状态
      background: #dcdde1; // 浅灰色
      color: #7f8c8d; // 文字颜色
      opacity: 1; // 不需要额外透明度
      box-shadow: none;
    }
  }
  .van-tag {
    width: 100%;
    padding: 12px 0; // 标签内边距
    justify-content: center;
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
