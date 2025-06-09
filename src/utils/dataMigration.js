import { supabase } from '../api/supabase'

// Mock数据 - 使用真实的auth用户ID或null
const mockUsers = [
  {
    name: "Test Admin",
    email: "admin@example.com", 
    phone: "13800138000",
    avatar: "https://picsum.photos/id/64/200/200",
    is_admin: true,
  },
  {
    name: "Zhang San",
    email: "zhangsan@example.com",
    phone: "13800138001",
    avatar: "https://picsum.photos/id/65/200/200",
    is_admin: false,
  },
  {
    name: "Li Si", 
    email: "lisi@example.com",
    phone: "13800138002",
    avatar: "https://picsum.photos/id/66/200/200",
    is_admin: false,
  },
  {
    name: "Wang Wu",
    email: "wangwu@example.com", 
    phone: "13800138003",
    avatar: "https://picsum.photos/id/67/200/200",
    is_admin: false,
  },
  {
    name: "Zhao Liu",
    email: "zhaoliu@example.com",
    phone: "13800138004", 
    avatar: "https://picsum.photos/id/68/200/200",
    is_admin: false,
  },
  {
    name: "Qian Qi",
    email: "qianqi@example.com",
    phone: "13800138005",
    avatar: "https://picsum.photos/id/69/200/200", 
    is_admin: false,
  },
]

