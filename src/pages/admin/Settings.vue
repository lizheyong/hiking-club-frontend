<template>
  <div class="admin-settings-page">
    <div class="header">
      <h2>系统设置</h2>
    </div>

    <div class="content">
      <van-cell-group title="基本设置">
        <van-cell title="系统名称" :value="settings.systemName">
          <template #right-icon>
            <van-icon name="edit" @click="editSystemName" />
          </template>
        </van-cell>
        <van-cell title="系统描述" :value="settings.systemDescription">
          <template #right-icon>
            <van-icon name="edit" @click="editSystemDescription" />
          </template>
        </van-cell>
        <van-cell title="系统Logo">
          <template #value>
            <van-image
              round
              width="40"
              height="40"
              :src="settings.systemLogo"
              @click="changeLogo"
            />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group title="活动设置">
        <van-cell title="活动审核">
          <template #value>
            <van-switch
              v-model="settings.requireActivityApproval"
              size="24"
              @change="updateActivitySettings"
            />
          </template>
        </van-cell>
        <van-cell title="最大参与人数" :value="settings.maxParticipants">
          <template #right-icon>
            <van-icon name="edit" @click="editMaxParticipants" />
          </template>
        </van-cell>
        <van-cell title="活动标签">
          <template #value>
            <van-tag
              v-for="tag in settings.activityTags"
              :key="tag"
              type="primary"
              class="tag"
            >
              {{ tag }}
            </van-tag>
            <van-icon name="plus" @click="showTagPopup = true" />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group title="通知设置">
        <van-cell title="邮件通知">
          <template #value>
            <van-switch
              v-model="settings.enableEmailNotification"
              size="24"
              @change="updateNotificationSettings"
            />
          </template>
        </van-cell>
        <van-cell title="短信通知">
          <template #value>
            <van-switch
              v-model="settings.enableSMSNotification"
              size="24"
              @change="updateNotificationSettings"
            />
          </template>
        </van-cell>
        <van-cell title="系统通知">
          <template #value>
            <van-switch
              v-model="settings.enableSystemNotification"
              size="24"
              @change="updateNotificationSettings"
            />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group title="安全设置">
        <van-cell title="密码策略">
          <template #value>
            <van-icon name="arrow" @click="showPasswordPolicy = true" />
          </template>
        </van-cell>
        <van-cell title="登录策略">
          <template #value>
            <van-icon name="arrow" @click="showLoginPolicy = true" />
          </template>
        </van-cell>
        <van-cell title="数据备份">
          <template #value>
            <van-button size="small" type="primary" plain @click="backupData">
              立即备份
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group title="其他设置">
        <van-cell title="清除缓存" is-link @click="clearCache" />
        <van-cell title="系统日志" is-link @click="viewSystemLogs" />
        <van-cell title="关于系统" is-link @click="showAbout" />
      </van-cell-group>
    </div>

    <!-- 标签管理弹窗 -->
    <van-popup
      v-model:show="showTagPopup"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <div class="tag-popup">
        <div class="popup-header">
          <h3>管理标签</h3>
          <van-icon name="cross" @click="showTagPopup = false" />
        </div>
        <div class="tag-list">
          <van-tag
            v-for="tag in settings.activityTags"
            :key="tag"
            closeable
            type="primary"
            size="medium"
            class="tag"
            @close="removeTag(tag)"
          >
            {{ tag }}
          </van-tag>
          <van-field
            v-model="newTag"
            placeholder="输入新标签"
            @keyup.enter="addTag"
          >
            <template #button>
              <van-button size="small" type="primary" @click="addTag">
                添加
              </van-button>
            </template>
          </van-field>
        </div>
      </div>
    </van-popup>

    <!-- 密码策略弹窗 -->
    <van-popup
      v-model:show="showPasswordPolicy"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <div class="policy-popup">
        <div class="popup-header">
          <h3>密码策略</h3>
          <van-icon name="cross" @click="showPasswordPolicy = false" />
        </div>
        <div class="policy-content">
          <van-form @submit="updatePasswordPolicy">
            <van-cell-group inset>
              <van-field name="minLength">
                <template #label>
                  <span>最小长度</span>
                </template>
                <template #input>
                  <van-stepper
                    v-model="passwordPolicy.minLength"
                    min="6"
                    max="20"
                  />
                </template>
              </van-field>
              <van-field name="requireNumber">
                <template #label>
                  <span>必须包含数字</span>
                </template>
                <template #input>
                  <van-switch
                    v-model="passwordPolicy.requireNumber"
                    size="24"
                  />
                </template>
              </van-field>
              <van-field name="requireLetter">
                <template #label>
                  <span>必须包含字母</span>
                </template>
                <template #input>
                  <van-switch
                    v-model="passwordPolicy.requireLetter"
                    size="24"
                  />
                </template>
              </van-field>
              <van-field name="requireSpecial">
                <template #label>
                  <span>必须包含特殊字符</span>
                </template>
                <template #input>
                  <van-switch
                    v-model="passwordPolicy.requireSpecial"
                    size="24"
                  />
                </template>
              </van-field>
            </van-cell-group>
            <div class="submit-btn">
              <van-button round block type="primary" native-type="submit">
                保存
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 登录策略弹窗 -->
    <van-popup
      v-model:show="showLoginPolicy"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <div class="policy-popup">
        <div class="popup-header">
          <h3>登录策略</h3>
          <van-icon name="cross" @click="showLoginPolicy = false" />
        </div>
        <div class="policy-content">
          <van-form @submit="updateLoginPolicy">
            <van-cell-group inset>
              <van-field name="maxLoginAttempts">
                <template #label>
                  <span>最大登录尝试次数</span>
                </template>
                <template #input>
                  <van-stepper
                    v-model="loginPolicy.maxLoginAttempts"
                    min="3"
                    max="10"
                  />
                </template>
              </van-field>
              <van-field name="lockoutDuration">
                <template #label>
                  <span>锁定时间（分钟）</span>
                </template>
                <template #input>
                  <van-stepper
                    v-model="loginPolicy.lockoutDuration"
                    min="5"
                    max="60"
                    step="5"
                  />
                </template>
              </van-field>
              <van-field name="enableTwoFactor">
                <template #label>
                  <span>启用两步验证</span>
                </template>
                <template #input>
                  <van-switch v-model="loginPolicy.enableTwoFactor" size="24" />
                </template>
              </van-field>
            </van-cell-group>
            <div class="submit-btn">
              <van-button round block type="primary" native-type="submit">
                保存
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { showToast, showConfirmDialog } from "vant";
import { settingsApi } from "../../api/settings";

