<template>
  <div class="scheme-page">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-left">
        <div class="logo-mark">
          <span class="logo-wave"></span>
          <span class="logo-wave"></span>
          <span class="logo-wave"></span>
        </div>
        <div class="title-group">
          <div class="system-title">河南省智慧水网监测与调度示范应用系统</div>
          <div class="system-subtitle">HENAN SMART WATER NETWORK MONITORING & DISPATCH SYSTEM</div>
        </div>
      </div>

      <div class="header-center">
        <div class="header-time">{{ currentTime }}</div>
      </div>

      <nav class="header-nav">
        <span class="nav-item">年度需水</span>
        <span class="nav-item">需水预测</span>
        <span class="nav-item">供水配置</span>
        <span class="nav-item">水量调度</span>
        <span class="nav-item">闸站控制</span>
        <span class="nav-item active">调度方案</span>
      </nav>

      <div class="header-right">
        <div class="header-icon bell-icon">
          <span>🔔</span>
          <span class="bell-badge">3</span>
        </div>
        <div class="header-icon">⚙️</div>
        <div class="header-icon">👤</div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧面板：方案设置 -->
      <div class="left-panel">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">方案设置 SCHEME SETTING</div>
            <div class="panel-badge">实时</div>
          </div>
          <div class="panel-body">
            <div class="info-row">
              <label class="info-label">开始时间</label>
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 150px"
                size="small"
              />
            </div>
            <div class="info-row">
              <label class="info-label">结束时间</label>
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 150px"
                size="small"
              />
            </div>
            <div class="info-row">
              <label class="info-label">已选调度方案</label>
              <el-select
                v-model="formData.schemeName"
                placeholder="请先选择起止时间"
                style="width: 150px"
                size="small"
                :disabled="!formData.startDate || !formData.endDate"
                @change="handleSchemeChange"
              >
                <el-option label="调度方案（2026年4月）" value="scheme_202604" />
                <el-option label="调度方案（2026年5月）" value="scheme_202605" />
              </el-select>
            </div>
            <div class="info-row">
              <label class="info-label">调度周期</label>
              <div class="info-value">
                {{ getSimpleDateRange() }}
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">操作 OPERATION</div>
          </div>
          <div class="panel-body btn-group-panel">
            <div class="action-btn" @click="reGenerate">重新生成</div>
            <div class="action-btn" @click="pdfPreview">PDF 预览</div>
            <div class="action-btn full-btn" @click="downloadFile">下载</div>
          </div>
        </div>
      </div>

      <!-- 中间面板：方案目录 -->
      <div class="middle-panel">
        <div class="panel flex-1">
          <div class="panel-header">
            <div class="panel-title">方案目录 SCHEME CATALOG</div>
            <div class="panel-badge badge-blue">V1.0</div>
          </div>
          <div class="panel-body scrollable">
            <el-tree
              v-if="formData.schemeName"
              :data="treeData"
              show-expand
              :current-node-key="activeNodeKey"
              @node-click="handleNodeClick"
              node-key="id"
              highlight-current
              :default-expanded-keys="['1', '1.2']"
            />
            <div v-else class="tree-empty-tip">请选择调度方案</div>
          </div>
        </div>
      </div>

      <!-- 右侧面板：预览 -->
      <div class="right-panel">
        <div class="panel flex-1">
          <div class="panel-header">
            <div class="panel-title">方案预览 PREVIEW</div>
            <div class="panel-badge" v-if="isValidScheme">已加载</div>
          </div>
          <div class="panel-body scrollable">
            <div v-if="isValidScheme">
              <!-- 大图展示：点击"预测方案"根节点 -->
              <div v-if="activeNodeKey === '1'" class="big-image-wrap">
                <div class="big-image-header">
                  <h2>预测方案总览</h2>
                  <span class="big-image-sub">Prediction Scheme Overview</span>
                </div>
                <div class="big-image-frame">
                  <img
                    :src="kaifengMap"
                    alt="开封市地图"
                    class="big-image"
                    @error="onImgError"
                  />
                  <div v-if="imgError" class="img-fallback">
                    <div class="img-fallback-icon">🗺️</div>
                    <div class="img-fallback-text">开封市地图</div>
                    <div class="img-fallback-hint">
                      （请确认图片路径 src/assets/kaifeng-map.png）
                    </div>
                  </div>
                </div>
              </div>

              <!-- 普通内容 -->
              <div v-else class="content-area">
                <h2>{{ activeContent.title }}</h2>
                <div v-html="activeContent.html"></div>
              </div>
            </div>
            <div v-else class="empty-tip">
              <p>当前所选时间不在调度方案期限内，请重新选择时间并选择调度方案</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import kaifengMap from '@/assets/kaifeng-map.png'

