<template>
  <div class="migration-page">
    <van-nav-bar title="数据迁移工具" left-arrow @click-left="$router.back()" />
    
    <div class="content">
      <van-cell-group>
        <van-cell title="当前API模式" :value="apiMode" />
        <van-cell title="Supabase状态" :value="supabaseStatus" />
      </van-cell-group>

      <div class="section" v-if="apiMode === 'supabase'">
        <h3>数据迁移操作</h3>
        
        <van-button 
          type="primary" 
          block 
          :loading="migrating"
          @click="startMigration"
          style="margin-bottom: 12px;"
        >
          开始迁移Mock数据到Supabase
        </van-button>

        <van-button 
          type="success" 
          block 
          :loading="verifying"
          @click="verifyMigration"
          style="margin-bottom: 12px;"
        >
          验证迁移结果
        </van-button>

        <van-button 
          type="danger" 
          block 
          :loading="clearing"
          @click="clearData"
          style="margin-bottom: 12px;"
        >
          清空所有数据 (危险操作)
        </van-button>
      </div>

      <div class="section" v-else>
        <van-notice-bar
          type="warning"
          text="请先切换到Supabase模式才能进行数据迁移"
        />
      </div>

      <!-- 迁移结果 -->
      <div class="section" v-if="migrationResult">
        <h3>迁移结果</h3>
        <van-cell-group>
          <van-cell 
            v-for="(result, table) in migrationResult" 
            :key="table"
            :title="table"
            :value="`成功: ${result.success}, 错误: ${result.errors.length}`"
            :label="result.errors.join('; ')"
          />
        </van-cell-group>
      </div>

      <!-- 验证结果 -->
      <div class="section" v-if="verificationResult">
        <h3>数据验证结果</h3>
        <van-cell-group>
          <van-cell 
            v-for="(result, table) in verificationResult" 
            :key="table"
            :title="table"
            :value="result.count !== undefined ? `${result.count} 条记录` : '错误'"
            :label="result.error"
          />
        </van-cell-group>

        <div v-if="verificationResult.activitiesDetail" style="margin-top: 16px;">
          <h4>活动详情</h4>
          <van-cell-group>
            <van-cell 
              v-for="activity in verificationResult.activitiesDetail" 
              :key="activity.title"
              :title="activity.title"
              :value="`${activity.status} / ${activity.phase}`"
              :label="`创建者: ${activity.profiles?.name}, 路线: ${activity.routes?.[0]?.count || 0}, 参与者: ${activity.participants?.[0]?.count || 0}`"
            />
          </van-cell-group>
        </div>
      </div>

      <!-- 操作日志 -->
      <div class="section" v-if="logs.length > 0">
        <h3>操作日志</h3>
        <div class="logs">
          <div 
            v-for="(log, index) in logs" 
            :key="index"
            class="log-item"
            :class="log.type"
          >
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { migrateData, verifyData, clearAllData } from '../utils/dataMigration'

const router = useRouter()

const apiMode = ref(import.meta.env.VITE_API_MODE || 'mock')
const supabaseStatus = ref('检查中...')
const migrating = ref(false)
const verifying = ref(false)
const clearing = ref(false)
const migrationResult = ref(null)
const verificationResult = ref(null)
const logs = ref([])

const addLog = (message, type = 'info') => {
  logs.value.push({
    message: `[${new Date().toLocaleTimeString()}] ${message}`,
    type
  })
}

const checkSupabaseStatus = async () => {
  try {
    if (apiMode.value !== 'supabase') {
      supabaseStatus.value = '未配置'
      return
    }

    const { supabase } = await import('../api/supabase')
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      supabaseStatus.value = '连接失败'
      addLog(`Supabase连接失败: ${error.message}`, 'error')
    } else {
      supabaseStatus.value = '连接正常'
      addLog('Supabase连接正常', 'success')
    }
  } catch (error) {
    supabaseStatus.value = '配置错误'
    addLog(`Supabase配置错误: ${error.message}`, 'error')
  }
}

const startMigration = async () => {
  try {
    await showConfirmDialog({
      title: '确认迁移',
      message: '这将把Mock数据导入到Supabase，可能会覆盖现有数据。确定继续？',
    })

    migrating.value = true
    addLog('开始数据迁移...', 'info')
    
    const result = await migrateData()
    migrationResult.value = result
    
    const totalSuccess = Object.values(result).reduce((sum, r) => sum + r.success, 0)
    const totalErrors = Object.values(result).reduce((sum, r) => sum + r.errors.length, 0)
    
    addLog(`迁移完成！成功: ${totalSuccess}, 错误: ${totalErrors}`, totalErrors > 0 ? 'warning' : 'success')
    showToast('迁移完成！')
    
  } catch (error) {
    if (error !== 'cancel') {
      addLog(`迁移失败: ${error.message}`, 'error')
      showToast('迁移失败')
    }
  } finally {
    migrating.value = false
  }
}

const verifyMigration = async () => {
  try {
    verifying.value = true
    addLog('开始验证数据...', 'info')
    
    const result = await verifyData()
    verificationResult.value = result
    
    addLog('数据验证完成', 'success')
    showToast('验证完成！')
    
  } catch (error) {
    addLog(`验证失败: ${error.message}`, 'error')
    showToast('验证失败')
  } finally {
    verifying.value = false
  }
}

const clearData = async () => {
  try {
    await showConfirmDialog({
      title: '危险操作',
      message: '这将删除所有活动、路线、参与者等数据！此操作不可恢复！',
      confirmButtonText: '确定删除',
      confirmButtonColor: '#ee0a24',
    })

    clearing.value = true
    addLog('开始清理数据...', 'warning')
    
    await clearAllData()
    
    migrationResult.value = null
    verificationResult.value = null
    
    addLog('数据清理完成', 'success')
    showToast('数据已清空')
    
  } catch (error) {
    if (error !== 'cancel') {
      addLog(`清理失败: ${error.message}`, 'error')
      showToast('清理失败')
    }
  } finally {
    clearing.value = false
  }
}

onMounted(() => {
  checkSupabaseStatus()
  addLog('数据迁移工具已就绪', 'info')
})
</script>

<style scoped>
.migration-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding: 16px;
}

.section {
  margin-bottom: 24px;
}

.section h3, .section h4 {
  margin: 16px 0 12px;
  color: #323233;
  font-size: 16px;
  font-weight: 600;
}

.logs {
  background: #000;
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 4px;
  line-height: 1.4;
}

.log-item.error {
  color: #ff4757;
}

.log-item.success {
  color: #2ed573;
}

.log-item.warning {
  color: #ffa502;
}

.log-item.info {
  color: #70a1ff;
}
</style>