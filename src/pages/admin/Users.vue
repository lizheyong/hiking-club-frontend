<template>
  <div class="admin-users-page">
    <div class="header">
      <van-search
        v-model="searchText"
        placeholder="搜索用户"
        @search="onSearch"
      />
      <van-button type="primary" icon="plus" @click="showCreatePopup = true">
        添加用户
      </van-button>
    </div>

    <div class="content">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="全部用户">
          <div class="users-list">
            <div v-for="user in users" :key="user.id" class="user-card">
              <div class="user-info">
                <van-image
                  round
                  width="50"
                  height="50"
                  :src="user.avatar"
                  class="avatar"
                />
                <div class="info">
                  <h3 class="username">{{ user.username || user.name }}</h3>
                  <div class="details">
                    <span class="email">
                      <van-icon name="envelop-o" />
                      {{ user.email }}
                    </span>
                    <span class="phone">
                      <van-icon name="phone-o" />
                      {{ user.phone }}
                    </span>
                  </div>
                  <div class="role">
                    <van-tag :type="(user.isAdmin || user.is_admin) ? 'danger' : 'primary'">
                      {{ (user.isAdmin || user.is_admin) ? "管理员" : "普通用户" }}
                    </van-tag>
                  </div>
                </div>
              </div>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="label">参与活动</span>
                  <span class="value">{{ user.participatedActivities }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">创建活动</span>
                  <span class="value">{{ user.createdActivities }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">收藏活动</span>
                  <span class="value">{{ user.favoriteActivities }}</span>
                </div>
              </div>
              <div class="card-actions">
                <van-button
                  v-if="!(user.isAdmin || user.is_admin)"
                  size="small"
                  type="primary"
                  plain
                  icon="edit"
                  @click="editUser(user)"
                >
                  编辑
                </van-button>
                <van-button
                  v-if="!(user.isAdmin || user.is_admin)"
                  size="small"
                  type="danger"
                  plain
                  icon="delete-o"
                  @click="deleteUser(user)"
                >
                  删除
                </van-button>
                <van-tag
                  v-if="user.isAdmin || user.is_admin"
                  type="warning"
                  size="medium"
                >
                  管理员账户
                </van-tag>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="管理员">
          <div class="users-list">
            <div v-for="user in adminUsers" :key="user.id" class="user-card">
              <div class="user-info">
                <van-image
                  round
                  width="50"
                  height="50"
                  :src="user.avatar"
                  class="avatar"
                />
                <div class="info">
                  <h3 class="username">{{ user.username || user.name }}</h3>
                  <div class="details">
                    <span class="email">
                      <van-icon name="envelop-o" />
                      {{ user.email }}
                    </span>
                    <span class="phone">
                      <van-icon name="phone-o" />
                      {{ user.phone }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="label">参与活动</span>
                  <span class="value">{{ user.participatedActivities }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">创建活动</span>
                  <span class="value">{{ user.createdActivities }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">收藏活动</span>
                  <span class="value">{{ user.favoriteActivities }}</span>
                </div>
              </div>
              <div class="card-actions">
                <van-button
                  v-if="!(user.isAdmin || user.is_admin)"
                  size="small"
                  type="primary"
                  plain
                  icon="edit"
                  @click="editUser(user)"
                >
                  编辑
                </van-button>
                <van-button
                  v-if="!(user.isAdmin || user.is_admin)"
                  size="small"
                  type="danger"
                  plain
                  icon="delete-o"
                  @click="deleteUser(user)"
                >
                  删除
                </van-button>
                <van-tag
                  v-if="user.isAdmin || user.is_admin"
                  type="warning"
                  size="medium"
                >
                  管理员账户
                </van-tag>
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
          <h3>{{ form.id ? "编辑用户" : "添加用户" }}</h3>
          <van-icon name="cross" @click="showCreatePopup = false" />
        </div>
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请输入用户名' }]"
            />
            <van-field
              v-model="form.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              :rules="[
                { required: true, message: '请输入邮箱' },
                { pattern: /.+@.+\..+/, message: '请输入正确的邮箱格式' },
              ]"
            />
            <van-field
              v-model="form.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              :rules="[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' },
              ]"
            />
            <van-field
              v-if="!form.id"
              v-model="form.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请输入密码' }]"
            />
            <van-field name="isAdmin">
              <template #input>
                <van-switch v-model="form.isAdmin" size="24" />
              </template>
              <template #label>
                <span>管理员权限</span>
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
              {{ form.id ? "保存" : "创建" }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { userApi } from "../../api/user";
import { showToast, showConfirmDialog } from "vant";

const searchText = ref("");
const activeTab = ref(0);
const users = ref([]);
const showCreatePopup = ref(false);
const submitting = ref(false);

// 表单数据
const form = ref({
  id: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  isAdmin: false,
});

// 计算属性
const adminUsers = computed(() => {
  return users.value.filter((user) => user.isAdmin || user.is_admin);
});

// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await userApi.getAllUsers();
    users.value = res.data;
  } catch (error) {
    showToast("加载失败");
  }
};

// 搜索用户
const onSearch = () => {
  // TODO: 实现搜索功能
};

// 编辑用户
const editUser = (user) => {
  form.value = {
    id: user.id,
    username: user.username || user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin || user.is_admin,
  };
  showCreatePopup.value = true;
};

// 删除用户
const deleteUser = async (user) => {
  try {
    await showConfirmDialog({
      title: "删除用户",
      message: "确定要删除该用户吗？",
      showCancelButton: true,
    });

    await userApi.deleteUser(user.id);
    users.value = users.value.filter((u) => u.id !== user.id);
    showToast("删除成功");
  } catch (error) {
    if (error) {
      showToast("删除失败");
    }
  }
};

// 提交表单
const onSubmit = async () => {
  try {
    submitting.value = true;
    console.log('Submitting form data:', form.value);
    
    if (form.value.id) {
      const result = await userApi.updateUser(form.value.id, form.value);
      console.log('Update result:', result);
      showToast("保存成功");
    } else {
      const result = await userApi.createUser(form.value);
      console.log('Create result:', result);
      showToast("创建成功");
    }
    showCreatePopup.value = false;
    loadUsers();
  } catch (error) {
    console.error('Form submission error:', error);
    showToast(`操作失败: ${error.message}`);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style lang="scss" scoped>
.admin-users-page {
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
  .users-list {
    padding: 16px;

    .user-card {
      margin-bottom: 16px;
      border-radius: 12px;
      background: white;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      .user-info {
        padding: 16px;
        display: flex;
        gap: 16px;
        align-items: center;

        .avatar {
          flex-shrink: 0;
        }

        .info {
          flex: 1;

          .username {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 8px;
          }

          .details {
            display: flex;
            gap: 16px;
            margin-bottom: 8px;
            color: var(--text-secondary);
            font-size: 14px;

            .van-icon {
              margin-right: 4px;
            }
          }
        }
      }

      .user-stats {
        padding: 12px 16px;
        display: flex;
        justify-content: space-around;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);

        .stat-item {
          text-align: center;

          .label {
            display: block;
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 4px;
          }

          .value {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
          }
        }
      }

      .card-actions {
        padding: 12px 16px;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  }
}

.edit-popup {
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

// 移动端适配
@media screen and (max-width: 768px) {
  .header {
    padding: 12px;
  }

  .content {
    .users-list {
      padding: 12px;

      .user-card {
        margin-bottom: 12px;

        .user-info {
          padding: 12px;

          .info {
            .username {
              font-size: 14px;
            }

            .details {
              font-size: 12px;
            }
          }
        }

        .user-stats {
          padding: 8px 12px;

          .stat-item {
            .value {
              font-size: 14px;
            }
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