// ========== 实时时间 ==========
const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${h}:${m}:${s}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ========== 原有逻辑 ==========
const formData = reactive({
  startDate: '',
  endDate: '',
  schemeName: ''
})

// 【修改这里：调度周期只简单展示起止日期，去掉时区复杂文字】
const getSimpleDateRange = () => {
  if (!formData.startDate || !formData.endDate) return ''
  return `${formData.startDate} ~ ${formData.endDate}`
}

const schemeConfig = {
  scheme_202604: {
    label: '调度方案（2026年4月）',
    validStart: '2026-04-01',
    validEnd: '2026-04-30'
  },
  scheme_202605: {
    label: '调度方案（2026年5月）',
    validStart: '2026-05-11',
    validEnd: '2026-05-24'
  }
}

const activeNodeKey = ref('1.3')

const treeData = ref([
  {
    id: '1',
    label: '预测方案',
    children: [
      { id: '1.1', label: '1.1 方案概况' },
      {
        id: '1.2',
        label: '1.2 需水预测',
        children: [
          { id: '1.2.1', label: '1.2.1 农作物种植结构' },
          { id: '1.2.2', label: '1.2.2 农作物灌溉定额' },
          { id: '1.2.3', label: '1.2.3 土壤墒情' },
          { id: '1.2.4', label: '1.2.4 实时需水量' }
        ]
      },
      { id: '1.3', label: '1.3 供水配置' },
      { id: '1.4', label: '1.4 水量调度' },
      { id: '1.5', label: '1.5 闸站控制' }
    ]
  }
])

const contentList = {
  '1': {
    title: '预测方案总览',
    html: ''
  },
  '1.1': {
    title: '1.1 方案概况',
    get html() {
      return `
        <p>调度周期：${getSimpleDateRange()}</p>
        <p>一、调度方案整体概况</p>
        <p>本次水量调度预案针对灌区春灌用水需求编制，统筹农田灌溉、生态补水、村镇生活用水总量平衡。</p>
        <p>灌区覆盖开封全域个区县灌溉区域</p>
        <p>总灌溉面积：<span class="num-placeholder">____</span> 万亩</p>
        <p>调度核心目标：平稳满足小麦灌浆期需水，杜绝干旱缺水</p>
      `
    }
  },
  '1.2.1': {
    title: '1.2.1 农作物种植结构',
    html: `<p>灌区主要种植小麦、玉米，种植面积：<span class="num-placeholder">____</span>万亩，其中小麦面积 <span class="num-placeholder">____</span>万亩</p>`
  },
  '1.2.2': {
    title: '1.2.2 农作物灌溉定额',
    html: `<p>小麦灌溉定额：<span class="num-placeholder">____</span> m³/亩，玉米灌溉定额：<span class="num-placeholder">____</span> m³/亩</p>`
  },
  '1.2.3': {
    title: '1.2.3 土壤墒情',
    get html() {
      return `
        <p>调度周期：${getSimpleDateRange()}</p>
        <p>灌区全域土壤墒情监测数据</p>
        <p>表层土壤含水率均值：<span class="num-placeholder">____</span> %</p>
        <p>整体评价：墒情最差，优先调配水源补给</p>
      `
    }
  },
  '1.2.4': {
    title: '1.2.4 实时需水量',
    get html() {
      return `
        <p>调度周期：${getSimpleDateRange()}</p>
        <p>实时需水量汇总</p>
        <p>灌区每日总需水量：<span class="num-placeholder">____</span> 万立方米</p>
        <p>旬度需水总量：<span class="num-placeholder">____</span> 万立方米</p>
        <p>主要供水时段：早晚大流量输水，午间减量养护渠道</p>
      `
    }
  },
  '1.3': {
    title: '1.3 供水配置',
    html: `<p>可用水源总量：<span class="num-placeholder">____</span>万m³，分水至各干支渠</p>`
  },
  '1.4': {
    title: '1.4 水量调度',
    html: `<p>总引水流量：<span class="num-placeholder">____</span>m³/s，分时段动态调控</p>`
  },
  '1.5': {
    title: '1.5 闸站控制',
    html: `<p>启用闸站数量：<span class="num-placeholder">____</span>座，按调度指令启闭</p>`
  }
}

