import React, { useState, useMemo } from 'react';
import levelsData from '../config/levels.json';
import MedalIcon from './MedalIcon';
import {
    getUnlockedAchievements,
    ACHIEVEMENT_TIERS,
    getTierProgress
} from '../utils/achievementStorage';

export default function AchievementScreen({ coins, onBack }) {
    const [unlockedMap] = useState(() => getUnlockedAchievements());

    // 計算總解鎖成就數 (總共 12 關 * 4 級 = 48)
    const totalUnlockedCount = useMemo(() => {
        return Object.keys(unlockedMap).length;
    }, [unlockedMap]);

    return (
        <div className="screen-container" style={{ justifyContent: 'flex-start', paddingTop: '1.5rem', overflowY: 'auto', minHeight: '100dvh', paddingBottom: '3rem' }}>
            {/* Header */}
            <header style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.2rem', background: 'var(--surface)', borderRadius: '14px', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <button
                    onClick={onBack}
                    className="btn-primary"
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '1rem', padding: '8px 16px' }}
                >
                    ← 返回
                </button>
                <h2 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(45deg, #ffd700, #ffaa00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🏆 成就系統 (獎牌檢視)
                </h2>
                <div style={{ color: 'gold', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span>🪙</span> {coins}
                </div>
            </header>

            {/* Total Achievements Summary Banner */}
            <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>獎牌成就總進度</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        完成 4 級標準（銅 60%/2次 · 銀 70%/15次 · 金 90%/30次 · 鑽 95%/60次）
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffd700' }}>
                        {totalUnlockedCount}
                    </span>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}> / {levelsData.length * 4} 獎牌</span>
                </div>
            </div>

            {/* Stage Achievement Cards */}
            <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {levelsData.map(lvl => {
                    // 找出該 Stage 已解鎖的 Tiers
                    const unlockedTiers = [];
                    for (let t = 0; t < 4; t++) {
                        if (unlockedMap[`${lvl.id}_${t}`]) {
                            unlockedTiers.push(t);
                        }
                    }

                    // 下一個待完成的 Tier (若全達成則為 null)
                    const nextTier = unlockedTiers.length < 4 ? unlockedTiers.length : null;
                    const nextProgress = nextTier !== null ? getTierProgress(lvl.multiplier, nextTier) : null;

                    return (
                        <div
                            key={lvl.id}
                            className="glass-panel"
                            style={{
                                padding: '1.2rem 1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                borderRadius: '16px',
                                border: '1px solid var(--border)'
                            }}
                        >
                            {/* Card Top Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.6rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    🎯 Stage {lvl.id} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(乘數 x{lvl.multiplier})</span>
                                </h3>
                                <span style={{ fontSize: '0.9rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', color: unlockedTiers.length === 4 ? '#ffd700' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                    {unlockedTiers.length === 4 ? '👑 全成就通關' : `${unlockedTiers.length} / 4 已達成`}
                                </span>
                            </div>

                            {/* Medals Row */}
                            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* 1. 已達成的成就獎牌 (全彩) */}
                                {unlockedTiers.map(t => {
                                    const tierInfo = ACHIEVEMENT_TIERS[t];
                                    return (
                                        <div
                                            key={`unlocked_${t}`}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                padding: '0.6rem 0.8rem',
                                                background: 'rgba(255, 215, 0, 0.06)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255, 215, 0, 0.25)',
                                                minWidth: '95px'
                                            }}
                                        >
                                            <MedalIcon level={lvl.id} tier={t} isUnlocked={true} size={64} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffd700' }}>
                                                {tierInfo.name}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#4ecca3', fontWeight: 'bold' }}>
                                                ✓ 已達成
                                            </span>
                                        </div>
                                    );
                                })}

                                {/* 2. 下一個待完成的成就獎牌 (灰階, 僅顯示一個) */}
                                {nextTier !== null && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            padding: '0.6rem 0.8rem',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            borderRadius: '12px',
                                            border: '1px dashed rgba(255, 255, 255, 0.15)',
                                            minWidth: '150px'
                                        }}
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <MedalIcon level={lvl.id} tier={nextTier} isUnlocked={false} size={64} />
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    fontSize: '0.65rem',
                                                    background: '#1a1a2e',
                                                    color: 'var(--text-muted)',
                                                    padding: '2px 5px',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--border)'
                                                }}
                                            >
                                                待完成
                                            </span>
                                        </div>

                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                                            {ACHIEVEMENT_TIERS[nextTier].name} (下一步)
                                        </span>

                                        {nextProgress && (
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span>
                                                    回答: <b>{nextProgress.minAttempts}</b>/{nextProgress.targetAttempts} 次
                                                </span>
                                                <span>
                                                    正確率: <b>{nextProgress.minAccuracy}%</b>/{nextProgress.op}{nextProgress.targetAccuracy}%
                                                </span>
                                                <span style={{ color: nextProgress.completedCount === 10 ? '#4ecca3' : '#f1c40f', fontSize: '0.68rem', marginTop: '2px' }}>
                                                    {nextProgress.completedCount}/10 題符合
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
