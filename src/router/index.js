import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/Home.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../pages/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../pages/Register.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: () => import("../pages/AuthCallback.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/data-migration",
    name: "DataMigration",
    component: () => import("../pages/DataMigration.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../pages/Profile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/info",
    name: "ProfileInfo",
    component: () => import("../pages/ProfileInfo.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/activities",
    name: "MyActivities",
    component: () => import("../pages/MyActivities.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/favorites",
    name: "FavoriteActivities",
    component: () => import("../pages/FavoriteActivities.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/created",
    name: "CreatedActivities",
    component: () => import("../pages/CreatedActivities.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/settings",
    name: "Settings",
    component: () => import("../pages/Settings.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/activities",
    name: "Activities",
    component: () => import("../pages/Activities.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/activity/:id",
    name: "ActivityDetail",
    component: () => import("../pages/ActivityDetail.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/create-activity", // 新增的活动发布页面路由
    name: "CreateActivity",
    component: () => import("../pages/CreateActivity.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../pages/admin/Admin.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "activities",
        name: "AdminActivities",
        component: () => import("../pages/admin/Activities.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../pages/admin/Users.vue"),
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("../pages/admin/Settings.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 如果是Supabase模式且有token但没有用户信息，尝试获取用户信息
  const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
  if (API_MODE === 'supabase' && userStore.token && !userStore.user) {
    try {
      await userStore.initAuth();
    } catch (error) {
      console.error('路由守卫：获取用户信息失败', error);
    }
  }

  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.user) {
    next("/login");
    return;
  }

  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && !userStore.user?.isAdmin) {
    next("/");
    return;
  }

  next();
});

export default router;