const activeContent = ref(contentList['1.3'])
const imgError = ref(false)

const onImgError = () => {
  imgError.value = true
}

const handleNodeClick = (data) => {
  activeNodeKey.value = data.id
  if (data.id === '1') {
    imgError.value = false
    return
  }
  if (contentList[data.id]) {
    activeContent.value = contentList[data.id]
  }
}

const isValidScheme = computed(() => {
  if (!formData.schemeName || !formData.startDate || !formData.endDate) {
    return false
  }
  const currentScheme = schemeConfig[formData.schemeName]
  const validStart = new Date(currentScheme.validStart).getTime()
  const validEnd = new Date(currentScheme.validEnd).getTime()
  const pickStart = new Date(formData.startDate).getTime()
  const pickEnd = new Date(formData.endDate).getTime()
  return pickStart <= validEnd && pickEnd >= validStart
})

const handleSchemeChange = () => {
  const currentScheme = schemeConfig[formData.schemeName]
  const validStart = new Date(currentScheme.validStart).getTime()
  const validEnd = new Date(currentScheme.validEnd).getTime()
  const pickStart = new Date(formData.startDate).getTime()
  const pickEnd = new Date(formData.endDate).getTime()
  const hasOverlap = pickStart <= validEnd && pickEnd >= validStart

  if (!hasOverlap) {
    ElMessage.warning(`所选时间和【${currentScheme.label}】无重叠，请重新选择时间！`)
    formData.schemeName = ''
  } else if (pickStart < validStart || pickEnd > validEnd) {
    ElMessage.warning(`所选时间与【${currentScheme.label}】部分重叠，将加载该调度方案`)
  }
}

const reGenerate = () => {
  ElMessage.success('开始重新生成PDF文档')
}
const pdfPreview = () => {
  ElMessage.success('打开PDF预览弹窗')
}
const downloadFile = () => {
  ElMessage.success('开始下载PDF文件')
}
</script>

<style scoped lang="scss">
/* ==========================================
   深蓝科技风格
   ========================================== */
$bg-primary: #0a1628;
$bg-panel: rgba(13, 33, 55, 0.88);
$border-subtle: rgba(0, 212, 255, 0.12);
$border-medium: rgba(0, 212, 255, 0.25);
$border-strong: rgba(0, 212, 255, 0.45);
$cyan: #00d4ff;
$cyan-dim: rgba(0, 212, 255, 0.45);
$blue: #0080cc;
$blue-bright: #00a8ff;
$green: #00ff88;
$yellow: #ffd700;
$text-primary: rgba(255, 255, 255, 0.92);
$text-secondary: rgba(255, 255, 255, 0.6);
$text-dim: rgba(255, 255, 255, 0.35);
$glow-cyan: 0 0 12px rgba(0, 212, 255, 0.3);
$glow-cyan-strong: 0 0 20px rgba(0, 212, 255, 0.5);

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: $glow-cyan; }
  50% { box-shadow: $glow-cyan-strong; }
}
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.5); opacity: 1; }
}
@keyframes waveMove {
  0%, 100% { transform: translateX(0) scaleY(1); }
  25% { transform: translateX(-2px) scaleY(1.2); }
  50% { transform: translateX(0) scaleY(0.8); }
  75% { transform: translateX(2px) scaleY(1.1); }
}

.scheme-page {
  width: 100vw;
  height: 100vh;
  background: $bg-primary;
  color: $text-primary;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif;
}

/* 顶部导航栏 */
.top-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 20px;
  background: linear-gradient(180deg, #0d2137 0%, #0a1628 100%);
  border-bottom: 1px solid $border-medium;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.top-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    $cyan 20%,
    $cyan-dim 50%,
    $cyan 80%,
    transparent 100%);
  opacity: 0.6;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo-mark {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00d4ff, #0080cc);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  box-shadow: $glow-cyan-strong;
  animation: pulseGlow 3s ease-in-out infinite;
}

