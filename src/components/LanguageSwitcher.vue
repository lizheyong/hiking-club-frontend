<template>
  <div class="language-switcher" @click.stop ref="switcherRef">
    <!-- 触发按钮 -->
    <div class="language-trigger" @click="toggleDropdown">
      <span class="current-flag">{{ getCurrentLanguageFlag() }}</span>
    </div>
    
    <!-- 下拉菜单 - 使用 Teleport 移到 body -->
    <Teleport to="body">
      <div v-if="showDropdown" class="language-dropdown" :style="dropdownPosition">
        <div
          v-for="lang in availableLanguages"
          :key="lang.code"
          class="language-item"
          :class="{ active: currentLocale === lang.code }"
          @click="changeLanguage(lang.code)"
        >
          <span class="language-flag">{{ lang.flag }}</span>
          <span class="language-label">{{ lang.label }}</span>
          <van-icon 
            v-if="currentLocale === lang.code" 
            name="success" 
            class="check-icon"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const showDropdown = ref(false)
const switcherRef = ref(null)
const dropdownPosition = ref({})

const availableLanguages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'hakimi', label: 'ハキミ語 (≧∇≦)', flag: '🐱' }
]

const currentLocale = computed(() => locale.value)

const getCurrentLanguageFlag = () => {
  const current = availableLanguages.find(lang => lang.code === currentLocale.value)
  return current ? current.flag : '🌍'
}

const updateDropdownPosition = () => {
  if (switcherRef.value) {
    const rect = switcherRef.value.getBoundingClientRect()
    dropdownPosition.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`,
      zIndex: 99999
    }
  }
}

const toggleDropdown = () => {
  if (!showDropdown.value) {
    updateDropdownPosition()
  }
  showDropdown.value = !showDropdown.value
}

const changeLanguage = (langCode) => {
  locale.value = langCode
  showDropdown.value = false
  
  // 保存到本地存储
  localStorage.setItem('preferred-language', langCode)
}

// 点击外部关闭下拉菜单
import { onMounted, onUnmounted } from 'vue'

const handleClickOutside = (event) => {
  const switcher = event.target.closest('.language-switcher')
  if (!switcher) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.language-switcher {
  position: relative;
  z-index: 9999;
}

.language-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(52, 152, 219, 0.6);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15), 
              inset 0 1px 0 rgba(255, 255, 255, 0.9);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px) scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25), 
                inset 0 1px 0 rgba(255, 255, 255, 1);
    border-color: rgba(52, 152, 219, 0.8);
  }

  .current-flag {
    font-size: 20px;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }
}

.language-dropdown {
  min-width: 160px;
  padding: 8px 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
  animation: fadeInDown 0.2s ease-out;

  .language-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &.active {
      background: rgba(52, 152, 219, 0.1);
      
      .language-label {
        color: #3498db;
        font-weight: 600;
      }
    }

    .language-flag {
      font-size: 18px;
      width: 24px;
      text-align: center;
    }

    .language-label {
      flex: 1;
      font-size: 14px;
      color: #2c3e50;
    }

    .check-icon {
      font-size: 14px;
      color: #3498db;
    }
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>