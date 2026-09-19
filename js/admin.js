const API_BASE = window.location.origin;
let currentPage = 'dashboard';
let currentData = null;

const pageTitles = {
    'dashboard': '水量调度数据',
    'supply-config': '供水配置数据'
};

const schemas = {
    'dashboard': [
        {
            key: 'plan_settings',
            title: '方案设置',
            type: 'object',
            fields: [
                { key: 'supply_plan', label: '供水方案' },
                { key: 'dispatch_plan', label: '调度方案' },
                { key: 'start_date', label: '开始日期' },
                { key: 'end_date', label: '结束日期' },
                { key: 'status', label: '方案状态' }
            ]
        },
        {
            key: 'dispatch_overview',
            title: '调度总览',
            type: 'object',
            fields: [
                { key: 'total_days', label: '总天数', valueType: 'number' },
                { key: 'total_days_unit', label: '天数单位' },
                { key: 'total_areas', label: '灌片数量', valueType: 'number' },
                { key: 'total_areas_unit', label: '灌片单位' },
                { key: 'total_water', label: '总水量', valueType: 'number' },
                { key: 'total_water_unit', label: '水量单位' }
            ]
        },
        {
            key: 'water_supply_sequence',
            title: '供水水序',
            type: 'array',
            fields: [
                { key: 'id', label: 'ID', valueType: 'number' },
                { key: 'name', label: '名称' },
                { key: 'volume', label: '水量', valueType: 'number' },
                { key: 'time', label: '时间' },
                { key: 'status', label: '状态', options: ['completed', 'active', 'pending'] }
            ]
        },
        {
            key: 'map_tags',
            title: '地图顶部标签',
            type: 'array',
            fields: [
                { key: 'label', label: '标签' },
                { key: 'value', label: '数值', valueType: 'number' },
                { key: 'unit', label: '单位' },
                { key: 'active', label: '选中', valueType: 'boolean' }
            ]
        },
        {
            key: 'map_bubbles',
            title: '地图气泡',
            type: 'array',
            fields: [
                { key: 'name', label: '名称' },
                { key: 'volume', label: '水量', valueType: 'number' },
                { key: 'top', label: '上边距' },
                { key: 'left', label: '左边距' }
            ]
        },
        {
            key: 'canal_labels',
            title: '渠道标签',
            type: 'array',
            fields: [
                { key: 'name', label: '名称' },
                { key: 'top', label: '上边距' },
                { key: 'left', label: '左边距' }
            ]
        },
        {
            key: 'supply_time',
            title: '供水时间',
            type: 'array',
            fields: [
                { key: 'channel', label: '渠道名称' },
                { key: 'start_date', label: '开始日期' },
                { key: 'end_date', label: '结束日期' },
                { key: 'hours', label: '时长(h)', valueType: 'number' },
                { key: 'progress', label: '进度(%)', valueType: 'number' }
            ]
        },
        {
            key: 'channels',
            title: '渠道按钮',
            type: 'array',
            fields: [
                { key: 'id', label: 'ID' },
                { key: 'name', label: '名称' },
                { key: 'active', label: '选中', valueType: 'boolean' }
            ]
        }
    ],
    'supply-config': [
        {
            key: 'settings',
            title: '方案设置',
            type: 'object',
            fields: [
                { key: 'supply_plan', label: '供水方案' },
                { key: 'demand_plan', label: '需水方案' },
                { key: 'plan_type', label: '方案类型' },
                { key: 'start_date', label: '开始日期' },
                { key: 'end_date', label: '结束日期' }
            ]
        },
        {
            key: 'plan_cards',
            title: '供水方案卡片',
            type: 'array',
            fields: [
                { key: 'label', label: '字段' },
                { key: 'value', label: '内容' },
                { key: 'active', label: '选中', valueType: 'boolean' }
            ]
        },
        {
            key: 'statistics',
            title: '供水统计',
            type: 'object',
            fields: [
                { key: 'total_demand', label: '总需水量', valueType: 'number' },
                { key: 'total_demand_unit', label: '总需水量单位' },
                { key: 'total_demand_progress', label: '总需水进度', valueType: 'number' },
                { key: 'available_water', label: '可供水量', valueType: 'number' },
                { key: 'available_water_unit', label: '可供水量单位' },
                { key: 'available_water_progress', label: '可供水进度', valueType: 'number' }
            ]
        },
        {
            key: 'daily_water',
            title: '每日引水',
            type: 'array',
            fields: [
                { key: 'date', label: '日期' },
                { key: 'value', label: '数值', valueType: 'number' },
                { key: 'unit', label: '单位' }
            ]
        },
        {
            key: 'map_tags',
            title: '地图顶部标签',
            type: 'array',
            fields: [
                { key: 'label', label: '标签' },
                { key: 'value', label: '数值', valueType: 'number' },
                { key: 'unit', label: '单位' },
                { key: 'active', label: '选中', valueType: 'boolean' }
            ]
        },
        {
            key: 'map_bubbles',
            title: '地图气泡',
            type: 'array',
            fields: [
                { key: 'name', label: '名称' },
                { key: 'volume', label: '水量', valueType: 'number' },
                { key: 'unit', label: '单位' },
                { key: 'top', label: '上边距' },
                { key: 'left', label: '左边距' }
            ]
        },
        {
            key: 'canal_labels',
            title: '渠道标签',
            type: 'array',
            fields: [
                { key: 'name', label: '名称' },
                { key: 'top', label: '上边距' },
                { key: 'left', label: '左边距' }
            ]
        },
        {
            key: 'sources',
            title: '供水来源',
            type: 'array',
            fields: [
                { key: 'name', label: '来源名称' },
                { key: 'value', label: '水量', valueType: 'number' },
                { key: 'unit', label: '单位' },
                { key: 'color', label: '颜色', options: ['green', 'cyan', 'yellow'] }
            ]
        },
        {
            key: 'config_table',
            title: '供水配置信息',
            type: 'array',
            fields: [
                { key: 'channel', label: '灌片/渠道' },
                { key: 'demand', label: '需水量', valueType: 'number' },
                { key: 'allocation', label: '配置水量', valueType: 'number' },
                { key: 'satisfaction', label: '满足率(%)', valueType: 'number' }
            ]
        },
        {
            key: 'channels',
            title: '渠道按钮',
            type: 'array',
            fields: [
                { key: 'id', label: 'ID' },
                { key: 'name', label: '名称' },
                { key: 'active', label: '选中', valueType: 'boolean' }
            ]
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => switchPage(tab.dataset.page));
    });
    document.getElementById('reloadBtn').addEventListener('click', loadCurrentData);
    document.getElementById('saveBtn').addEventListener('click', saveCurrentData);
    loadCurrentData();
});