.logo-wave {
  width: 2px;
  height: 12px;
  background: rgba(10, 22, 40, 0.7);
  border-radius: 1px;
  animation: waveMove 1.2s ease-in-out infinite;
}
.logo-wave:nth-child(2) { height: 16px; animation-delay: 0.15s; }
.logo-wave:nth-child(3) { height: 10px; animation-delay: 0.3s; }

.title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.system-title {
  font-size: 22px;
  font-weight: 800;
  color: $cyan;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5),
               0 0 40px rgba(0, 212, 255, 0.2);
}

.system-subtitle {
  font-size: 10px;
  color: $cyan-dim;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.header-center {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header-time {
  font-size: 14px;
  color: $cyan;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1.5px;
  padding: 4px 14px;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid $border-medium;
  border-radius: 4px;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
  box-shadow: inset 0 0 8px rgba(0, 212, 255, 0.08);
}

.header-nav {
  display: flex;
  align-items: center;
  margin-left: 32px;
  gap: 4px;
  flex: 1;
}

.nav-item {
  padding: 6px 16px;
  font-size: 13px;
  color: $text-secondary;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.25s ease;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: $cyan;
  transition: all 0.25s ease;
  transform: translateX(-50%);
  border-radius: 1px;
}

.nav-item:hover {
  color: $cyan;
  background: rgba(0, 212, 255, 0.08);
}

.nav-item:hover::after {
  width: 60%;
}

.nav-item.active {
  color: $cyan;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 168, 255, 0.08));
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: $glow-cyan;
}

.nav-item.active::after {
  width: 80%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.header-icon {
  font-size: 16px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.25s ease;
  position: relative;
}

.header-icon:hover {
  opacity: 1;
  transform: scale(1.15);
  filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.4));
}

.bell-icon {
  position: relative;
}

.bell-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  width: 14px;
  height: 14px;
  background: #ff4757;
  border-radius: 50%;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 0 6px rgba(255, 71, 87, 0.5);
  animation: breathe 2s ease-in-out infinite;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  padding: 12px;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

.panel {
  background: $bg-panel;
  border: 1px solid $border-subtle;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(0, 212, 255, 0.06);
  transition: border-color 0.4s ease;
  animation: fadeInUp 0.5s ease both;
  display: flex;
  flex-direction: column;
}

.panel:hover {
  border-color: $border-medium;
}

.panel-header {
  padding: 10px 14px;
  border-bottom: 1px solid $border-subtle;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.06), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: $cyan;
  letter-spacing: 1px;
}

.panel-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, $cyan, $blue-bright);
  border-radius: 2px;
  margin-right: 8px;
  vertical-align: middle;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
}

.panel-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.12), rgba(0, 212, 255, 0.08));
  color: $green;
  border: 1px solid rgba(0, 255, 136, 0.25);
  animation: breathe 3s ease-in-out infinite;
}

.badge-blue {
  background: linear-gradient(135deg, rgba(0, 168, 255, 0.12), rgba(0, 212, 255, 0.08));
  color: $blue-bright;
  border-color: rgba(0, 168, 255, 0.25);
  animation: none;
}

.panel-body {
  padding: 12px 14px;
  flex: 1;
  min-height: 0;
}

.panel-body.scrollable {
  overflow-y: auto;
}

.scrollable::-webkit-scrollbar {
  width: 4px;
}
.scrollable::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.2);
  border-radius: 2px;
}
.scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.4);
}

.left-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: background 0.25s ease;
}

.info-row:hover {
  background: rgba(0, 212, 255, 0.03);
  padding-left: 4px;
  padding-right: 4px;
  margin-left: -4px;
  margin-right: -4px;
  border-radius: 4px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 12px;
  color: $text-dim;
  white-space: nowrap;
}

.info-value {
  font-size: 12px;
  color: $text-primary;
  text-align: right;
}

.btn-group-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px 14px;
}

.action-btn {
  height: 44px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 168, 255, 0.06));
  border: 1px solid $border-medium;
  color: $cyan;
  font-size: 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  font-weight: 500;
}

.action-btn:hover {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.22), rgba(0, 168, 255, 0.12));
  box-shadow: $glow-cyan;
  transform: translateY(-1px);
}

.action-btn:active {
  transform: scale(0.97);
}

.full-btn {
  grid-column: 1 / -1;
}

