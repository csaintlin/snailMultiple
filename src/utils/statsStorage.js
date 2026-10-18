/**
 * statsStorage.js
 * 統一管理答題紀錄、作答歷史、擊殺數與金幣持久化儲存
 */

const STORAGE_KEYS = {
    COINS: 'snail_coins',
    FORMULA_HISTORY: 'snail_formula_history',
    CUMULATIVE_KILLS: 'snail_cumulative_kills',
    ANSWER_LOGS: 'snail_answer_logs',
    OWNED_WEAPONS: 'snail_owned_weapons',
    EQUIPPED_WEAPON: 'snail_equipped_weapon',
    UNLOCKED_LEVELS: 'snail_unlocked_levels',
};

// 格式化日期為 YYYY-MM-DD (本地時間)
export function formatDate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 取得已擁有的武器清單
export function getOwnedWeapons() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNED_WEAPONS) || '[]');
        return Array.isArray(stored) && stored.length > 0 ? stored : ['pistol'];
    } catch {
        return ['pistol'];
    }
}

// 儲存已擁有的武器清單
export function saveOwnedWeapons(weapons) {
    try {
        const list = Array.isArray(weapons) && weapons.length > 0 ? weapons : ['pistol'];
        localStorage.setItem(STORAGE_KEYS.OWNED_WEAPONS, JSON.stringify(list));
        return list;
    } catch {
        return weapons;
    }
}

// 取得目前裝備的武器 ID
export function getEquippedWeapon() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.EQUIPPED_WEAPON);
        return stored || 'pistol';
    } catch {
        return 'pistol';
    }
}

// 儲存目前裝備的武器 ID
export function saveEquippedWeapon(weaponId) {
    try {
        const id = weaponId || 'pistol';
        localStorage.setItem(STORAGE_KEYS.EQUIPPED_WEAPON, id);
        return id;
    } catch {
        return weaponId;
    }
}

// 取得已解鎖關卡數
export function getUnlockedLevels() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
        return stored !== null ? Math.max(1, parseInt(stored, 10) || 1) : 1;
    } catch {
        return 1;
    }
}

// 儲存已解鎖關卡數
export function saveUnlockedLevels(levels) {
    try {
        const val = Math.max(1, Math.floor(levels));
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, String(val));
        return val;
    } catch {
        return levels;
    }
}

// 取得金幣
export function getCoins() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.COINS);
        return stored !== null ? Math.max(0, parseInt(stored, 10) || 0) : 0;
    } catch {
        return 0;
    }
}

// 儲存金幣
export function saveCoins(coins) {
    try {
        const val = Math.max(0, Math.floor(coins));
        localStorage.setItem(STORAGE_KEYS.COINS, String(val));
        return val;
    } catch {
        return coins;
    }
}

// 取得最近 20 次算式歷史 ({ [formula]: number[] })
export function getFormulaHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMULA_HISTORY) || '{}');
    } catch {
        return {};
    }
}

// 儲存算式歷史
export function saveFormulaHistory(history) {
    try {
        localStorage.setItem(STORAGE_KEYS.FORMULA_HISTORY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save formula history', e);
    }
}

// 取得累計消滅數
export function getCumulativeKills() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUMULATIVE_KILLS) || '{}');
    } catch {
        return {};
    }
}

// 儲存累計消滅數
export function saveCumulativeKills(kills) {
    try {
        localStorage.setItem(STORAGE_KEYS.CUMULATIVE_KILLS, JSON.stringify(kills));
    } catch (e) {
        console.error('Failed to save cumulative kills', e);
    }
}

// 取得完整時間戳作答日誌
export function getAnswerLogs() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWER_LOGS) || '[]');
    } catch {
        return [];
    }
}

// 儲存完整作答日誌
export function saveAnswerLogs(logs) {
    try {
        // 保留最近 5000 筆紀錄避免 LocalStorage 溢出
        const trimmed = logs.slice(-5000);
        localStorage.setItem(STORAGE_KEYS.ANSWER_LOGS, JSON.stringify(trimmed));
    } catch (e) {
        console.error('Failed to save answer logs', e);
    }
}

// 紀錄一次作答結果 (對/錯)
export function recordAnswer(formula, isCorrect, levelMult) {
    const isSuccess = Boolean(isCorrect);
    
    // 1. 更新最近 20 筆歷史
    const history = getFormulaHistory();
    const arr = history[formula] || [];
    arr.push(isSuccess ? 1 : 0);
    if (arr.length > 20) {
        arr.shift();
    }
    history[formula] = arr;
    saveFormulaHistory(history);

    // 2. 寫入時間戳日誌
    const now = new Date();
    const logItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        formula,
        levelMult: levelMult || parseInt(formula.split(' x ')[0], 10) || 1,
        isCorrect: isSuccess,
        timestamp: now.getTime(),
        dateStr: formatDate(now),
    };
    const logs = getAnswerLogs();
    logs.push(logItem);
    saveAnswerLogs(logs);

    return { history, logItem };
}

