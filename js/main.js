// 全局变量
let participants = [];
let selectedWinners = [];
let winners = {
    '一等奖': [],
    '二等奖': [],
    '三等奖': [],
    '四等奖': [],
    '五等奖': []
};
let isDrawing = false;

// 工具函数
function getPrizeName(level) {
    const prizeNames = {
        '1': '一等奖',
        '2': '二等奖',
        '3': '三等奖',
        '4': '四等奖',
        '5': '五等奖'
    };
    return prizeNames[level];
}

function calculateTenure(hireDate) {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = now - hire; // Remove Math.abs to handle future dates correctly
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    console.log(`Calculating tenure for hire date ${hireDate}: ${diffYears} years`);
    return diffYears;
}

// 文件处理
$(document).ready(function() {
    $('#tsvFile').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            processParticipants(content);
        };
        reader.readAsText(file);
    });

    function processParticipants(content) {
        const lines = content.trim().split('\n');
        participants = [];
        const seen = new Set();

        lines.forEach((line, index) => {
            if (index === 0) return; // Skip header if exists
            const [hireDate, empId, name] = line.trim().split('\t');
            
            // 验证数据完整性和格式
            if (!hireDate || !empId || !name) return;
            if (!/^\d{4}-\d{2}-\d{2}$/.test(hireDate)) return;
            
            // 检查重复
            const key = `${empId}-${name}`;
            if (seen.has(key)) return;
            seen.add(key);

            participants.push({
                hireDate,
                empId,
                name,
                tenure: calculateTenure(hireDate)
            });
        });

        updateParticipantCount();
        $('#startBtn').prop('disabled', false);
    }
});

// 抽奖逻辑
let animationInterval;

$('#startBtn').click(function() {
    if (isDrawing) return;
    
    const prizeLevel = $('input[name="prizeLevel"]:checked').val();
    const winnerCount = parseInt($('#winnerCount').val());
    
    if (!prizeLevel || !winnerCount) {
        alert('请选择奖项和抽取人数');
        return;
    }

    startDrawing(prizeLevel, winnerCount);
});

$('#stopBtn').click(function() {
    if (!isDrawing) return;
    stopDrawing();
});

function startDrawing(prizeLevel, winnerCount) {
    isDrawing = true;
    $('#startBtn').prop('disabled', true);
    $('#stopBtn').prop('disabled', false);
    
    // 重置显示状态
    $('#currentWinners').addClass('hidden').empty();
    $('#slotMachine').removeClass('hidden').show();

    // 过滤符合条件的参与者
    let eligibleParticipants = participants.filter(p => {
        // 移除已中奖者
        const hasWon = Object.values(winners).flat().some(w => w.empId === p.empId);
        if (hasWon) return false;

        // 一、二、三等奖需要入职满2年
        const prizeLevelNum = parseInt(prizeLevel);
        if (prizeLevelNum <= 3 && p.tenure < 2) {
            console.log(`${p.name} (${p.empId}) ineligible for prize level ${prizeLevelNum}: tenure=${p.tenure.toFixed(2)} years`);
            return false;
        }

        return true;
    });

    if (eligibleParticipants.length < winnerCount) {
        alert('符合条件的参与者不足');
        isDrawing = false;
        $('#startBtn').prop('disabled', false);
        $('#stopBtn').prop('disabled', true);
        return;
    }

    // 预先选择获奖者
    selectedWinners = [];
    const tempParticipants = [...eligibleParticipants];
    for (let i = 0; i < winnerCount; i++) {
        if (tempParticipants.length === 0) break;
        const randomIndex = Math.floor(Math.random() * tempParticipants.length);
        selectedWinners.push(tempParticipants[randomIndex]);
        tempParticipants.splice(randomIndex, 1);
    }

    // 开始动画
    const $slotMachine = $('#slotMachine');
    $slotMachine.empty();
    
    for (let i = 0; i < winnerCount; i++) {
        $slotMachine.append(`<div class="slot-item" id="slot${i}"></div>`);
    }

    let animationWinners = [...selectedWinners];
    animationInterval = setInterval(() => {
        $('.slot-item').each(function(index) {
            // 在动画过程中只显示实际获奖者的名字
            const randomWinner = animationWinners[Math.floor(Math.random() * animationWinners.length)];
            $(this).text(randomWinner.name);
        });
    }, 100);
}

function stopDrawing() {
    clearInterval(animationInterval);
    isDrawing = false;
    $('#startBtn').prop('disabled', false);
    $('#stopBtn').prop('disabled', true);

    const prizeLevel = $('input[name="prizeLevel"]:checked').val();
    const prizeName = getPrizeName(prizeLevel);

    // 更新获奖者列表
    winners[prizeName].push(...selectedWinners);

    // 显示获奖者卡片，保持老虎机可见
    displayCurrentWinners(selectedWinners);
    $('#currentWinners').fadeIn(300);

    // 更新累计获奖者列表
    updateAllWinners();
    // 更新参与人数
    updateParticipantCount();

    // 清理本轮选中的获奖者
    selectedWinners = [];
}

function displayCurrentWinners(currentWinners) {
    const $currentWinners = $('#currentWinners');
    $currentWinners.empty();

    currentWinners.forEach(winner => {
        $currentWinners.append(`
            <div class="winner-card">
                <div class="winner-name">${winner.name}</div>
                <div class="winner-id">${winner.empId}</div>
            </div>
        `);
    });
}

function updateAllWinners() {
    const $allWinners = $('#allWinners');
    $allWinners.empty();

    Object.entries(winners).forEach(([prizeName, prizeWinners]) => {
        if (prizeWinners.length > 0) {
            const $prizeGroup = $(`
                <div class="prize-group">
                    <h4>${prizeName}（${prizeWinners.length}人）</h4>
                    <div class="winners-grid"></div>
                </div>
            `);

            prizeWinners.forEach(winner => {
                $prizeGroup.find('.winners-grid').append(`
                    <div class="winner-card">
                        <div class="winner-name">${winner.name}</div>
                        <div class="winner-id">${winner.empId}</div>
                    </div>
                `);
            });

            $allWinners.append($prizeGroup);
        }
    });
}

function updateParticipantCount() {
    const remainingCount = participants.length - Object.values(winners).flat().length;
    $('#totalParticipants').text(remainingCount);
}
