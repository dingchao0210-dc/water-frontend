const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    startClock();
    loadSupplyConfig();
});

// 实时时钟
function startClock() {
    const el = document.getElementById('headerTime');
    if (!el) return;
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

async function loadSupplyConfig() {
    const overlay = document.getElementById('loadingOverlay');
    try {
        const res = await fetch(`${API_BASE}/api/supply-config`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        renderSettings(data.settings);
        renderPlanCards(data.plan_cards);
        renderStatistics(data.statistics);
        renderDailyWater(data.daily_water);
        renderMapTags(data.map_tags);
        renderMapBubbles(data.map_bubbles);
        renderCanalLabels(data.canal_labels);
        renderSources(data.sources);
        renderConfigTable(data.config_table);
        renderChannels(data.channels);
        fadeOutLoading(overlay);
    } catch (err) {
        console.error('供水配置数据加载失败:', err);
        overlay.innerHTML = `
            <div class="loading-error">
                <div class="error-icon">!</div>
                <div class="error-text">数据加载失败</div>
                <div class="error-hint">请确认后端服务已启动</div>
                <button class="retry-btn" onclick="loadSupplyConfig()">重新加载</button>
            </div>
        `;
    }
}

function fadeOutLoading(el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.6s ease';
    setTimeout(() => el.style.display = 'none', 600);
}

function renderSettings(settings) {
    document.getElementById('configSupplyPlan').textContent = settings.supply_plan;
    document.getElementById('configDemandPlan').textContent = settings.demand_plan;
    document.getElementById('configPlanType').textContent = settings.plan_type;
    document.getElementById('configPlanTime').textContent = `${settings.start_date} - ${settings.end_date}`;
}

function renderPlanCards(cards) {
    document.getElementById('planCards').innerHTML = cards.map(card => `
        <div class="plan-card ${card.active ? 'active' : ''}"><span>${card.label}：</span><strong>${card.value}</strong></div>
    `).join('');
}

function renderStatistics(statistics) {
    document.getElementById('totalDemandWater').textContent = statistics.total_demand;
    document.getElementById('totalDemandUnit').textContent = statistics.total_demand_unit;
    document.getElementById('totalDemandProgress').style.width = `${statistics.total_demand_progress}%`;
    document.getElementById('availableWater').textContent = statistics.available_water;
    document.getElementById('availableWaterUnit').textContent = statistics.available_water_unit;
    document.getElementById('availableWaterProgress').style.width = `${statistics.available_water_progress}%`;
}

function renderDailyWater(items) {
    document.getElementById('dailyWaterList').innerHTML = items.map(item => `
        <div class="daily-item"><span>${item.date}</span><strong>${item.value}</strong><em>${item.unit}</em></div>
    `).join('');
}

function renderMapTags(tags) {
    document.getElementById('configMapTagBar').innerHTML = tags.map(tag => `
        <div class="map-tag ${tag.active ? 'active' : ''}" onclick="switchMapTag(this)">
            <span class="tag-label">${tag.label}</span>
            <span class="tag-value">${tag.value}<span class="tag-unit">${tag.unit}</span></span>
        </div>
    `).join('');
}

function switchMapTag(el) {
    document.querySelectorAll('.map-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

function renderMapBubbles(bubbles) {
    document.getElementById('configMapBubbles').innerHTML = bubbles.map(bubble => `
        <div class="map-bubble" style="top: ${bubble.top}; left: ${bubble.left};">
            ${bubble.name}<br><b>${bubble.volume}${bubble.unit}</b>
        </div>
    `).join('');
}

function renderCanalLabels(labels) {
    document.getElementById('configCanalLabels').innerHTML = labels.map(label => `
        <div class="map-canal-label" style="top: ${label.top}; left: ${label.left};">${label.name}</div>
    `).join('');
}

function renderSources(sources) {
    document.getElementById('sourceList').innerHTML = sources.map(source => `
        <div class="source-item"><i class="source-dot ${source.color}"></i><span>${source.name}</span><strong>${source.value}</strong><em>${source.unit}</em></div>
    `).join('');
}

function renderConfigTable(rows) {
    document.getElementById('configTableBody').innerHTML = rows.map(row => `
        <tr>
            <td>${row.channel}</td>
            <td>${row.demand}</td>
            <td>${row.allocation}</td>
            <td><div class="progress-bar"><div class="progress-fill" style="width: ${row.satisfaction}%;"></div></div>${row.satisfaction}%</td>
        </tr>
    `).join('');
}

function renderChannels(channels) {
    document.getElementById('configChannelButtons').innerHTML = channels.map(channel => `
        <button class="channel-btn ${channel.active ? 'active' : ''}" onclick="switchChannel(this)">${channel.name}</button>
    `).join('');
}

function switchChannel(el) {
    document.querySelectorAll('.channel-btn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
}
