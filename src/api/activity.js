import request from "./request";
import { mockApi } from "./mock";
import { supabaseApi } from "./supabase";

// API模式配置: 'mock' | 'supabase' | 'backend'
const API_MODE = import.meta.env.VITE_API_MODE || 'mock';

const createActivityApi = () => {
  switch (API_MODE) {
    case 'supabase':
      return {
        // 获取活动列表
        getActivities(params) {
          return supabaseApi.getActivities(params);
        },

        // 获取活动详情
        getActivityDetail(id) {
          return supabaseApi.getActivityDetail(id);
        },

        // 创建活动
        createActivity(data) {
          return supabaseApi.createActivity(data);
        },

        // 更新活动
        updateActivity(id, data) {
          return supabaseApi.updateActivity(id, data);
        },

        // 删除活动
        deleteActivity(id) {
          return supabaseApi.deleteActivity(id);
        },

        // 报名活动
        joinActivity(id) {
          return supabaseApi.joinActivity(id);
        },

        // 取消报名
        cancelJoin(id) {
          return supabaseApi.cancelJoin(id);
        },

        // 投票选择路线
        voteRoute(activityId, routeId) {
          return supabaseApi.voteRoute(activityId, routeId);
        },

        // 收藏/取消收藏
        toggleFavorite(id) {
          return supabaseApi.toggleFavorite(id);
        },

        // 获取用户活动
        getUserActivities(userId, type) {
          return supabaseApi.getUserActivities(userId, type);
        },

        // 获取我的活动
        getMyActivities() {
          return supabaseApi.getMyActivities();
        },

        // 搜索活动
        searchActivities(keyword) {
          return supabaseApi.searchActivities(keyword);
        },

        // 取消活动
        cancelActivity(id, reason) {
          return supabaseApi.cancelActivity(id, reason);
        },

        // 拒绝活动
        rejectActivity(id, reason) {
          return supabaseApi.rejectActivity(id, reason);
        },

        // 审核通过活动
        approveActivity(id) {
          return supabaseApi.approveActivity(id);
        },

        // 获取收藏活动
        getFavoriteActivities() {
          return supabaseApi.getFavoriteActivities();
        },
      };

    case 'backend':
      return {
        // 获取活动列表
        getActivities(params) {
          return request.get("/activities", { params });
        },

        // 获取活动详情
        getActivityDetail(id) {
          return request.get(`/activities/${id}`);
        },

        // 创建活动
        createActivity(data) {
          return request.post("/activities", data);
        },

        // 更新活动
        updateActivity(id, data) {
          return request.put(`/activities/${id}`, data);
        },

        // 删除活动
        deleteActivity(id) {
          return request.delete(`/activities/${id}`);
        },

        // 报名活动
        joinActivity(id) {
          return request.post(`/activities/${id}/join`);
        },

        // 取消报名
        cancelJoin(id) {
          return request.post(`/activities/${id}/cancel`);
        },

        // 投票选择路线
        voteRoute(activityId, routeId) {
          return request.post(`/activities/${activityId}/vote`, { routeId });
        },

        // 收藏/取消收藏
        toggleFavorite(id) {
          return request.post(`/activities/${id}/favorite`);
        },

        // 获取用户活动
        getUserActivities(userId, type) {
          return request.get(`/users/${userId}/activities`, { params: { type } });
        },

        // 获取我的活动
        getMyActivities() {
          return request.get('/users/me/activities');
        },

        // 搜索活动
        searchActivities(keyword) {
          return request.get("/activities/search", { params: { keyword } });
        },

        // 取消活动
        cancelActivity(id, reason) {
          return request.post(`/activities/${id}/cancel`, { reason });
        },

        // 拒绝活动
        rejectActivity(id, reason) {
          return request.post(`/activities/${id}/reject`, { reason });
        },

        // 审核通过活动
        approveActivity(id) {
          return request.post(`/activities/${id}/approve`);
        },
      };

    default: // mock
      return {
        // 获取活动列表
        getActivities(params) {
          return mockApi.getActivities(params);
        },

        // 获取活动详情
        getActivityDetail(id) {
          return mockApi.getActivityDetail(id);
        },

        // 创建活动
        createActivity(data) {
          return mockApi.createActivity(data);
        },

        // 更新活动
        updateActivity(id, data) {
          return mockApi.updateActivity(id, data);
        },

        // 删除活动
        deleteActivity(id) {
          return mockApi.deleteActivity(id);
        },

        // 报名活动
        joinActivity(id) {
          return mockApi.joinActivity(id);
        },

        // 取消报名
        cancelJoin(id) {
          return mockApi.cancelJoin(id);
        },

        // 投票选择路线
        voteRoute(activityId, routeId) {
          return mockApi.voteRoute(activityId, routeId);
        },

        // 收藏/取消收藏
        toggleFavorite(id) {
          return mockApi.toggleFavorite(id);
        },

        // 获取用户活动
        getUserActivities(userId, type) {
          return mockApi.getUserActivities(userId, type);
        },

        // 获取我的活动
        getMyActivities() {
          return mockApi.getMyActivities();
        },

        // 搜索活动
        searchActivities(keyword) {
          return mockApi.searchActivities(keyword);
        },

        // 取消活动
        cancelActivity(id, reason) {
          return mockApi.cancelActivity(id, reason);
        },

        // 拒绝活动
        rejectActivity(id, reason) {
          return mockApi.rejectActivity(id, reason);
        },

        // 审核通过活动
        approveActivity(id) {
          return mockApi.approveActivity(id);
        },
      };
  }
};

export const activityApi = createActivityApi();