const mockActivities = [
  {
    title: "Weekend Hiking Adventure",
    description: "Let's explore beautiful mountain trails together and enjoy the fresh air of nature. We have prepared several routes of varying difficulty for everyone to choose from. Please vote for the most suitable route. Enrollment will open after the route is decided.",
    location: "Fragrant Hills Park", 
    start_time: new Date(Date.now() + 7 * 86400000).toISOString(),
    max_participants: 20,
    status: "upcoming",
    phase: "voting", 
    tags: ["Hiking", "Beginner", "Scenery", "Photography"],
    cover_image: "https://picsum.photos/id/1015/800/400",
    creator_email: "admin@example.com", // 通过邮箱关联
    routes: [
      {
        title: "Easy Stroll Route",
        description: "A gentle route suitable for beginners, following the park's main trail, enjoying the autumn leaves.",
        distance: 3.5,
        duration: 1.5,
        difficulty: "Easy",
        votes: 8,
      },
      {
        title: "Summit Challenge Route",
        description: "A moderately difficult climbing route. After reaching the summit, you can overlook the entire city.",
        distance: 6.8,
        duration: 3,
        difficulty: "Medium",
        votes: 5,
      },
      {
        title: "Mountain Loop Exploration",
        description: "A longer loop route around the mountain, passing through several scenic spots, suitable for those with good stamina.",
        distance: 10.2,
        duration: 4.5,
        difficulty: "Hard",
        votes: 2,
      },
    ],
    participants: [],
    favorites: ['550e8400-e29b-41d4-a716-446655440001']
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    title: "Sunset Hike & Photography",
    description: "Hike at the most beautiful time to capture the splendid colors of the sunset. The route has been decided by vote as the 'Observatory Deck Route'. Enrollment is now open! Bring your camera and let's record this wonderful moment together.",
    location: "Olympic Forest Park",
    start_time: new Date(Date.now() + 5 * 86400000).toISOString(),
    max_participants: 15,
    status: "upcoming",
    phase: "enrolling",
    tags: ["Hiking", "Photography", "Sunset", "Intermediate"],
    cover_image: "https://picsum.photos/id/1018/800/400",
    creator_id: '550e8400-e29b-41d4-a716-446655440002',
    routes: [
      {
        title: "Observatory Deck Route",
        description: "The best viewing route determined by vote, passing through three observation decks, perfect for shooting the sunset.",
        distance: 7.5,
        duration: 2.5,
        difficulty: "Medium",
        votes: 12,
        is_selected: true,
      },
    ],
    participants: [
      { user_id: '550e8400-e29b-41d4-a716-446655440001', join_time: new Date(Date.now() - 2 * 86400000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440002', join_time: new Date(Date.now() - 86400000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440003', join_time: new Date(Date.now() - 12 * 3600000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440004', join_time: new Date(Date.now() - 6 * 3600000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440005', join_time: new Date(Date.now() - 3 * 3600000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440006', join_time: new Date(Date.now() - 3600000).toISOString() },
    ],
    favorites: []
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    title: "Morning Run Fitness Group",
    description: "Run with partners in the first rays of the morning sun. The activity is currently in progress, and participants are enjoying the joy of exercise!",
    location: "Chaoyang Park",
    start_time: new Date(Date.now() - 3600000).toISOString(),
    max_participants: 25,
    status: "ongoing",
    phase: "active",
    tags: ["Running", "Fitness", "Morning Exercise", "Beginner"],
    cover_image: "https://picsum.photos/id/1019/800/400",
    creator_id: '550e8400-e29b-41d4-a716-446655440003',
    routes: [
      {
        title: "Standard Morning Run Route",
        description: "A standard morning run route around the lake, flat and easy to run.",
        distance: 4.2,
        duration: 1,
        difficulty: "Easy",
        votes: 15,
        is_selected: true,
      },
    ],
    participants: [
      { user_id: '550e8400-e29b-41d4-a716-446655440001', join_time: new Date(Date.now() - 3 * 86400000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440002', join_time: new Date(Date.now() - 3 * 86400000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440003', join_time: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
    favorites: ['550e8400-e29b-41d4-a716-446655440001']
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    title: "Night Run City Exploration",
    description: "Run under the neon lights at night and experience another side of the city. The event has successfully concluded, thank you to all participants for your enthusiastic involvement!",
    location: "The Bund Riverside Walk",
    start_time: new Date(Date.now() - 3 * 86400000).toISOString(),
    max_participants: 20,
    status: "completed",
    phase: "finished",
    tags: ["Night Run", "City", "Intermediate", "Exploration"],
    cover_image: "https://picsum.photos/id/1020/800/400",
    creator_id: '550e8400-e29b-41d4-a716-446655440001',
    routes: [
      {
        title: "Bund Night View Route",
        description: "Run along the Huangpu River and enjoy the night view of the Bund.",
        distance: 6.5,
        duration: 1.5,
        difficulty: "Medium",
        votes: 18,
        is_selected: true,
      },
    ],
    participants: [
      { user_id: '550e8400-e29b-41d4-a716-446655440001', join_time: new Date(Date.now() - 5 * 86400000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440002', join_time: new Date(Date.now() - 5 * 86400000).toISOString() },
      { user_id: '550e8400-e29b-41d4-a716-446655440003', join_time: new Date(Date.now() - 4 * 86400000).toISOString() },
    ],
    favorites: []
  }
]

// 数据迁移函数
export async function migrateData() {
  const results = {
    users: { success: 0, errors: [] },
    activities: { success: 0, errors: [] },
    routes: { success: 0, errors: [] },
    participants: { success: 0, errors: [] },
    favorites: { success: 0, errors: [] }
  }

  console.log('🚀 开始数据迁移...')

  try {
    // 1. 迁移用户数据
    console.log('📊 迁移用户数据...')
    for (const user of mockUsers) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert(user, { onConflict: 'email' })

        if (error) {
          results.users.errors.push(`${user.email}: ${error.message}`)
        } else {
          results.users.success++
        }
      } catch (err) {
        results.users.errors.push(`${user.email}: ${err.message}`)
      }
    }

    // 2. 迁移活动数据
    console.log('🏃 迁移活动数据...')
    for (const activity of mockActivities) {
      try {
        const { routes, participants, favorites, ...activityData } = activity
        
        const { error } = await supabase
          .from('activities')
          .upsert(activityData, { onConflict: 'id' })

        if (error) {
          results.activities.errors.push(`${activity.title}: ${error.message}`)
          continue
        }

        results.activities.success++

        // 3. 迁移路线数据
        for (const route of routes) {
          try {
            const { error: routeError } = await supabase
              .from('routes')
              .upsert({
                ...route,
                activity_id: activity.id
              })

            if (routeError) {
              results.routes.errors.push(`${route.title}: ${routeError.message}`)
            } else {
              results.routes.success++
            }
          } catch (err) {
            results.routes.errors.push(`${route.title}: ${err.message}`)
          }
        }

        // 4. 迁移参与者数据
        for (const participant of participants) {
          try {
            const { error: participantError } = await supabase
              .from('participants')
              .upsert({
                activity_id: activity.id,
                user_id: participant.user_id,
                join_time: participant.join_time
              }, { onConflict: 'activity_id,user_id' })

            if (participantError) {
              results.participants.errors.push(`Activity ${activity.title}, User ${participant.user_id}: ${participantError.message}`)
            } else {
              results.participants.success++
            }
          } catch (err) {
            results.participants.errors.push(`Activity ${activity.title}, User ${participant.user_id}: ${err.message}`)
          }
        }

        // 5. 迁移收藏数据
        for (const userId of favorites) {
          try {
            const { error: favoriteError } = await supabase
              .from('favorites')
              .upsert({
                activity_id: activity.id,
                user_id: userId
              }, { onConflict: 'activity_id,user_id' })

            if (favoriteError) {
              results.favorites.errors.push(`Activity ${activity.title}, User ${userId}: ${favoriteError.message}`)
            } else {
              results.favorites.success++
            }
          } catch (err) {
            results.favorites.errors.push(`Activity ${activity.title}, User ${userId}: ${err.message}`)
          }
        }

      } catch (err) {
        results.activities.errors.push(`${activity.title}: ${err.message}`)
      }
    }

    console.log('✅ 数据迁移完成！')
    return results

  } catch (error) {
    console.error('❌ 数据迁移失败:', error)
    throw error
  }
}

// 验证数据函数
export async function verifyData() {
  try {
    const results = {}

    // 检查各表数据量
    const tables = ['profiles', 'activities', 'routes', 'participants', 'favorites']
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        results[table] = { error: error.message }
      } else {
        results[table] = { count }
      }
    }

    // 检查活动详情
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        title,
        status,
        phase,
        profiles:creator_id(name),
        routes(count),
        participants(count)
      `)

    if (!activitiesError) {
      results.activitiesDetail = activitiesData
    }

    return results

  } catch (error) {
    console.error('验证数据失败:', error)
    throw error
  }
}

// 清理数据函数 (谨慎使用)
export async function clearAllData() {
  console.warn('⚠️  正在清理所有数据...')
  
  const tables = ['favorites', 'votes', 'participants', 'routes', 'activities']
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有数据

    if (error) {
      console.error(`清理表 ${table} 失败:`, error.message)
    } else {
      console.log(`✅ 已清理表: ${table}`)
    }
  }
  
  console.log('🧹 数据清理完成')
}