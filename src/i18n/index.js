import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import zh from '../locales/zh.json'
import de from '../locales/de.json'
import ko from '../locales/ko.json'
import ja from '../locales/ja.json'
import fr from '../locales/fr.json'
import zhTW from '../locales/zh-TW.json'
import hakimi from '../locales/hakimi.json'

// 获取用户首选语言
const getDefaultLocale = () => {
    // 1. 从本地存储获取用户之前设置的语言
    const savedLocale = localStorage.getItem('preferred-language')
    if (savedLocale) {
        return savedLocale
    }
    
    // 2. 从浏览器语言获取
    const browserLocale = navigator.language || navigator.userLanguage
    
    // 支持的语言列表
    const supportedLocales = ['en', 'zh', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'hakimi']
    
    // 匹配浏览器语言
    if (supportedLocales.includes(browserLocale)) {
        return browserLocale
    }
    
    // 匹配语言前缀 (例如: zh-CN -> zh)
    const langPrefix = browserLocale.split('-')[0]
    if (supportedLocales.includes(langPrefix)) {
        return langPrefix
    }
    
    // 默认返回英文
    return 'en'
}

const i18n = createI18n({
    legacy: false,
    locale: getDefaultLocale(),
    fallbackLocale: 'en',
    messages: {
        en,
        zh,
        de,
        ko,
        ja,
        fr,
        'zh-TW': zhTW,
        hakimi
    }
})

export default i18n