.middle-panel {
  width: 290px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.middle-panel .panel.flex-1,
.right-panel .panel.flex-1 {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.middle-panel .panel-body.scrollable,
.right-panel .panel-body.scrollable {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.tree-empty-tip {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-dim;
  font-size: 13px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.content-area {
  font-size: 15px;
  line-height: 1.8;
  color: $text-primary;
}


.content-area h2 {
  color: #00d4ff;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.45);
  border-left: 3px solid #00d4ff;
  padding-left: 10px;
}

.content-area p {
  margin: 8px 0;
}

.num-placeholder {
  color: $yellow;
  letter-spacing: 3px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.2);
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $text-dim;
  font-size: 15px;
  text-align: center;
  padding: 0 20px;
  line-height: 1.8;
}

/* ========== 大图展示样式（适配开封市地图） ========== */
.big-image-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.4s ease both;
}

.big-image-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid $border-subtle;
  flex-shrink: 0;
}

.big-image-header h2 {
  color: $cyan;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
}

.big-image-sub {
  font-size: 11px;
  color: $cyan-dim;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.big-image-frame {
  flex: 1;
  min-height: 0;
  position: relative;
  border: 1px solid $border-medium;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: inset 0 0 30px rgba(0, 212, 255, 0.06),
              0 0 20px rgba(0, 212, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.big-image-frame::before,
.big-image-frame::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border: 2px solid $cyan;
  pointer-events: none;
  z-index: 3;
}
.big-image-frame::before {
  top: 8px;
  left: 8px;
  border-right: none;
  border-bottom: none;
  box-shadow: -2px -2px 10px rgba(0, 212, 255, 0.6);
}
.big-image-frame::after {
  bottom: 8px;
  right: 8px;
  border-left: none;
  border-top: none;
  box-shadow: 2px 2px 10px rgba(0, 212, 255, 0.6);
}

.big-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  animation: fadeIn 0.6s ease both;
}

.img-fallback {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: $cyan-dim;
  background: rgba(10, 22, 40, 0.95);
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 4;
}

.img-fallback-icon {
  font-size: 48px;
  opacity: 0.7;
  filter: drop-shadow(0 0 12px rgba(0, 212, 255, 0.5));
}

.img-fallback-text {
  font-size: 18px;
  color: $cyan;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.4);
}

.img-fallback-hint {
  font-size: 12px;
  color: $text-dim;
  letter-spacing: 1px;
}

/* Element Plus 深色适配 */
:deep(.el-input__inner) {
  background: rgba(13, 33, 55, 0.9) !important;
  border: 1px solid $border-medium !important;
  color: $text-primary !important;
  font-size: 12px !important;
}

:deep(.el-input__inner:focus) {
  border-color: $cyan !important;
  box-shadow: $glow-cyan !important;
}

:deep(.el-select .el-input__inner) {
  background: rgba(13, 33, 55, 0.9) !important;
  border: 1px solid $border-medium !important;
  color: $text-primary !important;
}

/* ==========================================
   方案目录树 - 字体调亮
   ========================================== */

:deep(.el-tree) {
  background: transparent !important;
  color: #ffffff !important;
  font-size: 13.5px;
  font-weight: 500;
}

:deep(.el-tree-node__content) {
  color: #ffffff !important;
  background: transparent !important;
  height: 34px;
  border-radius: 4px;
  transition: all 0.25s ease;
  font-weight: 500;
}

/* 鼠标悬停：保持白色，背景轻微青色 */
:deep(.el-tree-node__content:hover) {
  background: rgba(0, 212, 255, 0.12) !important;
  color: #ffffff !important;
}

/* 选中节点：文字变成与"方案目录"标题一样的青色 #00d4ff */
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.18), rgba(0, 168, 255, 0.08)) !important;
  color: #00d4ff !important;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.55);
  border: 1px solid rgba(0, 212, 255, 0.35);
}

/* 展开箭头颜色 */
:deep(.el-tree-node__expand-icon) {
  color: rgba(0, 212, 255, 0.85) !important;
}

:deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent !important;
}

@media (max-width: 1400px) {
  .left-panel { width: 260px; }
  .middle-panel { width: 260px; }
}

@media (max-width: 1200px) {
  .left-panel { width: 240px; }
  .middle-panel { width: 240px; }
  .system-subtitle { display: none; }
  .header-time { display: none; }
}
</style>
