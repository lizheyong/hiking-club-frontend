import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查环境变量是否配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase环境变量未配置，请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

// 如果未配置Supabase环境变量，使用占位符避免错误
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(finalUrl, finalKey)

// 检查Supabase是否已配置
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

// Supabase API 适配层
export const supabaseApi = {
  // 邮箱登录
  async loginByEmail(email, password) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase未配置，请设置环境变量或切换到mock模式')
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)
    
    // 获取用户详细信息
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()  // 使用 maybeSingle() 代替 single()
    
    if (profileError) {
      throw new Error(profileError.message)
    }
    
    if (!profile) {
      // 如果没有profile，创建一个
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '新用户',
          email: data.user.email,
          phone: data.user.phone || null, // 确保phone为null而不是undefined
          avatar: data.user.user_metadata?.avatar_url,
          is_admin: false
        })
        .select()
        .single()
      
      if (insertError) {
        // 如果是唯一性约束错误，可能是触发器已经创建了profile，重新查询
        if (insertError.code === '23505') {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          if (existingProfile) {
            return {
              token: data.session.access_token,
              user: existingProfile
            }
          }
        }
        throw new Error(insertError.message)
      }
      
      return {
        token: data.session.access_token,
        user: newProfile
      }
    }
    
    return {
      token: data.session.access_token,
      user: profile
    }
  },

  // Google登录
  async loginWithGoogle() {
    const redirectTo = import.meta.env.PROD 
      ? `https://hiking.newgate.space/auth/callback`
      : `${window.location.origin}/auth/callback`
      
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })
    if (error) throw new Error(error.message)
    return data
  },

  async loginByPhone(phone, code) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms'
    })
    if (error) throw new Error(error.message)
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    return {
      token: data.session.access_token,
      user: profile
    }
  },

  async sendVerificationCode(phone) {
    const { error } = await supabase.auth.signInWithOtp({
      phone
    })
    if (error) throw new Error(error.message)
    return { message: "验证码已发送" }
  },

  // 邮箱注册
  async register(userData) {
    const { email, password, name, phone } = userData
    
    // 邮箱注册
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })
    if (error) throw new Error(error.message)
    
    // 如果用户需要邮箱验证，data.user存在但data.session为null
    if (data.user && !data.session) {
      return {
        message: "注册成功！请检查邮箱验证链接",
        needEmailConfirmation: true,
        user: null,
        token: null
      }
    }
    
    // 如果直接登录成功，data.session存在
    if (data.session) {
      // 先检查是否已存在profile (可能由触发器创建)
      let { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()
      
      if (existingProfile) {
        // 如果已存在，更新信息
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            name,
            phone: phone || null
          })
          .eq('id', data.user.id)
          .select()
          .single()
        
        if (updateError) throw new Error(updateError.message)
        
        return {
          token: data.session.access_token,
          user: updatedProfile
        }
      } else {
        // 如果不存在，创建新的
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            email,
            phone: phone || null,
            avatar: null,
            is_admin: false
          })
          .select()
          .single()
        
        if (profileError) {
          // 如果创建失败，可能是触发器同时创建了，再次查询
          if (profileError.code === '23505') {
            const { data: retryProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            return {
              token: data.session.access_token,
              user: retryProfile
            }
          }
          throw new Error(profileError.message)
        }
        
        return {
          token: data.session.access_token,
          user: profile
        }
      }
    }
    
    // 如果没有session也没有用户，返回错误
    throw new Error('注册失败，请重试')
  },

  // 重置密码
  async resetPassword(email) {
    const redirectTo = import.meta.env.PROD 
      ? `https://hiking.newgate.space/reset-password`
      : `${window.location.origin}/reset-password`
      
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    })
    if (error) throw new Error(error.message)
    return { message: "密码重置邮件已发送" }
  },

  async getUserInfo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')
    
    // 检查邮箱是否在白名单中（可选功能）
    if (import.meta.env.VITE_ENABLE_EMAIL_WHITELIST === 'true') {
      const { data: allowedEmail } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', user.email)
        .maybeSingle()
      
      if (!allowedEmail) {
        await supabase.auth.signOut()
        throw new Error('抱歉，您的邮箱未在授权列表中')
      }
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()  // 使用 maybeSingle() 代替 single()
    
    if (error) throw new Error(error.message)
    
    // 如果没有找到profile，创建一个
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || '新用户',
          email: user.email,
          phone: user.phone || null,
          avatar: user.user_metadata?.avatar_url,
          is_admin: false
        })
        .select()
        .single()
      
      if (insertError) {
        // 如果是重复插入错误，查询已存在的profile
        if (insertError.code === '23505') {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          return existingProfile
        }
        throw new Error(insertError.message)
      }
      return newProfile
    }
    
    return profile
  },

  async updateUserInfo(updateData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  },

  async changePassword({ oldPassword, newPassword }) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw new Error(error.message)
    return { message: "密码修改成功" }
  },

  // 活动相关
  async getActivities(params = {}) {
    let query = supabase
      .from('activities')
      .select(`
        *,
        profiles:creator_id(name),
        routes(*),
        participants(
          user_id,
          join_time,
          profiles(name, avatar)
        ),
        favorites(user_id),
        votes(user_id, route_id)
      `)
      .order('created_at', { ascending: false })

    // 状态筛选
    if (params.status) {
      query = query.eq('status', params.status)
    }
    
    // 阶段筛选
    if (params.phase) {
      query = query.eq('phase', params.phase)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    // 转换数据格式以匹配前端期望
    const { data: { user } } = await supabase.auth.getUser()
    const formattedData = data.map(activity => ({
      ...activity,
      coverImage: activity.cover_image,
      startTime: activity.start_time,
      maxParticipants: activity.max_participants,
      creatorName: activity.profiles?.name,
      creatorId: activity.creator_id,
      currentParticipants: activity.participants?.length || 0,
      isJoined: user ? activity.participants?.some(p => p.user_id === user.id) : false,
      isFavorite: user ? activity.favorites?.some(f => f.user_id === user.id) : false,
      routes: activity.routes?.map(route => ({
        ...route,
        isVoted: user ? activity.votes?.some(v => v.user_id === user.id && v.route_id === route.id) : false
      })) || [],
      participants: activity.participants?.map(p => ({
        id: p.user_id,
        name: p.profiles?.name,
        avatar: p.profiles?.avatar,
        joinTime: p.join_time
      })) || []
    }))

    return {
      data: formattedData,
      total: formattedData.length
    }
  },

  async getActivityDetail(id) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:creator_id(name),
        routes(*),
        participants(
          user_id,
          join_time,
          profiles(name, avatar)
        ),
        favorites(user_id),
        votes(user_id, route_id)
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)

    // 格式化数据
    const { data: { user } } = await supabase.auth.getUser()
    return {
      ...data,
      coverImage: data.cover_image,
      startTime: data.start_time,
      maxParticipants: data.max_participants,
      creatorName: data.profiles?.name,
      creatorId: data.creator_id,
      currentParticipants: data.participants?.length || 0,
      isJoined: user ? data.participants?.some(p => p.user_id === user.id) : false,
      isFavorite: user ? data.favorites?.some(f => f.user_id === user.id) : false,
      routes: data.routes?.map(route => ({
        ...route,
        isVoted: user ? data.votes?.some(v => v.user_id === user.id && v.route_id === route.id) : false
      })) || [],
      participants: data.participants?.map(p => ({
        id: p.user_id,
        name: p.profiles?.name,
        avatar: p.profiles?.avatar,
        joinTime: p.join_time
      })) || []
    }
  },

  async createActivity(activityData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { routes, ...activity } = activityData
    
    // 创建活动
    const { data: newActivity, error } = await supabase
      .from('activities')
      .insert({
        ...activity,
        creator_id: user.id,
        current_participants: 0,
        status: 'pending',
        phase: 'review'
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // 如果有路线数据，创建路线
    if (routes && routes.length > 0) {
      const { error: routesError } = await supabase
        .from('routes')
        .insert(routes.map(route => ({
          ...route,
          activity_id: newActivity.id
        })))

      if (routesError) throw new Error(routesError.message)
    }

    return newActivity
  },

  async updateActivity(id, updateData) {
    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async deleteActivity(id) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return { message: "活动已删除" }
  },

  async joinActivity(activityId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    // 检查是否已报名
    const { data: existing } = await supabase
      .from('participants')
      .select()
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
      .single()

    if (existing) throw new Error('您已报名此活动')

    // 检查活动状态和人数
    const { data: activity } = await supabase
      .from('activities')
      .select('status, phase, max_participants, participants(count)')
      .eq('id', activityId)
      .single()

    if (activity.status !== 'upcoming') {
      throw new Error('活动状态不允许报名')
    }
    if (activity.phase !== 'enrolling') {
      throw new Error('活动尚未开放报名')
    }
    if (activity.participants[0].count >= activity.max_participants) {
      throw new Error('活动已满员')
    }

    // 报名
    const { error } = await supabase
      .from('participants')
      .insert({
        activity_id: activityId,
        user_id: user.id
      })

    if (error) throw new Error(error.message)
    return { message: "报名成功" }
  },

  async cancelJoin(activityId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)
    return { message: "取消报名成功" }
  },

  async voteRoute(activityId, routeId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    // 检查是否已投票
    const { data: existing } = await supabase
      .from('votes')
      .select()
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
      .single()

    if (existing) throw new Error('您已投票，每人只能投票一次')

    // 投票
    const { error } = await supabase
      .from('votes')
      .insert({
        activity_id: activityId,
        route_id: routeId,
        user_id: user.id
      })

    if (error) throw new Error(error.message)

    // 更新路线票数
    const { error: updateError } = await supabase.rpc('increment_route_votes', {
      route_id: routeId
    })

    if (updateError) throw new Error(updateError.message)
    return { message: "投票成功" }
  },

  // 收藏相关
  async toggleFavorite(activityId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('favorites')
      .select()
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // 取消收藏
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', user.id)

      if (error) throw new Error(error.message)
      return { message: "已取消收藏", isFavorite: false }
    } else {
      // 添加收藏
      const { error } = await supabase
        .from('favorites')
        .insert({
          activity_id: activityId,
          user_id: user.id
        })

      if (error) throw new Error(error.message)
      return { message: "已添加收藏", isFavorite: true }
    }
  },

  // 获取用户活动
  async getUserActivities(userId, type = 'all') {
    let query = supabase
      .from('activities')
      .select(`
        *,
        profiles:creator_id(name),
        routes(*),
        participants(user_id, join_time, profiles(name, avatar)),
        favorites(user_id)
      `)

    switch (type) {
      case 'joined':
        query = query
          .select(`
            *,
            profiles:creator_id(name),
            routes(*),
            participants!inner(user_id, join_time, profiles(name, avatar)),
            favorites(user_id)
          `)
          .eq('participants.user_id', userId)
        break
      case 'created':
        query = query.eq('creator_id', userId)
        break
      case 'favorite':
        query = query
          .select(`
            *,
            profiles:creator_id(name),
            routes(*),
            participants(user_id, join_time, profiles(name, avatar)),
            favorites!inner(user_id)
          `)
          .eq('favorites.user_id', userId)
        break
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw new Error(error.message)

    return {
      data: data || [],
      total: data?.length || 0
    }
  },

  // 搜索活动
  async searchActivities(keyword) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:creator_id(name),
        routes(*),
        participants(user_id, join_time, profiles(name, avatar)),
        favorites(user_id)
      `)
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,location.ilike.%${keyword}%`)

    if (error) throw new Error(error.message)

    return {
      data: data || [],
      total: data?.length || 0
    }
  }
}

// 数据库函数 - 需要在Supabase中创建
/*
CREATE OR REPLACE FUNCTION increment_route_votes(route_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE routes SET votes = votes + 1 WHERE id = route_id;
END;
$$ LANGUAGE plpgsql;
*/