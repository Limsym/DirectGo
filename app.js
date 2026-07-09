// 支持的平台配置
const platforms = [
    {
        id: 'zhihu',
        name: '知乎',
        aliases: ['zh', 'zhihu', '知乎'],
        searchUrl: 'https://www.zhihu.com/search?type=content&q={keyword}',
        schemeUrl: 'zhihu://search?query={keyword}',
        intentUrl: 'intent://search?query={keyword}#Intent;scheme=zhihu;package=com.zhihu.android;end',
    },
    {
        id: 'xiaohongshu',
        name: '小红书',
        aliases: ['xhs', 'xiaohongshu', '小红书'],
        searchUrl: 'https://www.xiaohongshu.com/search_result?keyword={keyword}',
        schemeUrl: 'xhsdiscover://search?keyword={keyword}',
        intentUrl: 'intent://search?keyword={keyword}#Intent;scheme=xhs;package=com.xingin.xhs;end',
    },
    {
        id: 'weibo',
        name: '微博',
        aliases: ['wb', 'weibo', '微博'],
        searchUrl: 'https://s.weibo.com/weibo?q={keyword}',
        schemeUrl: '', // 微博暂不支持直接搜索的 Scheme 链接
        intentUrl: '', // 微博暂不支持直接搜索的 Intent 链接
    },
    {
        id: 'bilibili',
        name: '哔哩哔哩',
        aliases: ['bl', 'bilibili', '哔哩哔哩', 'b站'],
        searchUrl: 'https://search.bilibili.com/all?keyword={keyword}',
        schemeUrl: 'bilibili://search?keyword={keyword}',
        intentUrl: 'intent://search?keyword={keyword}#Intent;scheme=bilibili;package=tv.danmaku.bili;end',
    },
    {
        id: 'bing',
        name: 'Bing',
        aliases: ['bing', '必应', 'Bing'],
        searchUrl: 'https://www.bing.com/search?q={keyword}',
    },
    {
        id: 'github',
        name: 'GitHub',
        aliases: ['gh', 'github', 'GitHub'],
        searchUrl: 'https://github.com/search?q={keyword}&type=repositories',
        schemeUrl: '', // GitHub App 暂无稳定的搜索 Scheme，留空以回退 Web
        intentUrl: '', // GitHub App 暂无稳定的搜索 Intent，留空以回退 Web
    },
    {
        id: 'amap',
        name: '高德地图',
        aliases: ['amap', 'gd', 'dt', '高德', '地图', '高德地图'],
        searchUrl: 'https://ditu.amap.com/search?query={keyword}',
    },
    {
        id: 'taobao',
        name: '淘宝',
        aliases: ['tb', 'taobao', '淘宝'],
        searchUrl: 'https://s.taobao.com/search?q={keyword}',
        schemeUrl: 'taobao://s.taobao.com?q={keyword}',
        intentUrl: 'intent://s.taobao.com?q={keyword}#Intent;scheme=taobao;package=com.taobao.taobao;end',
    },
    {
        id: 'jd',
        name: '京东',
        aliases: ['jd', 'jingdong', '京东'],
        searchUrl: 'https://search.jd.com/Search?keyword={keyword}&enc=utf-8',
        // 京东 App 搜索：params 为一段 URL 编码后的 JSON，{keyword} 处填编码后的关键词
        schemeUrl: 'openapp.jdmobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22productList%22%2C%22keyWord%22%3A%22{keyword}%22%2C%22from%22%3A%22search%22%7D',
        intentUrl: 'intent://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22productList%22%2C%22keyWord%22%3A%22{keyword}%22%2C%22from%22%3A%22search%22%7D#Intent;scheme=openapp.jdmobile;package=com.jingdong.app.mall;end',
    },
    {
        id: 'pinduoduo',
        name: '拼多多',
        aliases: ['pdd', 'pinduoduo', '拼多多'],
        searchUrl: 'https://mobile.yangkeduo.com/search_result.html?search_key={keyword}',
        schemeUrl: 'pinduoduo://com.xunmeng.pinduoduo/search_result.html?search_key={keyword}',
        intentUrl: 'intent://com.xunmeng.pinduoduo/search_result.html?search_key={keyword}#Intent;scheme=pinduoduo;package=com.xunmeng.pinduoduo;end',
    }
];
const defaultPlatformOrder = platforms.map(p => p.id);

// 根据别名获取平台信息
function getPlatformByAlias(alias) {
    return platforms.find(p =>
        p.id === alias.toLowerCase() ||
        p.aliases.some(a => a.toLowerCase() === alias.toLowerCase())
    );
}

// 获取选中的浏览方式
function getSelectedBrowseMode() {
    const radios = document.getElementsByName("browse-mode");
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
    return "web"; // 默认返回web
}

