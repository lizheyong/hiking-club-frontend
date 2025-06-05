// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    name: "测试管理员",
    email: "admin@example.com",
    phone: "13800138000",
    avatar: "https://picsum.photos/id/64/200/200",
    isAdmin: true,
  },
  {
    id: 2,
    name: "张三",
    email: "zhangsan@example.com",
    phone: "13800138001",
    avatar: "https://picsum.photos/id/65/200/200",
    isAdmin: false,
  },
  {
    id: 3,
    name: "李四",
    email: "lisi@example.com",
    phone: "13800138002",
    avatar: "https://picsum.photos/id/66/200/200",
    isAdmin: false,
  },
  {
    id: 4,
    name: "王五",
    email: "wangwu@example.com",
    phone: "13800138003",
    avatar: "https://picsum.photos/id/67/200/200",
    isAdmin: false,
  },
  {
    id: 5,
    name: "赵六",
    email: "zhaoliu@example.com",
    phone: "13800138004",
    avatar: "https://picsum.photos/id/68/200/200",
    isAdmin: false,
  },
  {
    id: 6,
    name: "钱七",
    email: "qianqi@example.com",
    phone: "13800138005",
    avatar: "https://picsum.photos/id/69/200/200",
    isAdmin: false,
  },
];

// 模拟活动数据 - 按业务逻辑分类
const mockActivities = [
  // 1. 投票中的活动 - 可以投票选择路线，不能报名
  {
    id: 1,
    title: "周末徒步探险",
    description:
      "一起探索美丽的山间小径，享受大自然的清新空气。我们为大家准备了两条不同难度的路线，请大家投票选择最合适的路线。路线确定后将开放报名。",
    location: "香山公园",
    startTime: new Date(Date.now() + 7 * 86400000).toISOString(), // 7天后
    maxParticipants: 20,
    currentParticipants: 0, // 投票中不允许报名
    status: "upcoming",
    phase: "voting", // 投票阶段
    tags: ["徒步", "初级", "风景", "摄影"],
    isJoined: false,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1015/800/400",
    creatorId: 1,
    creatorName: "测试管理员",
    routes: [
      {
        id: 1,
        title: "轻松漫步路线",
        description: "适合新手的平缓路线，沿着公园主要步道行走，欣赏秋日红叶",
        distance: 3.5,
        duration: 1.5,
        difficulty: "简单",
        votes: 8,
        isVoted: false,
      },
      {
        id: 2,
        title: "山顶挑战路线",
        description: "中等难度的爬山路线，登顶后可俯瞰整个城市美景",
        distance: 6.8,
        duration: 3,
        difficulty: "中等",
        votes: 5,
        isVoted: false,
      },
      {
        id: 3,
        title: "环山探索路线",
        description: "较长距离的环山路线，途经多个景点，适合体力较好的朋友",
        distance: 10.2,
        duration: 4.5,
        difficulty: "困难",
        votes: 2,
        isVoted: false,
      },
    ],
    participants: [], // 投票中没有参与者
  },

  // 2. 报名中的活动 - 路线已确定，可以报名
  {
    id: 2,
    title: "日落徒步摄影",
    description:
      "在最美的时刻徒步，捕捉日落的绚烂色彩。路线已通过投票确定为观景台路线，现在开始接受报名！带上你的相机，一起记录这美好的时光。",
    location: "奥林匹克森林公园",
    startTime: new Date(Date.now() + 5 * 86400000).toISOString(), // 5天后
    maxParticipants: 15,
    currentParticipants: 8,
    status: "upcoming",
    phase: "enrolling", // 报名阶段
    tags: ["徒步", "摄影", "日落", "中级"],
    isJoined: true,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1018/800/400",
    creatorId: 2,
    creatorName: "张三",
    routes: [
      {
        id: 4,
        title: "观景台路线",
        description: "经投票确定的最佳观景路线，途经三个观景台，最适合拍摄日落",
        distance: 7.5,
        duration: 2.5,
        difficulty: "中等",
        votes: 12, // 最终获胜路线
        isVoted: true,
        isSelected: true, // 标记为已选中的路线
      },
    ],
    participants: [
      {
        id: 1,
        name: "测试管理员",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 2,
        name: "张三",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        name: "李四",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 4,
        name: "王五",
        avatar: "https://picsum.photos/id/67/200/200",
        joinTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      {
        id: 5,
        name: "赵六",
        avatar: "https://picsum.photos/id/68/200/200",
        joinTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: 6,
        name: "钱七",
        avatar: "https://picsum.photos/id/69/200/200",
        joinTime: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },

  // 3. 进行中的活动 - 正在进行，无法报名或投票
  {
    id: 3,
    title: "晨跑健身团",
    description:
      "清晨的第一缕阳光，与伙伴们一起奔跑。活动正在进行中，参与者们正在享受运动的快乐！",
    location: "朝阳公园",
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1小时前开始
    maxParticipants: 25,
    currentParticipants: 18,
    status: "ongoing", // 进行中
    phase: "active",
    tags: ["跑步", "健身", "晨练", "初级"],
    isJoined: false,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1019/800/400",
    creatorId: 3,
    creatorName: "李四",
    routes: [
      {
        id: 5,
        title: "晨跑标准路线",
        description: "绕湖一圈的标准晨跑路线，平坦易跑",
        distance: 4.2,
        duration: 1,
        difficulty: "简单",
        votes: 15,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 1,
        name: "测试管理员",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 2,
        name: "张三",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 3,
        name: "李四",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      // 更多参与者...
    ],
  },

  // 4. 已结束的活动 - 只能查看信息
  {
    id: 4,
    title: "夜跑城市探索",
    description:
      "在夜晚的霓虹灯下奔跑，感受城市的另一面。活动已圆满结束，感谢所有参与者的热情参与！",
    location: "外滩滨江步道",
    startTime: new Date(Date.now() - 3 * 86400000).toISOString(), // 3天前
    maxParticipants: 20,
    currentParticipants: 20,
    status: "completed", // 已完成
    phase: "finished",
    tags: ["夜跑", "城市", "中级", "探索"],
    isJoined: true,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1020/800/400",
    creatorId: 1,
    creatorName: "测试管理员",
    routes: [
      {
        id: 6,
        title: "外滩夜景路线",
        description: "沿着黄浦江夜跑，欣赏外滩夜景",
        distance: 6.5,
        duration: 1.5,
        difficulty: "中等",
        votes: 18,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 1,
        name: "测试管理员",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 2,
        name: "张三",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 3,
        name: "李四",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      // 满员状态...
    ],
  },

  // 5. 已取消的活动
  {
    id: 5,
    title: "雨天登山挑战",
    description:
      "由于天气原因，本次登山活动已取消。我们会在天气好转后重新安排类似活动，感谢大家的理解！",
    location: "慕田峪长城",
    startTime: new Date(Date.now() + 86400000).toISOString(), // 明天
    maxParticipants: 12,
    currentParticipants: 8,
    status: "cancelled", // 已取消
    phase: "cancelled",
    tags: ["登山", "长城", "高级", "挑战"],
    isJoined: false,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1021/800/400",
    creatorId: 2,
    creatorName: "张三",
    routes: [
      {
        id: 7,
        title: "长城经典路线",
        description: "经典的长城登山路线",
        distance: 8.5,
        duration: 4,
        difficulty: "困难",
        votes: 6,
        isVoted: false,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 2,
        name: "张三",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 3,
        name: "李四",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },

  // 6. 审核中的活动 - 暂时无法操作
  {
    id: 6,
    title: "极限运动体验",
    description:
      "挑战极限，超越自我！本活动正在审核中，通过审核后将开放路线投票。",
    location: "怀柔山区",
    startTime: new Date(Date.now() + 10 * 86400000).toISOString(), // 10天后
    maxParticipants: 8,
    currentParticipants: 0,
    status: "pending", // 审核中
    phase: "review",
    tags: ["极限运动", "攀岩", "高级", "刺激"],
    isJoined: false,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1022/800/400",
    creatorId: 4,
    creatorName: "王五",
    routes: [
      {
        id: 8,
        title: "初级攀岩路线",
        description: "适合初学者的攀岩路线",
        distance: 2,
        duration: 3,
        difficulty: "中等",
        votes: 0,
        isVoted: false,
      },
      {
        id: 9,
        title: "高级挑战路线",
        description: "专业级别的攀岩挑战",
        distance: 3,
        duration: 5,
        difficulty: "困难",
        votes: 0,
        isVoted: false,
      },
    ],
    participants: [],
  },

  // 7. 满员的报名中活动
  {
    id: 7,
    title: "周末野餐聚会",
    description:
      "在美丽的公园里享受野餐时光，与朋友们分享美食和快乐。活动已满员，请关注我们的其他活动！",
    location: "中山公园",
    startTime: new Date(Date.now() + 3 * 86400000).toISOString(), // 3天后
    maxParticipants: 15,
    currentParticipants: 15, // 已满员
    status: "upcoming",
    phase: "enrolling",
    tags: ["野餐", "聚会", "休闲", "初级"],
    isJoined: false,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1023/800/400",
    creatorId: 3,
    creatorName: "李四",
    routes: [
      {
        id: 10,
        title: "湖边野餐点",
        description: "湖边的最佳野餐地点，风景优美",
        distance: 1,
        duration: 4,
        difficulty: "简单",
        votes: 12,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      // 15个参与者
      {
        id: 1,
        name: "测试管理员",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 2,
        name: "张三",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 3,
        name: "李四",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 4,
        name: "王五",
        avatar: "https://picsum.photos/id/67/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 5,
        name: "赵六",
        avatar: "https://picsum.photos/id/68/200/200",
        joinTime: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 6,
        name: "钱七",
        avatar: "https://picsum.photos/id/69/200/200",
        joinTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      // 更多参与者...
    ],
  },

  // 8. 投票激烈的活动
  {
    id: 8,
    title: "秋日骑行之旅",
    description:
      "在金秋时节骑行，感受秋风的惬意。目前正在进行路线投票，各条路线票数非常接近，请大家踊跃投票！",
    location: "颐和园",
    startTime: new Date(Date.now() + 6 * 86400000).toISOString(), // 6天后
    maxParticipants: 30,
    currentParticipants: 0,
    status: "upcoming",
    phase: "voting",
    tags: ["骑行", "秋游", "中级", "风景"],
    isJoined: false,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1024/800/400",
    creatorId: 5,
    creatorName: "赵六",
    routes: [
      {
        id: 11,
        title: "环湖骑行路线",
        description: "绕昆明湖一圈，欣赏湖光山色",
        distance: 8,
        duration: 2,
        difficulty: "简单",
        votes: 11,
        isVoted: false,
      },
      {
        id: 12,
        title: "山地骑行路线",
        description: "包含一些上坡路段，更有挑战性",
        distance: 12,
        duration: 3,
        difficulty: "中等",
        votes: 10,
        isVoted: false,
      },
      {
        id: 13,
        title: "景点串联路线",
        description: "串联多个景点，边骑行边游览",
        distance: 15,
        duration: 4,
        difficulty: "中等",
        votes: 9,
        isVoted: true,
      },
    ],
    participants: [],
  },

  // 9. 高端定制活动
  {
    id: 9,
    title: "专业摄影徒步",
    description:
      "专业摄影师带队，教授户外摄影技巧。路线已确定，现在开始报名。名额有限，先到先得！",
    location: "八达岭长城",
    startTime: new Date(Date.now() + 14 * 86400000).toISOString(), // 14天后
    maxParticipants: 8,
    currentParticipants: 5,
    status: "upcoming",
    phase: "enrolling",
    tags: ["摄影", "长城", "专业", "高级"],
    isJoined: false,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1025/800/400",
    creatorId: 6,
    creatorName: "钱七",
    routes: [
      {
        id: 14,
        title: "摄影最佳路线",
        description: "专业摄影师精选的最佳拍摄点路线",
        distance: 6,
        duration: 6, // 包含摄影教学时间
        difficulty: "中等",
        votes: 8,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 1,
        name: "测试管理员",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        name: "张三",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        name: "李四",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 4,
        name: "王五",
        avatar: "https://picsum.photos/id/67/200/200",
        joinTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      {
        id: 6,
        name: "钱七",
        avatar: "https://picsum.photos/id/69/200/200",
        joinTime: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },

  // 10. 夜间活动
  {
    id: 10,
    title: "观星徒步夜",
    description:
      "远离城市光污染，在郊外欣赏璀璨星空。活动已结束路线投票，现在开始报名。需要自备手电筒和保暖衣物。",
    location: "密云水库",
    startTime: new Date(Date.now() + 8 * 86400000).toISOString(), // 8天后
    maxParticipants: 12,
    currentParticipants: 7,
    status: "upcoming",
    phase: "enrolling",
    tags: ["观星", "夜行", "郊外", "中级"],
    isJoined: true,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1026/800/400",
    creatorId: 4,
    creatorName: "王五",
    routes: [
      {
        id: 15,
        title: "观星最佳点路线",
        description: "到达最佳观星地点，视野开阔，光污染最少",
        distance: 4,
        duration: 2,
        difficulty: "中等",
        votes: 9,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 1,
        name: "测试管理员",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        name: "张三",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        name: "李四",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 4,
        name: "王五",
        avatar: "https://picsum.photos/id/67/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 5,
        name: "赵六",
        avatar: "https://picsum.photos/id/68/200/200",
        joinTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
    ],
  },
];

// 模拟 API 响应延迟
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 模拟 API 服务
export const mockApi = {
  // 用户相关
  async loginByPhone(phone, code) {
    await delay(1000);
    if (phone === "13800138000" && code === "123456") {
      return {
        token: "mock_token",
        user: mockUsers[0],
      };
    }
    throw new Error("手机号或验证码错误");
  },

  async loginByEmail(email, password) {
    await delay(1000);
    if (email === "test@example.com" && password === "123456") {
      return {
        token: "mock_token",
        user: mockUsers[0],
      };
    }
    throw new Error("邮箱或密码错误");
  },

  async sendVerificationCode(phone) {
    await delay(1000);
    if (phone === "13800138000") {
      return { message: "验证码已发送" };
    }
    throw new Error("发送失败");
  },

  async register(data) {
    await delay(1000);
    return {
      token: "mock_token",
      user: {
        id: Date.now(),
        ...data,
        avatar: "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg",
      },
    };
  },

  async getUserInfo() {
    await delay(1000);
    return mockUsers[0];
  },

  async updateUserInfo(data) {
    await delay(1000);
    const user = { ...mockUsers[0], ...data };
    mockUsers[0] = user;
    return user;
  },

  async changePassword(data) {
    await delay(1000);
    return { message: "密码修改成功" };
  },

  // 活动相关
  async getActivities(params = {}) {
    await delay(1000);
    let filteredActivities = [...mockActivities];

    // 根据状态筛选
    if (params.status) {
      filteredActivities = filteredActivities.filter(
        (a) => a.status === params.status
      );
    }

    // 根据阶段筛选
    if (params.phase) {
      filteredActivities = filteredActivities.filter(
        (a) => a.phase === params.phase
      );
    }

    return {
      data: filteredActivities,
      total: filteredActivities.length,
    };
  },

  async getActivityDetail(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");
    return activity;
  },

  async createActivity(data) {
    await delay(1000);
    const newActivity = {
      id: Date.now(),
      ...data,
      currentParticipants: 0,
      status: "pending", // 新创建的活动需要审核
      phase: "review",
      isJoined: false,
      routes: [],
      participants: [],
      coverImage: "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg",
    };
    mockActivities.unshift(newActivity);
    return newActivity;
  },

  async updateActivity(id, data) {
    await delay(1000);
    const index = mockActivities.findIndex((a) => a.id === parseInt(id));
    if (index === -1) throw new Error("活动不存在");
    mockActivities[index] = { ...mockActivities[index], ...data };
    return mockActivities[index];
  },

  async deleteActivity(id) {
    await delay(1000);
    const index = mockActivities.findIndex((a) => a.id === parseInt(id));
    if (index === -1) throw new Error("活动不存在");
    mockActivities.splice(index, 1);
    return { message: "活动已删除" };
  },

  async joinActivity(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    // 检查活动状态
    if (activity.status !== "upcoming") {
      throw new Error("活动状态不允许报名");
    }

    if (activity.phase !== "enrolling") {
      throw new Error("活动还未开放报名");
    }

    if (activity.currentParticipants >= activity.maxParticipants) {
      throw new Error("活动已满员");
    }

    if (activity.isJoined) {
      throw new Error("您已经报名了此活动");
    }

    // 添加当前用户到参与者列表
    const currentUser = mockUsers[0]; // 模拟当前登录用户
    activity.participants.push({
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      joinTime: new Date().toISOString(),
    });

    activity.isJoined = true;
    activity.currentParticipants++;
    return { message: "报名成功" };
  },

  async cancelJoin(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    if (!activity.isJoined) {
      throw new Error("您未报名此活动");
    }

    // 从参与者列表中移除当前用户
    const currentUser = mockUsers[0];
    activity.participants = activity.participants.filter(
      (p) => p.id !== currentUser.id
    );

    activity.isJoined = false;
    activity.currentParticipants--;
    return { message: "已取消报名" };
  },

  async voteRoute(activityId, routeId) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(activityId));
    if (!activity) throw new Error("活动不存在");

    if (activity.phase !== "voting") {
      throw new Error("当前不是投票阶段");
    }

    const route = activity.routes.find((r) => r.id === parseInt(routeId));
    if (!route) throw new Error("路线不存在");

    if (route.isVoted) {
      throw new Error("您已经投过票了");
    }

    // 检查用户是否已经投票过其他路线
    const hasVoted = activity.routes.some((r) => r.isVoted);
    if (hasVoted) {
      throw new Error("您已经投票过了，每人只能投一次");
    }

    route.votes++;
    route.isVoted = true;
    return { message: "投票成功" };
  },

  async removeParticipant(activityId, participantId) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(activityId));
    if (!activity) throw new Error("活动不存在");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("没有权限进行此操作");
    }

    const participantIndex = activity.participants.findIndex(
      (p) => p.id === parseInt(participantId)
    );
    if (participantIndex === -1) throw new Error("参与者不存在");

    activity.participants.splice(participantIndex, 1);
    activity.currentParticipants--;

    // 如果被移除的是当前用户，更新isJoined状态
    if (parseInt(participantId) === currentUser.id) {
      activity.isJoined = false;
    }

    return { message: "移除成功" };
  },

  // 管理员相关操作
  async approveActivity(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin) {
      throw new Error("没有权限进行此操作");
    }

    activity.status = "upcoming";
    activity.phase = "voting";
    return { message: "活动已审核通过" };
  },

  async rejectActivity(id, reason) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin) {
      throw new Error("没有权限进行此操作");
    }

    activity.status = "rejected";
    activity.phase = "rejected";
    activity.rejectReason = reason;
    return { message: "活动已拒绝" };
  },

  async startEnrollment(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("没有权限进行此操作");
    }

    if (activity.phase !== "voting") {
      throw new Error("活动不在投票阶段");
    }

    // 找出获胜的路线
    const winningRoute = activity.routes.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );

    // 标记获胜路线
    activity.routes.forEach((route) => {
      route.isSelected = route.id === winningRoute.id;
    });

    activity.phase = "enrolling";
    return { message: "已开始报名阶段" };
  },

  async startActivity(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("没有权限进行此操作");
    }

    activity.status = "ongoing";
    activity.phase = "active";
    return { message: "活动已开始" };
  },

  async completeActivity(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("没有权限进行此操作");
    }

    activity.status = "completed";
    activity.phase = "finished";
    return { message: "活动已完成" };
  },

  async cancelActivity(id, reason) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("没有权限进行此操作");
    }

    activity.status = "cancelled";
    activity.phase = "cancelled";
    activity.cancelReason = reason;
    return { message: "活动已取消" };
  },

  // 收藏相关
  async toggleFavorite(id) {
    await delay(500);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("活动不存在");

    activity.isFavorite = !activity.isFavorite;
    return {
      message: activity.isFavorite ? "已收藏" : "已取消收藏",
      isFavorite: activity.isFavorite,
    };
  },

  // 获取用户参与的活动
  async getUserActivities(userId, type = "all") {
    await delay(1000);
    const user = mockUsers.find((u) => u.id === parseInt(userId));
    if (!user) throw new Error("用户不存在");

    let activities = [];

    switch (type) {
      case "joined":
        // 用户已报名的活动
        activities = mockActivities.filter((activity) =>
          activity.participants.some((p) => p.id === parseInt(userId))
        );
        break;
      case "created":
        // 用户创建的活动
        activities = mockActivities.filter(
          (activity) => activity.creatorId === parseInt(userId)
        );
        break;
      case "favorite":
        // 用户收藏的活动
        activities = mockActivities.filter((activity) => activity.isFavorite);
        break;
      default:
        activities = mockActivities;
    }

    return {
      data: activities,
      total: activities.length,
    };
  },

  // 搜索活动
  async searchActivities(keyword) {
    await delay(1000);
    const filteredActivities = mockActivities.filter(
      (activity) =>
        activity.title.includes(keyword) ||
        activity.description.includes(keyword) ||
        activity.location.includes(keyword) ||
        activity.tags.some((tag) => tag.includes(keyword))
    );

    return {
      data: filteredActivities,
      total: filteredActivities.length,
    };
  },
};
