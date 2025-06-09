<template>
  <div class="auth-callback">
    <van-loading size="24px" vertical>处理登录中...</van-loading>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { supabase } from '../api/supabase'
import { showToast, showFailToast, showSuccessToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  try {
    // 处理OAuth回调
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      showFailToast('登录失败：' + error.message)
      router.replace('/login')
      return
    }

    if (data.session) {
      // 登录成功，获取用户信息
      userStore.setToken(data.session.access_token)
      
      // 获取或创建用户档案
      const { supabaseApi } = await import('../api/supabase')
      const userData = await supabaseApi.getUserInfo()
      userStore.setUser(userData)
      
      // 检查是否是邮箱验证回调
      const urlParams = new URLSearchParams(window.location.search)
      const type = urlParams.get('type')
      
      if (type === 'signup') {
        showSuccessToast('邮箱验证成功！欢迎加入！')
      } else {
        showSuccessToast('登录成功！')
      }
      
      router.replace('/')
    } else {
      showFailToast('登录失败')
      router.replace('/login')
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    showFailToast('登录处理失败')
    router.replace('/login')
  }
})
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}
</style>