// 系统设置
const settings = ref({
  systemName: "",
  systemDescription: "",
  systemLogo: "",
  requireActivityApproval: true,
  maxParticipants: 50,
  activityTags: [],
  enableEmailNotification: true,
  enableSMSNotification: false,
  enableSystemNotification: true,
});

// 密码策略
const passwordPolicy = ref({
  minLength: 8,
  requireNumber: true,
  requireLetter: true,
  requireSpecial: false,
});

// 登录策略
const loginPolicy = ref({
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  enableTwoFactor: false,
});

// 弹窗控制
const showTagPopup = ref(false);
const showPasswordPolicy = ref(false);
const showLoginPolicy = ref(false);
const newTag = ref("");

// 加载设置
const loadSettings = async () => {
  try {
    const res = await settingsApi.getSettings();
    settings.value = res.data;
  } catch (error) {
    showToast("加载设置失败");
  }
};

// 更新活动设置
const updateActivitySettings = async () => {
  try {
    await settingsApi.updateActivitySettings({
      requireActivityApproval: settings.value.requireActivityApproval,
      maxParticipants: settings.value.maxParticipants,
    });
    showToast("保存成功");
  } catch (error) {
    showToast("保存失败");
  }
};

// 更新通知设置
const updateNotificationSettings = async () => {
  try {
    await settingsApi.updateNotificationSettings({
      enableEmailNotification: settings.value.enableEmailNotification,
      enableSMSNotification: settings.value.enableSMSNotification,
      enableSystemNotification: settings.value.enableSystemNotification,
    });
    showToast("保存成功");
  } catch (error) {
    showToast("保存失败");
  }
};

// 标签管理
const addTag = () => {
  if (!newTag.value) return;
  if (settings.value.activityTags.includes(newTag.value)) {
    showToast("标签已存在");
    return;
  }
  settings.value.activityTags.push(newTag.value);
  newTag.value = "";
};

const removeTag = (tag) => {
  const index = settings.value.activityTags.indexOf(tag);
  if (index > -1) {
    settings.value.activityTags.splice(index, 1);
  }
};

// 更新密码策略
const updatePasswordPolicy = async () => {
  try {
    await settingsApi.updatePasswordPolicy(passwordPolicy.value);
    showToast("保存成功");
    showPasswordPolicy.value = false;
  } catch (error) {
    showToast("保存失败");
  }
};

// 更新登录策略
const updateLoginPolicy = async () => {
  try {
    await settingsApi.updateLoginPolicy(loginPolicy.value);
    showToast("保存成功");
    showLoginPolicy.value = false;
  } catch (error) {
    showToast("保存失败");
  }
};

// 数据备份
const backupData = async () => {
  try {
    await settingsApi.backupData();
    showToast("备份成功");
  } catch (error) {
    showToast("备份失败");
  }
};

// 清除缓存
const clearCache = async () => {
  try {
    await showConfirmDialog({
      title: "清除缓存",
      message: "确定要清除系统缓存吗？",
      showCancelButton: true,
    });

    await settingsApi.clearCache();
    showToast("清除成功");
  } catch (error) {
    if (error) {
      showToast("清除失败");
    }
  }
};

// 查看系统日志
const viewSystemLogs = () => {
  // TODO: 实现查看系统日志功能
};

// 显示关于信息
const showAbout = () => {
  // TODO: 实现显示关于信息功能
};

onMounted(() => {
  loadSettings();
});
</script>

<style lang="scss" scoped>
.admin-settings-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

.header {
  padding: 16px;
  background: white;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.content {
  padding: 16px;

  .van-cell-group {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;

    .tag {
      margin-right: 8px;
    }
  }
}

.tag-popup,
.policy-popup {
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

  .tag-list,
  .policy-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .tag {
      margin: 0 8px 8px 0;
    }
  }

  .submit-btn {
    padding: 16px;
    border-top: 1px solid var(--border-color);
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .header {
    padding: 12px;

    h2 {
      font-size: 18px;
    }
  }

  .content {
    padding: 12px;

    .van-cell-group {
      margin-bottom: 12px;
    }
  }
}
</style>