function switchPage(page) {
    currentPage = page;
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.page === page);
    });
    document.getElementById('adminTitle').textContent = pageTitles[page];
    document.getElementById('adminSubtitle').textContent = `正在编辑：${pageTitles[page]}`;
    setMessage('');
    loadCurrentData();
}

async function loadCurrentData() {
    try {
        setMessage('正在加载数据...', 'info');
        const res = await fetch(`${API_BASE}/api/data/${currentPage}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        currentData = await res.json();
        renderForm();
        setMessage('数据加载完成。', 'success');
    } catch (err) {
        console.error('数据加载失败:', err);
        setMessage(`数据加载失败：${err.message}`, 'error');
    }
}

function renderForm() {
    const container = document.getElementById('formContainer');
    container.innerHTML = schemas[currentPage].map(section => {
        const value = currentData[section.key];
        if (section.type === 'object') return renderObjectSection(section, value || {});
        return renderArraySection(section, Array.isArray(value) ? value : []);
    }).join('');
}

function renderObjectSection(section, data) {
    return `
        <section class="admin-data-section" data-section="${section.key}" data-type="object">
            <div class="admin-section-header">
                <h3>${section.title}</h3>
            </div>
            <div class="admin-field-grid">
                ${section.fields.map(field => `
                    <label class="admin-field">
                        <span>${field.label}</span>
                        ${renderInput(section.key, field, data[field.key] ?? '')}
                    </label>
                `).join('')}
            </div>
        </section>
    `;
}

function renderArraySection(section, rows) {
    return `
        <section class="admin-data-section" data-section="${section.key}" data-type="array">
            <div class="admin-section-header">
                <h3>${section.title}</h3>
                <button class="admin-btn small" type="button" onclick="addRow('${section.key}')">新增一行</button>
            </div>
            <div class="admin-table-wrap">
                <table class="admin-data-table">
                    <thead>
                        <tr>
                            ${section.fields.map(field => `<th>${field.label}</th>`).join('')}
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((row, index) => renderTableRow(section, row, index)).join('')}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function renderTableRow(section, row, index) {
    return `
        <tr>
            ${section.fields.map(field => `
                <td>${renderInput(section.key, field, row[field.key] ?? '', index)}</td>
            `).join('')}
            <td><button class="admin-btn danger small" type="button" onclick="deleteRow('${section.key}', ${index})">删除</button></td>
        </tr>
    `;
}

function renderInput(sectionKey, field, value, rowIndex = null) {
    const attrs = `data-section="${sectionKey}" data-field="${field.key}" ${rowIndex === null ? '' : `data-row="${rowIndex}"`}`;
    if (field.valueType === 'boolean') {
        return `
            <select class="admin-input" ${attrs}>
                <option value="true" ${value === true ? 'selected' : ''}>是</option>
                <option value="false" ${value === false ? 'selected' : ''}>否</option>
            </select>
        `;
    }
    if (field.options) {
        return `
            <select class="admin-input" ${attrs}>
                ${field.options.map(option => `<option value="${escapeHtml(option)}" ${value === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
            </select>
        `;
    }
    const type = field.valueType === 'number' ? 'number' : 'text';
    const step = field.valueType === 'number' ? 'step="any"' : '';
    return `<input class="admin-input" type="${type}" ${step} value="${escapeHtml(String(value))}" ${attrs}>`;
}

function addRow(sectionKey) {
    const section = schemas[currentPage].find(item => item.key === sectionKey);
    if (!Array.isArray(currentData[sectionKey])) currentData[sectionKey] = [];
    const row = {};
    section.fields.forEach(field => {
        if (field.valueType === 'number') row[field.key] = 0;
        else if (field.valueType === 'boolean') row[field.key] = false;
        else if (field.options) row[field.key] = field.options[0];
        else row[field.key] = '';
    });
    currentData[sectionKey].push(row);
    renderForm();
    setMessage(`${section.title} 已新增一行，请填写后保存。`, 'info');
}

function deleteRow(sectionKey, rowIndex) {
    const section = schemas[currentPage].find(item => item.key === sectionKey);
    currentData[sectionKey].splice(rowIndex, 1);
    renderForm();
    setMessage(`${section.title} 已删除一行，保存后生效。`, 'info');
}

function collectFormData() {
    const data = structuredClone(currentData);
    schemas[currentPage].forEach(section => {
        if (section.type === 'object') {
            if (!data[section.key]) data[section.key] = {};
            section.fields.forEach(field => {
                const input = document.querySelector(`[data-section="${section.key}"][data-field="${field.key}"]:not([data-row])`);
                if (input) data[section.key][field.key] = parseInputValue(input.value, field);
            });
        } else {
            const rows = [];
            const rowCount = document.querySelectorAll(`[data-section="${section.key}"][data-row][data-field="${section.fields[0].key}"]`).length;
            for (let index = 0; index < rowCount; index++) {
                const row = {};
                section.fields.forEach(field => {
                    const input = document.querySelector(`[data-section="${section.key}"][data-field="${field.key}"][data-row="${index}"]`);
                    row[field.key] = input ? parseInputValue(input.value, field) : '';
                });
                rows.push(row);
            }
            data[section.key] = rows;
        }
    });
    return data;
}

function parseInputValue(value, field) {
    if (field.valueType === 'number') {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }
    if (field.valueType === 'boolean') return value === 'true';
    return value;
}

async function saveCurrentData() {
    try {
        const data = collectFormData();
        setMessage('正在保存数据...', 'info');
        const res = await fetch(`${API_BASE}/api/data/${currentPage}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.detail || `HTTP ${res.status}`);
        }
        const result = await res.json();
        currentData = data;
        renderForm();
        setMessage(result.message || '保存成功，刷新对应页面即可查看效果。', 'success');
    } catch (err) {
        console.error('数据保存失败:', err);
        setMessage(`保存失败：${err.message}`, 'error');
    }
}

function setMessage(message, type = 'info') {
    const el = document.getElementById('adminMessage');
    el.textContent = message;
    el.className = `admin-message ${type}`;
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