// 增加算式擊殺數
export function addCumulativeKills(roundKillsMap) {
    const stored = getCumulativeKills();
    Object.entries(roundKillsMap).forEach(([formula, count]) => {
        if (count > 0) {
            stored[formula] = (stored[formula] || 0) + count;
        }
    });
    saveCumulativeKills(stored);
    return stored;
}

// 計算單一關卡 (Level 1~9) 的總體與題目詳細統計
export function getLevelStats(levelMultiplier) {
    const history = getFormulaHistory();
    const kills = getCumulativeKills();

    let totalAttempts = 0;
    let totalCorrect = 0;
    let totalKills = 0;

    const formulas = Array.from({ length: 10 }, (_, i) => {
        const multiplicand = i + 1;
        const formula = `${levelMultiplier} x ${multiplicand}`;
        const hist = history[formula] || [];
        const attempts = hist.length;
        const correct = hist.reduce((sum, v) => sum + v, 0);
        const wrong = attempts - correct;
        const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : null;
        const reliable = attempts >= 10;
        const killCount = kills[formula] || 0;

        totalAttempts += attempts;
        totalCorrect += correct;
        totalKills += killCount;

        return {
            formula,
            multiplier: levelMultiplier,
            multiplicand,
            history: hist,
            attempts,
            correct,
            wrong,
            accuracy,
            reliable,
            kills: killCount,
        };
    });

    const levelAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;

    return {
        levelMultiplier,
        totalAttempts,
        totalCorrect,
        totalWrong: totalAttempts - totalCorrect,
        accuracy: levelAccuracy,
        totalKills,
        formulas,
    };
}

// 取得所有曾有作答紀錄的日期清單 (由新到舊)
export function getAvailableDates() {
    const logs = getAnswerLogs();
    const datesSet = new Set();
    logs.forEach(log => {
        if (log.dateStr) {
            datesSet.add(log.dateStr);
        }
    });

    const dates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) {
        dates.push(formatDate());
    }
    return dates;
}

// 取得特定日期 (YYYY-MM-DD 00:00~23:59) 的作答統計
export function getDailyStats(dateStr) {
    const targetDate = dateStr || formatDate();
    const logs = getAnswerLogs();
    const dayLogs = logs.filter(l => l.dateStr === targetDate);

    const total = dayLogs.length;
    const correct = dayLogs.filter(l => l.isCorrect).length;
    const wrong = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // 依算式歸納
    const formulaMap = {};
    dayLogs.forEach(log => {
        if (!formulaMap[log.formula]) {
            formulaMap[log.formula] = {
                formula: log.formula,
                levelMult: log.levelMult,
                attempts: 0,
                correct: 0,
                wrong: 0,
                lastTimestamp: log.timestamp,
            };
        }
        formulaMap[log.formula].attempts += 1;
        if (log.isCorrect) {
            formulaMap[log.formula].correct += 1;
        } else {
            formulaMap[log.formula].wrong += 1;
        }
        if (log.timestamp > formulaMap[log.formula].lastTimestamp) {
            formulaMap[log.formula].lastTimestamp = log.timestamp;
        }
    });

    const formulaBreakdown = Object.values(formulaMap).map(item => {
        return {
            ...item,
            accuracy: item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0,
        };
    }).sort((a, b) => {
        if (a.levelMult !== b.levelMult) return a.levelMult - b.levelMult;
        const numA = parseInt(a.formula.split(' x ')[1] || '0', 10);
        const numB = parseInt(b.formula.split(' x ')[1] || '0', 10);
        return numA - numB;
    });

    return {
        dateStr: targetDate,
        total,
        correct,
        wrong,
        accuracy,
        formulaBreakdown,
    };
}

// 一鍵重設所有答題紀錄與金幣
export function resetAllStatsAndCoins() {
    try {
        localStorage.removeItem(STORAGE_KEYS.COINS);
        localStorage.removeItem(STORAGE_KEYS.FORMULA_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.CUMULATIVE_KILLS);
        localStorage.removeItem(STORAGE_KEYS.ANSWER_LOGS);
    } catch (e) {
        console.error('Failed to clear storage', e);
    }
    return {
        coins: 0,
        formulaHistory: {},
        cumulativeKills: {},
        answerLogs: [],
    };
}
