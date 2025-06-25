// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Test Admin",
    email: "admin@example.com",
    phone: "13800138000",
    avatar: "https://picsum.photos/id/64/200/200",
    isAdmin: true,
  },
  {
    id: 2,
    name: "Zhang San",
    email: "zhangsan@example.com",
    phone: "13800138001",
    avatar: "https://picsum.photos/id/65/200/200",
    isAdmin: false,
  },
  {
    id: 3,
    name: "Li Si",
    email: "lisi@example.com",
    phone: "13800138002",
    avatar: "https://picsum.photos/id/66/200/200",
    isAdmin: false,
  },
  {
    id: 4,
    name: "Wang Wu",
    email: "wangwu@example.com",
    phone: "13800138003",
    avatar: "https://picsum.photos/id/67/200/200",
    isAdmin: false,
  },
  {
    id: 5,
    name: "Zhao Liu",
    email: "zhaoliu@example.com",
    phone: "13800138004",
    avatar: "https://picsum.photos/id/68/200/200",
    isAdmin: false,
  },
  {
    id: 6,
    name: "Qian Qi",
    email: "qianqi@example.com",
    phone: "13800138005",
    avatar: "https://picsum.photos/id/69/200/200",
    isAdmin: false,
  },
];

// Mock activity data - categorized by business logic
const mockActivities = [
  // 1. Activity in Voting Phase - Can vote for routes, cannot enroll
  {
    id: 1,
    title: "Weekend Hiking Adventure",
    description:
      "Let's explore beautiful mountain trails together and enjoy the fresh air of nature. We have prepared several routes of varying difficulty for everyone to choose from. Please vote for the most suitable route. Enrollment will open after the route is decided.",
    location: "Fragrant Hills Park",
    startTime: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
    maxParticipants: 20,
    currentParticipants: 0, // Cannot enroll during voting phase
    status: "upcoming",
    phase: "voting", // Voting phase
    tags: ["Hiking", "Beginner", "Scenery", "Photography"],
    isJoined: false,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1015/800/400",
    creatorId: 1,
    creatorName: "Test Admin",
    routes: [
      {
        id: 1,
        title: "Easy Stroll Route",
        description: "A gentle route suitable for beginners, following the park's main trail, enjoying the autumn leaves.",
        distance: 3.5,
        duration: 1.5,
        difficulty: "Easy",
        votes: 8,
        isVoted: false,
      },
      {
        id: 2,
        title: "Summit Challenge Route",
        description: "A moderately difficult climbing route. After reaching the summit, you can overlook the entire city.",
        distance: 6.8,
        duration: 3,
        difficulty: "Medium",
        votes: 5,
        isVoted: false,
      },
      {
        id: 3,
        title: "Mountain Loop Exploration",
        description: "A longer loop route around the mountain, passing through several scenic spots, suitable for those with good stamina.",
        distance: 10.2,
        duration: 4.5,
        difficulty: "Hard",
        votes: 2,
        isVoted: false,
      },
    ],
    participants: [], // No participants during voting phase
  },

  // 2. Activity in Enrollment Phase - Route decided, enrollment open
  {
    id: 2,
    title: "Sunset Hike & Photography",
    description:
      "Hike at the most beautiful time to capture the splendid colors of the sunset. The route has been decided by vote as the 'Observatory Deck Route'. Enrollment is now open! Bring your camera and let's record this wonderful moment together.",
    location: "Olympic Forest Park",
    startTime: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days from now
    maxParticipants: 15,
    currentParticipants: 8,
    status: "upcoming",
    phase: "enrolling", // Enrollment phase
    tags: ["Hiking", "Photography", "Sunset", "Intermediate"],
    isJoined: true,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1018/800/400",
    creatorId: 2,
    creatorName: "Zhang San",
    routes: [
      {
        id: 4,
        title: "Observatory Deck Route",
        description: "The best viewing route determined by vote, passing through three observation decks, perfect for shooting the sunset.",
        distance: 7.5,
        duration: 2.5,
        difficulty: "Medium",
        votes: 12, // The winning route
        isVoted: true,
        isSelected: true, // Marked as the selected route
      },
    ],
    participants: [
      {
        id: 1,
        name: "Test Admin",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 2,
        name: "Zhang San",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        name: "Li Si",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 4,
        name: "Wang Wu",
        avatar: "https://picsum.photos/id/67/200/200",
        joinTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      {
        id: 5,
        name: "Zhao Liu",
        avatar: "https://picsum.photos/id/68/200/200",
        joinTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: 6,
        name: "Qian Qi",
        avatar: "https://picsum.photos/id/69/200/200",
        joinTime: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },

  // 3. Ongoing Activity - In progress, cannot enroll or vote
  {
    id: 3,
    title: "Morning Run Fitness Group",
    description:
      "Run with partners in the first rays of the morning sun. The activity is currently in progress, and participants are enjoying the joy of exercise!",
    location: "Chaoyang Park",
    startTime: new Date(Date.now() - 3600000).toISOString(), // Started 1 hour ago
    maxParticipants: 25,
    currentParticipants: 18,
    status: "ongoing", // Ongoing
    phase: "active",
    tags: ["Running", "Fitness", "Morning Exercise", "Beginner"],
    isJoined: false,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1019/800/400",
    creatorId: 3,
    creatorName: "Li Si",
    routes: [
      {
        id: 5,
        title: "Standard Morning Run Route",
        description: "A standard morning run route around the lake, flat and easy to run.",
        distance: 4.2,
        duration: 1,
        difficulty: "Easy",
        votes: 15,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 1,
        name: "Test Admin",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 2,
        name: "Zhang San",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 3,
        name: "Li Si",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      // More participants...
    ],
  },

  // 4. Completed Activity - Can only view information
  {
    id: 4,
    title: "Night Run City Exploration",
    description:
      "Run under the neon lights at night and experience another side of the city. The event has successfully concluded, thank you to all participants for your enthusiastic involvement!",
    location: "The Bund Riverside Walk",
    startTime: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
    maxParticipants: 20,
    currentParticipants: 20,
    status: "completed", // Completed
    phase: "finished",
    tags: ["Night Run", "City", "Intermediate", "Exploration"],
    isJoined: true,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1020/800/400",
    creatorId: 1,
    creatorName: "Test Admin",
    routes: [
      {
        id: 6,
        title: "Bund Night View Route",
        description: "Run along the Huangpu River and enjoy the night view of the Bund.",
        distance: 6.5,
        duration: 1.5,
        difficulty: "Medium",
        votes: 18,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 1,
        name: "Test Admin",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 2,
        name: "Zhang San",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 3,
        name: "Li Si",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      // Full capacity...
    ],
  },

  // 5. Cancelled Activity
  {
    id: 5,
    title: "Rainy Day Mountain Challenge",
    description:
      "Due to weather conditions, this hiking event has been cancelled. We will reschedule a similar event when the weather improves. Thank you for your understanding!",
    location: "Mutianyu Great Wall",
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    maxParticipants: 12,
    currentParticipants: 8,
    status: "cancelled", // Cancelled
    phase: "cancelled",
    tags: ["Mountaineering", "Great Wall", "Advanced", "Challenge"],
    isJoined: false,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1021/800/400",
    creatorId: 2,
    creatorName: "Zhang San",
    routes: [
      {
        id: 7,
        title: "Classic Great Wall Route",
        description: "A classic Great Wall hiking route.",
        distance: 8.5,
        duration: 4,
        difficulty: "Hard",
        votes: 6,
        isVoted: false,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 2,
        name: "Zhang San",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 3,
        name: "Li Si",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },

  // 6. Activity Under Review - Temporarily unavailable
  {
    id: 6,
    title: "Extreme Sports Experience",
    description:
      "Challenge your limits, surpass yourself! This activity is currently under review. Route voting will open after approval.",
    location: "Huairou Mountain Area",
    startTime: new Date(Date.now() + 10 * 86400000).toISOString(), // 10 days from now
    maxParticipants: 8,
    currentParticipants: 0,
    status: "pending", // Pending review
    phase: "review",
    tags: ["Extreme Sports", "Rock Climbing", "Advanced", "Thrilling"],
    isJoined: false,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1022/800/400",
    creatorId: 4,
    creatorName: "Wang Wu",
    routes: [
      {
        id: 8,
        title: "Beginner Rock Climbing Route",
        description: "A rock climbing route suitable for beginners.",
        distance: 2,
        duration: 3,
        difficulty: "Medium",
        votes: 0,
        isVoted: false,
      },
      {
        id: 9,
        title: "Advanced Challenge Route",
        description: "A professional-level rock climbing challenge.",
        distance: 3,
        duration: 5,
        difficulty: "Hard",
        votes: 0,
        isVoted: false,
      },
    ],
    participants: [],
  },

  // 7. Full Capacity Activity (Enrolling)
  {
    id: 7,
    title: "Weekend Picnic Gathering",
    description:
      "Enjoy a picnic in a beautiful park, sharing food and happiness with friends. This activity is now full. Please check out our other events!",
    location: "Zhongshan Park",
    startTime: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days from now
    maxParticipants: 15,
    currentParticipants: 15, // Full
    status: "upcoming",
    phase: "enrolling",
    tags: ["Picnic", "Gathering", "Leisure", "Beginner"],
    isJoined: false,
    isFavorite: false,
    coverImage: "https://picsum.photos/id/1023/800/400",
    creatorId: 3,
    creatorName: "Li Si",
    routes: [
      {
        id: 10,
        title: "Lakeside Picnic Spot",
        description: "The best picnic spot by the lake, with beautiful scenery.",
        distance: 1,
        duration: 4,
        difficulty: "Easy",
        votes: 12,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      // 15 participants
      {
        id: 1,
        name: "Test Admin",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 2,
        name: "Zhang San",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 3,
        name: "Li Si",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 4,
        name: "Wang Wu",
        avatar: "https://picsum.photos/id/67/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 5,
        name: "Zhao Liu",
        avatar: "https://picsum.photos/id/68/200/200",
        joinTime: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 6,
        name: "Qian Qi",
        avatar: "https://picsum.photos/id/69/200/200",
        joinTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      // More participants...
    ],
  },

  // 8. Activity with Close Voting
  {
    id: 8,
    title: "Autumn Cycling Tour",
    description:
      "Ride in the golden autumn season and feel the pleasant autumn breeze. Route voting is currently underway, and the votes for each route are very close. Please vote actively!",
    location: "Summer Palace",
    startTime: new Date(Date.now() + 6 * 86400000).toISOString(), // 6 days from now
    maxParticipants: 30,
    currentParticipants: 0,
    status: "upcoming",
    phase: "voting",
    tags: ["Cycling", "Autumn Outing", "Intermediate", "Scenery"],
    isJoined: false,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1024/800/400",
    creatorId: 5,
    creatorName: "Zhao Liu",
    routes: [
      {
        id: 11,
        title: "Lakeside Loop Route",
        description: "Circle Kunming Lake and enjoy the lake and mountain scenery.",
        distance: 8,
        duration: 2,
        difficulty: "Easy",
        votes: 11,
        isVoted: false,
      },
      {
        id: 12,
        title: "Mountain Biking Route",
        description: "Includes some uphill sections, making it more challenging.",
        distance: 12,
        duration: 3,
        difficulty: "Medium",
        votes: 10,
        isVoted: false,
      },
      {
        id: 13,
        title: "Scenic Spot Connection Route",
        description: "Connects multiple scenic spots, allowing for sightseeing while cycling.",
        distance: 15,
        duration: 4,
        difficulty: "Medium",
        votes: 9,
        isVoted: true,
      },
    ],
    participants: [],
  },

  // 9. Premium Activity
  {
    id: 9,
    title: "Professional Photography Hike",
    description:
      "Led by a professional photographer to teach outdoor photography skills. The route has been decided, and enrollment is now open. Limited spots, first come, first served!",
    location: "Badaling Great Wall",
    startTime: new Date(Date.now() + 14 * 86400000).toISOString(), // 14 days from now
    maxParticipants: 8,
    currentParticipants: 5,
    status: "upcoming",
    phase: "enrolling",
    tags: ["Photography", "Great Wall", "Professional", "Advanced"],
    isJoined: false,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1025/800/400",
    creatorId: 6,
    creatorName: "Qian Qi",
    routes: [
      {
        id: 14,
        title: "Best Photography Route",
        description: "A route with the best photo spots, carefully selected by a professional photographer.",
        distance: 6,
        duration: 6, // Includes photography instruction time
        difficulty: "Medium",
        votes: 8,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 1,
        name: "Test Admin",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        name: "Zhang San",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        name: "Li Si",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 4,
        name: "Wang Wu",
        avatar: "https://picsum.photos/id/67/200/200",
        joinTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      {
        id: 6,
        name: "Qian Qi",
        avatar: "https://picsum.photos/id/69/200/200",
        joinTime: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },

  // 10. Night Activity
  {
    id: 10,
    title: "Stargazing Hike Night",
    description:
      "Get away from city light pollution and enjoy the brilliant starry sky in the suburbs. Route voting has ended, and enrollment is now open. Please bring your own flashlight and warm clothing.",
    location: "Miyun Reservoir",
    startTime: new Date(Date.now() + 8 * 86400000).toISOString(), // 8 days from now
    maxParticipants: 12,
    currentParticipants: 7,
    status: "upcoming",
    phase: "enrolling",
    tags: ["Stargazing", "Night Hike", "Suburbs", "Intermediate"],
    isJoined: true,
    isFavorite: true,
    coverImage: "https://picsum.photos/id/1026/800/400",
    creatorId: 4,
    creatorName: "Wang Wu",
    routes: [
      {
        id: 15,
        title: "Best Stargazing Spot Route",
        description: "Reach the best stargazing spot with a wide field of view and minimal light pollution.",
        distance: 4,
        duration: 2,
        difficulty: "Medium",
        votes: 9,
        isVoted: true,
        isSelected: true,
      },
    ],
    participants: [
      {
        id: 1,
        name: "Test Admin",
        avatar: "https://picsum.photos/id/64/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        name: "Zhang San",
        avatar: "https://picsum.photos/id/65/200/200",
        joinTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        name: "Li Si",
        avatar: "https://picsum.photos/id/66/200/200",
        joinTime: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 4,
        name: "Wang Wu",
        avatar: "https://picsum.photos/id/67/200/200",
        joinTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 5,
        name: "Zhao Liu",
        avatar: "https://picsum.photos/id/68/200/200",
        joinTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
    ],
  },
];

// Simulate API response delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API service
export const mockApi = {
  // User related
  async loginByPhone(phone, code) {
    await delay(1000);
    if (phone === "13800138000" && code === "123456") {
      return {
        token: "mock_token",
        user: mockUsers[0],
      };
    }
    throw new Error("Incorrect phone number or verification code");
  },

  async loginByEmail(email, password) {
    await delay(1000);
    if (email === "test@example.com" && password === "123456") {
      return {
        token: "mock_token",
        user: mockUsers[0],
      };
    }
    throw new Error("Incorrect email or password");
  },

  async sendVerificationCode(phone) {
    await delay(1000);
    if (phone === "13800138000") {
      return { message: "Verification code sent" };
    }
    throw new Error("Failed to send");
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
    return { message: "Password changed successfully" };
  },

  // Activity related
  async getActivities(params = {}) {
    await delay(1000);
    let filteredActivities = [...mockActivities];

    // Filter by status
    if (params.status) {
      filteredActivities = filteredActivities.filter(
        (a) => a.status === params.status
      );
    }

    // Filter by phase
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
    if (!activity) throw new Error("Activity not found");
    return activity;
  },

  async createActivity(data) {
    await delay(1000);
    const newActivity = {
      id: Date.now(),
      ...data,
      currentParticipants: 0,
      status: "pending", // New activities require review
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
    if (index === -1) throw new Error("Activity not found");
    mockActivities[index] = { ...mockActivities[index], ...data };
    return mockActivities[index];
  },

  async deleteActivity(id) {
    await delay(1000);
    const index = mockActivities.findIndex((a) => a.id === parseInt(id));
    if (index === -1) throw new Error("Activity not found");
    mockActivities.splice(index, 1);
    return { message: "Activity deleted" };
  },

  async joinActivity(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    // Check activity status
    if (activity.status !== "upcoming") {
      throw new Error("Activity status does not allow enrollment");
    }

    if (activity.phase !== "enrolling") {
      throw new Error("Enrollment for this activity is not yet open");
    }

    if (activity.currentParticipants >= activity.maxParticipants) {
      throw new Error("Activity is full");
    }

    if (activity.isJoined) {
      throw new Error("You have already joined this activity");
    }

    // Add current user to participant list
    const currentUser = mockUsers[0]; // Simulate the currently logged-in user
    activity.participants.push({
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      joinTime: new Date().toISOString(),
    });

    activity.isJoined = true;
    activity.currentParticipants++;
    return { message: "Joined successfully" };
  },

  async cancelJoin(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    if (!activity.isJoined) {
      throw new Error("You have not joined this activity");
    }

    // Remove current user from participant list
    const currentUser = mockUsers[0];
    activity.participants = activity.participants.filter(
      (p) => p.id !== currentUser.id
    );

    activity.isJoined = false;
    activity.currentParticipants--;
    return { message: "Enrollment cancelled" };
  },

  async voteRoute(activityId, routeId) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(activityId));
    if (!activity) throw new Error("Activity not found");

    if (activity.phase !== "voting") {
      throw new Error("Not in the voting phase");
    }

    const route = activity.routes.find((r) => r.id === parseInt(routeId));
    if (!route) throw new Error("Route not found");

    // Check if the user has already voted for any route in this activity
    const hasVoted = activity.routes.some((r) => r.isVoted);
    if (hasVoted) {
      throw new Error("You have already voted. Each person can only vote once.");
    }

    route.votes++;
    route.isVoted = true;
    // To be more accurate, all routes should be marked `isVoted: true` for this user,
    // but this simpler logic works if the UI disables voting after one successful vote.
    return { message: "Voted successfully" };
  },

  async removeParticipant(activityId, participantId) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(activityId));
    if (!activity) throw new Error("Activity not found");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("You do not have permission to perform this action");
    }

    const participantIndex = activity.participants.findIndex(
      (p) => p.id === parseInt(participantId)
    );
    if (participantIndex === -1) throw new Error("Participant not found");

    activity.participants.splice(participantIndex, 1);
    activity.currentParticipants--;

    // If the removed participant is the current user, update isJoined status
    if (parseInt(participantId) === currentUser.id) {
      activity.isJoined = false;
    }

    return { message: "Removed successfully" };
  },

  // Admin related operations
  async approveActivity(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin) {
      throw new Error("You do not have permission to perform this action");
    }

    activity.status = "upcoming";
    activity.phase = "voting";
    return { message: "Activity approved" };
  },

  async rejectActivity(id, reason) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin) {
      throw new Error("You do not have permission to perform this action");
    }

    activity.status = "rejected";
    activity.phase = "rejected";
    activity.rejectReason = reason;
    return { message: "Activity rejected" };
  },

  async startEnrollment(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("You do not have permission to perform this action");
    }

    if (activity.phase !== "voting") {
      throw new Error("Activity is not in the voting phase");
    }

    // Find the winning route
    const winningRoute = activity.routes.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );

    // Mark the winning route
    activity.routes.forEach((route) => {
      route.isSelected = route.id === winningRoute.id;
    });

    activity.phase = "enrolling";
    return { message: "Enrollment phase has started" };
  },

  async startActivity(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("You do not have permission to perform this action");
    }

    activity.status = "ongoing";
    activity.phase = "active";
    return { message: "Activity has started" };
  },

  async completeActivity(id) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("You do not have permission to perform this action");
    }

    activity.status = "completed";
    activity.phase = "finished";
    return { message: "Activity completed" };
  },

  async cancelActivity(id, reason) {
    await delay(1000);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    const currentUser = mockUsers[0];
    if (!currentUser.isAdmin && activity.creatorId !== currentUser.id) {
      throw new Error("You do not have permission to perform this action");
    }

    activity.status = "cancelled";
    activity.phase = "cancelled";
    activity.cancelReason = reason;
    return { message: "Activity cancelled" };
  },

  // Favorite related
  async toggleFavorite(id) {
    await delay(500);
    const activity = mockActivities.find((a) => a.id === parseInt(id));
    if (!activity) throw new Error("Activity not found");

    activity.isFavorite = !activity.isFavorite;
    return {
      message: activity.isFavorite
        ? "Added to favorites"
        : "Removed from favorites",
      isFavorite: activity.isFavorite,
    };
  },

  // Get user's activities
  async getUserActivities(userId, type = "all") {
    await delay(1000);
    const user = mockUsers.find((u) => u.id === parseInt(userId));
    if (!user) throw new Error("User not found");

    let activities = [];

    switch (type) {
      case "joined":
        // Activities the user has joined
        activities = mockActivities.filter((activity) =>
          activity.participants.some((p) => p.id === parseInt(userId))
        );
        break;
      case "created":
        // Activities the user has created
        activities = mockActivities.filter(
          (activity) => activity.creatorId === parseInt(userId)
        );
        break;
      case "favorite":
        // Activities the user has favorited
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

  // Get current user's activities
  async getMyActivities() {
    await delay(1000);
    // Mock current user ID (in real app, this would come from auth)
    const currentUserId = 1;
    
    // Get activities the user has joined
    const activities = mockActivities.filter((activity) =>
      activity.participants.some((p) => p.id === currentUserId)
    );

    return {
      data: activities,
      total: activities.length,
    };
  },

  // Search activities
  async searchActivities(keyword) {
    await delay(1000);
    const lowercasedKeyword = keyword.toLowerCase();
    const filteredActivities = mockActivities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(lowercasedKeyword) ||
        activity.description.toLowerCase().includes(lowercasedKeyword) ||
        activity.location.toLowerCase().includes(lowercasedKeyword) ||
        activity.tags.some((tag) => tag.toLowerCase().includes(lowercasedKeyword))
    );

    return {
      data: filteredActivities,
      total: filteredActivities.length,
    };
  },
};