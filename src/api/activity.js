import request from "./request";
import { mockApi } from "./mock";

// 是否使用模拟数据
const USE_MOCK = true;

export const activityApi = USE_MOCK
  ? {
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
    }
  : {
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
    };
