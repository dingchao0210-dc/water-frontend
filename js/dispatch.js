/**
 * 数字孪生赵口引黄灌区 - 水量调度前端脚本
 * 从 FastAPI 后端动态获取数据并渲染页面
 */

// ==============================
// 配置
// ==============================
const API_BASE = window.location.origin;  // 同源部署时直接用当前域名

// ==============================
// 页面初始化
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    startClock();
    loadDashboard();
});

// ==============================
// 实时时钟
// ==============================
function startClock() {
    const el = document.getElementById('headerTime');
    function tick() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        el.textContent = `${h}:${m}:${s}`;
    }
    tick();
    setInterval(tick, 1000);
}

// ==============================
// 数据加载
// ==============================
async function loadDashboard() {
    const overlay = document.getElementById('loadingOverlay');
    try {
        // 使用统一的 dashboard 接口一次获取所有数据
        const res = await fetch(`${API_BASE}/api/dashboard`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // 渲染各模块
        renderPlanSettings(data.plan_settings);
        renderDispatchOverview(data.dispatch_overview);
        renderWaterSupplySequence(data.water_supply_sequence);
        renderMapTags(data.map_tags);
        renderMapBubbles(data.map_bubbles);
        renderCanalLabels(data.canal_labels);
        renderChannels(data.channels);
        renderSediment(data.sediment_data);

        // 隐藏加载动画
        fadeOutLoading(overlay);

    } catch (err) {
        console.error('数据加载失败:', err);
        overlay.innerHTML = `
            <div class="loading-error">
                <div class="error-icon">!</div>
                <div class="error-text">数据加载失败</div>
                <div class="error-hint">请确认后端服务已启动</div>
                <button class="retry-btn" onclick="loadDashboard()">重新加载</button>
            </div>
        `;
    }
}

function fadeOutLoading(el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.6s ease';
    setTimeout(() => el.style.display = 'none', 600);
}

// ==============================
// 渲染：方案设置
// ==============================
function renderPlanSettings(data) {
    document.getElementById('supplyPlan').textContent = data.supply_plan;
    document.getElementById('dispatchPlan').textContent = data.dispatch_plan;
    document.getElementById('planTime').textContent = `${data.start_date} - ${data.end_date}`;
    document.getElementById('planStatus').textContent = data.status;
}

// ==============================
// 渲染：调度总览 KPI（带数字递增动画）
// ==============================
function renderDispatchOverview(data) {
    animateNumber('kpiDays', data.total_days, data.total_days_unit);
    animateNumber('kpiAreas', data.total_areas, data.total_areas_unit);
    animateNumber('kpiWater', data.total_water, data.total_water_unit);
}

function animateNumber(elId, target, unit) {
    const el = document.getElementById(elId);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.innerHTML = `${current}<span class="kpi-unit-small">${unit}</span>`;
    }, 30);
}

// ==============================
// 渲染：供水水序（时间轴）
// ==============================
function renderWaterSupplySequence(items) {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        let statusClass = '';
        let nodeClass = '';

        if (item.status === 'completed') {
            statusClass = 'tl-completed';
            nodeClass = 'tl-node-completed';
        } else if (item.status === 'active') {
            statusClass = 'tl-active';
            nodeClass = 'tl-node-active';
        } else {
            statusClass = 'tl-pending';
            nodeClass = 'tl-node-pending';
        }

        return `
            <div class="timeline-item ${isLast ? 'last' : ''} ${statusClass}" 
                 style="animation: fadeInUp 0.4s ease ${idx * 0.06}s both;">
                <div class="tl-left">
                    <div class="tl-btn">${item.name}</div>
                </div>
                <div class="tl-center">
                    <div class="tl-node ${nodeClass}"></div>
                    <div class="tl-line"></div>
                </div>
                <div class="tl-right">
                    <div class="tl-volume">${item.volume}万m³</div>
                    <div class="tl-time">${item.time}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ==============================
// 渲染：地图标签栏
// ==============================
function renderMapTags(tags) {
    const bar = document.getElementById('mapTagBar');
    bar.innerHTML = tags.map(tag => {
        const valueHtml = tag.unit
            ? `${tag.value}<span class="tag-unit">${tag.unit}</span>`
            : `${tag.value}`;
        return `
        <div class="map-tag ${tag.active ? 'active' : ''}"
             onclick="switchMapTag(this)">
            <span class="tag-label">${tag.label}</span>
            <span class="tag-value">${valueHtml}</span>
        </div>
    `}).join('');
}

function switchMapTag(el) {
    document.querySelectorAll('.map-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

// ==============================
// 渲染：地图气泡
// ==============================
function renderMapBubbles(bubbles) {
    const container = document.getElementById('mapBubblesContainer');
    container.innerHTML = bubbles.map(b => `
        <div class="map-bubble" style="top: ${b.top}; left: ${b.left};">
            ${b.name}<br><b>${b.volume}万m³</b>
        </div>
    `).join('');
}

// ==============================
// 渲染：渠道标签
// ==============================
function renderCanalLabels(labels) {
    const container = document.getElementById('canalLabelsContainer');
    container.innerHTML = labels.map(l => `
        <div class="map-canal-label" style="top: ${l.top}; left: ${l.left};">${l.name}</div>
    `).join('');
}

// ==============================
// 渲染：渠道按钮
// ==============================
function renderChannels(channels) {
    const container = document.getElementById('channelButtons');
    container.innerHTML = channels.map(ch => `
        <button class="channel-btn ${ch.active ? 'active' : ''}" 
                onclick="switchChannel(this, '${ch.id}')">${ch.name}</button>
    `).join('');
}

function switchChannel(el, channelId) {
    document.querySelectorAll('.channel-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

// ==============================
// 渲染：排沙数据表
// ==============================
function renderSediment(rows) {
    const tbody = document.getElementById('sedimentBody');
    tbody.innerHTML = rows.map(row => {
        return `
            <tr>
                <td>${row.reservoir}</td>
                <td>${row.sediment_concentration}</td>
                <td>${row.sediment_volume}</td>
                <td>${row.transport_rate}</td>
            </tr>
        `;
    }).join('');
}
