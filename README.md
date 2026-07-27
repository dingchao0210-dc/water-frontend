# water-frontend

水利调度系统前端项目

## 技术栈

- **Vue 3** — 渐进式前端框架
- **Vue Router** — 路由管理
- **Pinia** — 状态管理
- **Element Plus** — UI 组件库
- **ECharts** — 图表可视化
- **Axios** — HTTP 请求

## 项目结构

```
water-frontend/
├── public/                    # 公共静态资源
├── src/
│   ├── api/                   # 接口请求封装
│   ├── views/                 # 页面级组件
│   ├── components/
│   │   ├── common/            # 通用组件
│   │   ├── charts/            # 图表组件
│   │   └── layout/            # 布局组件
│   ├── router/                # 路由配置
│   ├── store/                 # 状态管理
│   ├── utils/                 # 工具函数
│   ├── styles/                # 全局样式
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── .env.local                 # 本地环境变量
├── .env.production            # 生产环境变量
├── vue.config.js              # Vue 配置
└── package.json
```

## 启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```
