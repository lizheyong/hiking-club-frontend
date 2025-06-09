import { createApp } from "vue";
import { createPinia } from "pinia";
import i18n from './i18n'
import {
  Button,
  Field,
  Form,
  CellGroup,
  Cell,
  Toast,
  Dialog,
  NavBar,
  Tabbar,
  TabbarItem,
  Icon,
  Image as VanImage,
  Tag,
  Calendar,
  Popup,
  Loading,
  List,
  PullRefresh,
  Search,
  Empty,
  Divider,
  Uploader,
  Badge,
  Lazyload,
  // --- 添加以下缺失的组件 ---
  Swipe,
  SwipeItem,
  Collapse,
  CollapseItem,
  ActionSheet,
  // --- 添加结束 ---
} from "vant";
import "vant/lib/index.css";
import "./styles/main.scss";

import App from "./App.vue";
import router from "./router";
import { useUserStore } from "./stores/user";

const app = createApp(App);
app.use(i18n)

// 注册 Vant 组件
const vantComponents = [
  Button,
  Field,
  Form,
  CellGroup,
  Cell,
  Toast, // 函数式组件，use 它通常是为了在模板中使用 <van-toast> 或确保其样式被正确加载
  Dialog, // 同上
  NavBar,
  Tabbar,
  Badge,
  TabbarItem,
  Icon,
  VanImage,
  Tag,
  Calendar,
  Popup,
  Loading,
  List,
  PullRefresh,
  Search,
  Empty,
  Uploader,
  Divider,
  Lazyload,
  // --- 添加以下缺失的组件到数组中 ---
  Swipe,
  SwipeItem,
  Collapse,
  CollapseItem,
  ActionSheet,
  // --- 添加结束 ---
];

vantComponents.forEach((component) => {
  // 对于 Toast, Dialog, Notify 这类函数式组件，
  // Vant 4 中如果要在模板中使用 <van-toast> 等标签，是需要 .use() 的。
  // 如果只是在 JS 中调用 Toast('...'), Dialog.alert('...') 则不一定严格需要，
  // 但 use 一下可以确保其上下文和样式被正确初始化。
  // Vant 的 .use() 方法对这些函数式组件有特殊处理。
  app.use(component);
});

const pinia = createPinia();
app.use(pinia);

app.use(router);

// 初始化认证状态
const userStore = useUserStore();
userStore.initAuth();

app.mount("#app");