// 处理搜索
function handleSearch() {
    const platformInput = document.getElementById('platform-input');
    const keywordInput = document.getElementById('keyword-input');

    // 注意：不把解析结果写回输入框。平台框已收进「更多选项」，
    // 一旦写回就会残留并污染下一次搜索（例如上次 pdd 的选择会卡住下次的淘宝）。
    const typedPlatform = platformInput.value.trim();
    let keyword = keywordInput.value.trim();
    let platform = '';

    // 1) 单框快捷命令优先：「平台别名 + 空白 + 关键词」（如: zh AI Agent / 知乎 今天）
    //    兼容半角/全角空格(　)与连续空白。单框里显式写出的平台优先级最高，
    //    从而不受「更多选项」里历史填写/点选的平台影响。
    const quickMatch = keyword.match(/^(\S+)\s+([\s\S]+)$/);
    if (quickMatch) {
        const fastPlatformInfo = getPlatformByAlias(quickMatch[1].trim());
        if (fastPlatformInfo && quickMatch[2].trim()) {
            platform = fastPlatformInfo.id;
            keyword = quickMatch[2].trim();
        }
    }

    // 2) 单框未指定平台时，回退到「更多选项」里显式填写/选择的平台
    if (!platform && typedPlatform) {
        const typedPlatformInfo = getPlatformByAlias(typedPlatform);
        if (typedPlatformInfo) {
            platform = typedPlatformInfo.id;
        } else {
            showMessage(`不支持的平台: ${typedPlatform}`, 'error');
            return;
        }
    }

    if (!keyword) {
        showMessage("请输入搜索关键词", "error");
        return;
    }

    // 3) 仍未指定平台时，默认使用 Bing
    if (!platform) {
        platform = "bing";
    }

    const platformInfo = getPlatformByAlias(platform);
    if (!platformInfo) {
        showMessage(`不支持的平台: ${platform}`, 'error');
        return;
    }

    // 对关键词进行URL编码
    const encodedKeyword = encodeURIComponent(keyword);

    // 获取选中的浏览方式
    const browseMode = getSelectedBrowseMode();
    let targetUrl = '';

    if (browseMode === 'web') {
        targetUrl = platformInfo.searchUrl.replace('{keyword}', encodedKeyword);
    } else if (browseMode === 'scheme') {
        if (platformInfo.schemeUrl) {
            targetUrl = platformInfo.schemeUrl.replace('{keyword}', encodedKeyword);
        } else {
            targetUrl = platformInfo.searchUrl.replace('{keyword}', encodedKeyword);
            showMessage(`该平台不支持 Scheme，已回退到 Web：${platformInfo.name}`, 'warning');
        }
    } else if (browseMode === 'intent') {
        if (platformInfo.intentUrl) {
            targetUrl = platformInfo.intentUrl.replace('{keyword}', encodedKeyword);
        } else {
            targetUrl = platformInfo.searchUrl.replace('{keyword}', encodedKeyword);
            showMessage(`该平台不支持 Intent，已回退到 Web：${platformInfo.name}`, 'warning');
        }
    }

    // 直接跳转到目标平台的搜索结果页
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

// 显示提示信息
function showMessage(message, type) {
    const messageDiv = document.getElementById('message-div');
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// 选择平台
function selectPlatform(platformId, sourceElement) {
    const platformInput = document.getElementById('platform-input');
    platformInput.value = platformId;

    // 更新按钮状态
    document.querySelectorAll('.platform-tag').forEach(btn => {
        btn.classList.remove('active');
    });

    if (sourceElement) {
        sourceElement.classList.add('active');
    }
}

// 键盘事件处理和拖拽功能初始化
document.addEventListener('DOMContentLoaded', function() {
    const platformInput = document.getElementById('platform-input');
    const keywordInput = document.getElementById('keyword-input');
    const searchBtn = document.getElementById('search-btn');
    const resetOrderBtn = document.getElementById('reset-order-btn');
    const platformTagButtons = document.querySelectorAll('.platform-tag');

    searchBtn.addEventListener('click', handleSearch);
    resetOrderBtn.addEventListener('click', resetPlatformOrder);

    platformTagButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (suppressClickAfterTouchDrag) {
                return;
            }
            const platformId = this.getAttribute('data-platform');
            selectPlatform(platformId, this);
        });
    });

    platformInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    keywordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 快捷键：/ 聚焦关键词；Ctrl/Cmd + Enter 发起搜索
    document.addEventListener('keydown', function(e) {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

        if (e.key === '/' && !isTyping) {
            e.preventDefault();
            keywordInput.focus();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });

    // 初始化拖拽功能
    initializeDragAndDrop();
    // 加载保存的排序
    loadPlatformOrder();
});

// 拖拽功能相关变量
let draggedElement = null;
let isTouchDragging = false;
let touchDropTarget = null;
let suppressClickAfterTouchDrag = false;

