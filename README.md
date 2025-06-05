<div align="center">
  <img src="src/assets/hiking-club-banner.png" alt="Hiking Club Frontend Banner" width="100%">
</div>

# 🏔️ Hiking Club Frontend

一个现代化的徒步俱乐部前端应用，帮助户外爱好者发现、组织和参与徒步活动。

## ✨ 主要功能

### 🏠 首页
- **精美的玻璃拟态设计**：采用现代化的毛玻璃效果和渐变背景
- **活动状态展示**：
  - 报名中的活动：显示当前可报名的徒步活动
  - 投票中的活动：展示正在进行路线投票的活动
- **快捷操作**：
  - 发布活动
  - 查看我的活动
  - 收藏活动
  - 活动指南

### 👤 用户系统
- **用户注册/登录**：完整的用户认证系统
- **个人资料管理**：
  - 个人信息编辑
  - 头像上传
  - 个人设置
- **活动管理**：
  - 我参与的活动
  - 我创建的活动
  - 收藏的活动

### 🚶‍♂️ 活动功能
- **活动浏览**：
  - 活动列表展示
  - 搜索和筛选功能
  - 活动详情查看
- **活动创建**：
  - 发布新的徒步活动
  - 设置活动时间、地点、人数限制
  - 上传活动封面图片
- **活动参与**：
  - 报名参加活动
  - 取消报名
  - 路线投票功能
- **活动状态**：
  - 报名中：用户可以报名参加
  - 投票中：参与者可以投票选择路线
  - 进行中：活动正在进行
  - 已结束：活动已完成

### 🔧 管理功能
- **管理员面板**：
  - 活动管理
  - 用户管理
  - 系统设置
- **权限控制**：基于角色的访问控制

## 🛠️ 技术栈

### 前端框架
- **Vue 3**：使用 Composition API 和 `<script setup>` 语法
- **Vue Router 4**：单页面应用路由管理
- **Pinia**：现代化的状态管理

### UI 组件库
- **Vant 4**：移动端 UI 组件库
- **自定义样式**：玻璃拟态设计和渐变效果

### 构建工具
- **Vite**：快速的构建工具和开发服务器
- **Sass**：CSS 预处理器

### 其他功能
- **PWA 支持**：渐进式 Web 应用
- **Axios**：HTTP 请求库
- **VueUse**：Vue 组合式 API 工具集
- **Three.js**：3D 图形库（用于特殊效果）

## 📱 响应式设计

应用采用移动优先的设计理念，完美适配：
- 📱 手机端
- 📱 平板端
- 💻 桌面端

## 🎨 设计特色

- **玻璃拟态效果**：现代化的毛玻璃卡片设计
- **渐变背景**：多层次的渐变色彩
- **流畅动画**：页面切换和交互动画
- **直观导航**：底部标签栏导航

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
应用将在 `http://localhost:5173` 启动

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── api/                 # API 接口
│   ├── activity.js     # 活动相关 API
│   ├── user.js         # 用户相关 API
│   ├── request.js      # HTTP 请求配置
│   └── mock.js         # 模拟数据
├── assets/             # 静态资源
├── components/         # 可复用组件
├── composables/        # 组合式函数
├── layouts/            # 布局组件
├── pages/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Login.vue       # 登录页
│   ├── Register.vue    # 注册页
│   ├── Activities.vue  # 活动列表
│   ├── ActivityDetail.vue # 活动详情
│   ├── CreateActivity.vue # 创建活动
│   ├── Profile.vue     # 个人中心
│   └── admin/          # 管理员页面
├── router/             # 路由配置
├── stores/             # 状态管理
├── styles/             # 全局样式
└── utils/              # 工具函数
```

## 🔧 配置说明

### API 配置
项目支持真实 API 和模拟数据两种模式：

```javascript
// src/api/activity.js
const USE_MOCK = true; // 设置为 false 使用真实 API
```

### PWA 配置
应用支持 PWA 功能，配置文件在 `vite.config.js`：

```javascript
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "Hiking Club",
    short_name: "HikingClub",
    description: "探索自然，结交朋友"
  }
})
```

## 🌟 核心特性详解

### 路由守卫
- **身份验证**：自动检查用户登录状态
- **权限控制**：管理员页面需要特殊权限
- **自动重定向**：未登录用户自动跳转到登录页

### 状态管理
使用 Pinia 进行状态管理：
- **用户状态**：登录信息、个人资料
- **活动状态**：活动列表、详情缓存
- **持久化存储**：用户登录状态本地保存

### 响应式设计
- **移动优先**：专为移动设备优化
- **自适应布局**：支持各种屏幕尺寸
- **触摸友好**：优化的触摸交互体验

## 📋 页面功能说明

| 页面 | 路径 | 功能描述 | 权限要求 |
|------|------|----------|----------|
| 首页 | `/` | 展示活动概览和快捷操作 | 无 |
| 登录 | `/login` | 用户登录 | 无 |
| 注册 | `/register` | 用户注册 | 无 |
| 活动列表 | `/activities` | 浏览所有活动 | 无 |
| 活动详情 | `/activity/:id` | 查看活动详细信息 | 无 |
| 创建活动 | `/create-activity` | 发布新活动 | 需要登录 |
| 个人中心 | `/profile` | 个人信息和设置 | 需要登录 |
| 我的活动 | `/profile/activities` | 查看参与的活动 | 需要登录 |
| 收藏活动 | `/profile/favorites` | 查看收藏的活动 | 需要登录 |
| 创建的活动 | `/profile/created` | 查看自己创建的活动 | 需要登录 |
| 管理员面板 | `/admin` | 系统管理功能 | 需要管理员权限 |

## 🎯 开发指南

### 添加新页面
1. 在 `src/pages/` 创建 Vue 组件
2. 在 `src/router/index.js` 添加路由配置
3. 设置适当的权限要求

### 添加新 API
1. 在 `src/api/` 相应文件中添加接口函数
2. 在 `src/api/mock.js` 添加对应的模拟数据
3. 在组件中调用 API

### 样式开发
- 使用 SCSS 预处理器
- 遵循 BEM 命名规范
- 利用现有的玻璃拟态样式类

## 🚀 部署

### 构建优化
项目已配置生产环境优化：
- 代码分割和懒加载
- 资源压缩和优化
- PWA 离线支持

### 部署到静态托管
```bash
npm run build
# 将 dist/ 目录部署到你的静态托管服务
```

支持的托管平台：
- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
- 使用 ESLint 和 Prettier
- 遵循 Vue 3 最佳实践
- 编写清晰的注释

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 加入我们的社区讨论

---

**探索自然，结交朋友 🏔️**
