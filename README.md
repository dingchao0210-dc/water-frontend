# 数字孪生赵口引黄灌区 - 水量调度系统

## 项目简介

本项目实现了水量调度页面的前后端打通，使用 **FastAPI** 作为后端框架，提供 RESTful API 接口，前端通过 `fetch` 动态获取数据并渲染。同时对页面进行了视觉增强优化。

## 技术栈

| 层级 | 技术 | 说明 |
|:---|:---|:---|
| 后端 | Python FastAPI | 高性能异步 Web 框架 |
| 数据 | 内存模拟数据 | 实际项目可替换为数据库 |
| 前端 | 原生 HTML/CSS/JS | 无框架依赖，轻量高效 |
| 通信 | RESTful API + JSON | 前后端分离标准架构 |

## 目录结构

```
WATER-DISPATCH-SCREEN/
├── index.html              # 前端主页面
├── css/
│   └── dispatch.css        # 样式文件（增强版）
├── js/
│   └── dispatch.js         # 前端逻辑（fetch + 动态渲染）
├── images/
│   └── kaifeng_map_preview.jpg  # 地图底图
└── backend/
    ├── main.py             # FastAPI 后端（API + 数据）
    ├── run.py              # 启动脚本（自动安装依赖）
    ├── start.bat           # Windows 启动脚本
    ├── start.sh            # Linux/Mac 启动脚本
    └── requirements.txt    # Python 依赖
```

## 快速启动

### 方式一：一键启动（推荐）

```bash
cd backend
python run.py
```

启动脚本会自动检查并安装依赖，然后启动服务。

### 方式二：手动启动

```bash
# 1. 安装依赖
pip install -r backend/requirements.txt

# 2. 启动服务
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 方式三：Windows 用户

双击 `backend/start.bat` 即可。

启动后访问：
- **页面地址**：http://localhost:8000
- **API 文档**：http://localhost:8000/docs（Swagger UI 自动生成）

## API 接口列表

| 接口 | 方法 | 说明 |
|:---|:---|:---|
| `/api/dashboard` | GET | 获取所有仪表盘数据（推荐） |
| `/api/plan-settings` | GET | 获取方案设置 |
| `/api/dispatch-overview` | GET | 获取调度总览 KPI |
| `/api/water-supply-sequence` | GET | 获取供水水序时间轴 |
| `/api/map-tags` | GET | 获取地图顶部标签数据 |
| `/api/map-bubbles` | GET | 获取地图气泡数据 |
| `/api/canal-labels` | GET | 获取渠道标签 |
| `/api/supply-time` | GET | 获取供水时间表 |
| `/api/channels` | GET | 获取渠道列表 |

## 前后端打通说明

### 数据流向

```
后端 (FastAPI)  →  JSON 数据  →  前端 (fetch)  →  DOM 渲染
```

### 前端关键代码（js/dispatch.js）

```javascript
// 从后端获取数据
const res = await fetch(`${API_BASE}/api/dashboard`);
const data = await res.json();

// 渲染到页面
renderPlanSettings(data.plan_settings);
renderDispatchOverview(data.dispatch_overview);
// ...
```

### 后端关键代码（backend/main.py）

```python
@app.get("/api/dashboard")
async def get_dashboard():
    return {
        "plan_settings": plan_settings,
        "dispatch_overview": dispatch_overview,
        # ...
    }
```

## 视觉增强优化

相比原版，新增了以下视觉表现：

- **CSS 变量系统**：统一管理颜色、阴影、过渡时间
- **深色科技主题**：青色主调 + 黄色数据 + 绿色状态的多层次配色
- **加载动画**：三环旋转加载器 + 错误重试机制
- **数字递增动画**：KPI 数值从 0 递增到目标值
- **时间轴状态色**：已完成(绿)、进行中(青色发光脉冲)、等待中(灰蓝)
- **地图气泡浮动动画**：数据气泡上下浮动 + 发光效果
- **Logo 水波动画**：三根柱形模拟水波跳动
- **导航下划线动画**：hover 时底部线条展开
- **进度条多色渐变**：根据进度值显示不同颜色
- **通知角标脉冲**：红色数字角标呼吸闪烁
- **实时时钟**：顶部显示当前时间

## 如何接入真实数据库

将 `backend/main.py` 中的模拟数据替换为数据库查询即可：

```python
# 示例：接入 MySQL
import pymysql

def get_db():
    return pymysql.connect(host="localhost", user="root",
                          password="xxx", database="zhaokou")

@app.get("/api/dispatch-overview")
async def get_dispatch_overview():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT total_days, total_areas, total_water FROM overview")
    row = cursor.fetchone()
    db.close()
    return {
        "total_days": row[0],
        "total_areas": row[1],
        "total_water": row[2],
        # ...
    }
```