// 初始化拖拽功能
function initializeDragAndDrop() {
    const platformTags = document.querySelectorAll('.platform-tag');

    platformTags.forEach(tag => {
        // 桌面端 HTML5 拖拽
        tag.addEventListener('dragstart', handleDragStart);
        tag.addEventListener('dragover', handleDragOver);
        tag.addEventListener('drop', handleDrop);
        tag.addEventListener('dragend', handleDragEnd);
        tag.addEventListener('dragenter', handleDragEnter);
        tag.addEventListener('dragleave', handleDragLeave);

        // 移动端触摸拖拽（Android/iOS）
        tag.addEventListener('touchstart', handleTouchStart, { passive: false });
        tag.addEventListener('touchmove', handleTouchMove, { passive: false });
        tag.addEventListener('touchend', handleTouchEnd);
        tag.addEventListener('touchcancel', handleTouchCancel);
    });
}

// 根据目标平台卡片执行重排
function reorderPlatformTags(targetElement) {
    if (!draggedElement || !targetElement || draggedElement === targetElement) {
        return;
    }

    const container = document.getElementById('platform-tags');
    const draggedIndex = Array.from(container.children).indexOf(draggedElement);
    const targetIndex = Array.from(container.children).indexOf(targetElement);

    if (draggedIndex < targetIndex) {
        container.insertBefore(draggedElement, targetElement.nextSibling);
    } else {
        container.insertBefore(draggedElement, targetElement);
    }
}

// 拖拽开始
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

// 拖拽经过
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

// 拖拽进入
function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

// 拖拽离开
function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

// 放置
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        reorderPlatformTags(this);

        // 保存新的排序
        savePlatformOrder();
    }

    return false;
}

// 拖拽结束
function handleDragEnd(e) {
    document.querySelectorAll('.platform-tag').forEach(tag => {
        tag.classList.remove('dragging', 'drag-over');
    });
    draggedElement = null;
}

// 触摸拖拽开始
function handleTouchStart(e) {
    draggedElement = this;
    isTouchDragging = true;
    touchDropTarget = null;
    this.classList.add('dragging');
}

// 触摸拖拽中
function handleTouchMove(e) {
    if (!isTouchDragging || !draggedElement) {
        return;
    }

    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const tagTarget = target ? target.closest('.platform-tag') : null;

    document.querySelectorAll('.platform-tag').forEach(tag => tag.classList.remove('drag-over'));

    if (tagTarget && tagTarget !== draggedElement) {
        tagTarget.classList.add('drag-over');
        touchDropTarget = tagTarget;
        suppressClickAfterTouchDrag = true;
    }
}

// 触摸拖拽结束
function handleTouchEnd() {
    if (isTouchDragging && draggedElement && touchDropTarget) {
        reorderPlatformTags(touchDropTarget);
        savePlatformOrder();
    }

    cleanupTouchDragState();
}

// 触摸拖拽取消
function handleTouchCancel() {
    cleanupTouchDragState();
}

function cleanupTouchDragState() {
    document.querySelectorAll('.platform-tag').forEach(tag => {
        tag.classList.remove('dragging', 'drag-over');
    });

    draggedElement = null;
    touchDropTarget = null;
    isTouchDragging = false;

    if (suppressClickAfterTouchDrag) {
        setTimeout(() => {
            suppressClickAfterTouchDrag = false;
        }, 0);
    }
}

// 保存平台排序到本地存储
function savePlatformOrder() {
    const container = document.getElementById('platform-tags');
    const order = Array.from(container.children).map(tag => tag.getAttribute('data-platform'));
    localStorage.setItem('nofeed-platform-order', JSON.stringify(order));
    showMessage('平台排序已保存', 'success');
}

// 从本地存储加载平台排序
function loadPlatformOrder() {
    const savedOrder = localStorage.getItem('nofeed-platform-order');
    if (savedOrder) {
        try {
            const order = JSON.parse(savedOrder);
            const container = document.getElementById('platform-tags');
            const tags = Array.from(container.children);
            const mergedOrder = [...order];

            // 兼容老数据：补齐新增平台
            defaultPlatformOrder.forEach(platformId => {
                if (!mergedOrder.includes(platformId)) {
                    mergedOrder.push(platformId);
                }
            });

            // 按保存的顺序重新排列
            mergedOrder.forEach(platformId => {
                const tag = tags.find(t => t.getAttribute('data-platform') === platformId);
                if (tag) {
                    container.appendChild(tag);
                }
            });
        } catch (e) {
            console.log('加载平台排序失败:', e);
        }
    }
}

function resetPlatformOrder() {
    const container = document.getElementById('platform-tags');
    const tags = Array.from(container.children);

    defaultPlatformOrder.forEach(platformId => {
        const tag = tags.find(t => t.getAttribute('data-platform') === platformId);
        if (tag) {
            container.appendChild(tag);
        }
    });

    savePlatformOrder();
    showMessage('已恢复默认排序', 'success');
}
