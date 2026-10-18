import { getLevelStats } from './statsStorage';
import levelsData from '../config/levels.json';

const STORAGE_KEY_ACHIEVEMENTS = 'snail_unlocked_achievements';

export const ACHIEVEMENT_TIERS = [
  { tier: 0, key: 'bronze', name: '銅牌', minAttempts: 2, minAccuracy: 60, op: '>=' },
  { tier: 1, key: 'silver', name: '銀牌', minAttempts: 15, minAccuracy: 70, op: '>' },
  { tier: 2, key: 'gold', name: '金牌', minAttempts: 30, minAccuracy: 90, op: '>' },
  { tier: 3, key: 'diamond', name: '鑽石', minAttempts: 60, minAccuracy: 95, op: '>' }
];

/**
 * 取得所有已解鎖的成就 object
 * 回傳結構: { "1_0": 171234567890, "1_1": 171234569999, ... }
 */
export function getUnlockedAchievements() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS) || '{}');
  } catch {
    return {};
  }
}

/**
 * 儲存成就資料到 LocalStorage
 */
export function saveUnlockedAchievements(data) {
  try {
    localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save achievements', e);
  }
}

/**
 * 判斷特定 Level (multiplier) 在指定 Tier 條件下是否達標
 * 銅牌: 每題回答 2 次以上，正確率 >= 60%
 * 銀牌: 每題回答 15 次以上，正確率 > 70%
 * 金牌: 每題回答 30 次以上，正確率 > 90%
 * 鑽石: 每題回答 60 次以上，正確率 > 95%
 */
export function checkTierCriteria(levelMult, tierIndex) {
  const levelStats = getLevelStats(levelMult);
  const formulas = levelStats ? levelStats.formulas : [];
  const tierInfo = ACHIEVEMENT_TIERS[tierIndex];

  if (!tierInfo || !formulas || formulas.length < 10) return false;

  return formulas.every(f => {
    if (f.attempts < tierInfo.minAttempts) return false;
    if (f.accuracy === null || f.accuracy === undefined) return false;

    if (tierInfo.op === '>=') {
      return f.accuracy >= tierInfo.minAccuracy;
    } else {
      return f.accuracy > tierInfo.minAccuracy;
    }
  });
}

/**
 * 計算單一關卡針對指定 Tier 的進度細節
 */
export function getTierProgress(levelMult, tierIndex) {
  const levelStats = getLevelStats(levelMult);
  const formulas = levelStats ? levelStats.formulas : [];
  const tierInfo = ACHIEVEMENT_TIERS[tierIndex];

  if (!tierInfo || !formulas || formulas.length < 10) {
    return { minAttempts: 0, minAccuracy: 0, completedCount: 0, totalCount: 10 };
  }

  let minAttempts = Infinity;
  let minAccuracy = Infinity;
  let completedCount = 0;

  formulas.forEach(f => {
    if (f.attempts < minAttempts) minAttempts = f.attempts;
    const acc = f.accuracy !== null ? f.accuracy : 0;
    if (acc < minAccuracy) minAccuracy = acc;

    const meetsAtt = f.attempts >= tierInfo.minAttempts;
    const meetsAcc = tierInfo.op === '>=' ? acc >= tierInfo.minAccuracy : acc > tierInfo.minAccuracy;

    if (meetsAtt && meetsAcc) {
      completedCount += 1;
    }
  });

  if (minAttempts === Infinity) minAttempts = 0;
  if (minAccuracy === Infinity) minAccuracy = 0;

  return {
    minAttempts,
    minAccuracy,
    completedCount,
    totalCount: formulas.length,
    targetAttempts: tierInfo.minAttempts,
    targetAccuracy: tierInfo.minAccuracy,
    op: tierInfo.op
  };
}

/**
 * 評估成就並寫入儲存，回傳本輪「初次達成」的成就清單
 */
export function evaluateAndUnlockAchievements(targetLevelId = null, targetLevelMult = null) {
  const currentUnlocked = getUnlockedAchievements();
  const newlyUnlocked = [];

  let targets = levelsData;
  if (targetLevelId && targetLevelMult) {
    targets = [{ id: targetLevelId, multiplier: targetLevelMult }];
  }

  targets.forEach(lvl => {
    for (let t = 0; t < ACHIEVEMENT_TIERS.length; t++) {
      const key = `${lvl.id}_${t}`;
      const isAlreadyUnlocked = Boolean(currentUnlocked[key]);
      const meetsCriteria = checkTierCriteria(lvl.multiplier, t);

      if (meetsCriteria && !isAlreadyUnlocked) {
        const timestamp = Date.now();
        currentUnlocked[key] = timestamp;
        newlyUnlocked.push({
          levelId: lvl.id,
          levelMult: lvl.multiplier,
          tier: t,
          tierInfo: ACHIEVEMENT_TIERS[t],
          key,
          timestamp
        });
      }
    }
  });

  if (newlyUnlocked.length > 0) {
    saveUnlockedAchievements(currentUnlocked);
  }

  return { currentUnlocked, newlyUnlocked };
}
