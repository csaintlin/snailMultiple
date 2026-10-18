import React, { useState, useMemo } from 'react';
import levelsData from '../config/levels.json';
import {
    getLevelStats,
    getAvailableDates,
    getDailyStats,
    resetAllStatsAndCoins
} from '../utils/statsStorage';

export default function StatsScreen({ coins, onResetAll, onBack, onGoAchievements }) {
    const [activeTab, setActiveTab] = useState('OVERALL'); // 'OVERALL' | 'DAILY'
    const [refreshKey, setRefreshKey] = useState(0);

    // 取得所有有紀錄的日期，預設選中最近的一天
    const availableDates = useMemo(() => getAvailableDates(), [refreshKey]);
    const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');

    // 取得 1~12 關的總體統計
    const allLevelStats = useMemo(() => {
        return levelsData.map(lvl => getLevelStats(lvl.multiplier));
    }, [refreshKey]);

    // 取得選中日期的詳細作答統計
    const dailyStats = useMemo(() => {
        return getDailyStats(selectedDate || availableDates[0]);
    }, [selectedDate, availableDates, refreshKey]);

    // 處理重設操作
    const handleReset = () => {
        const confirmed = window.confirm('⚠️ 警告：確定要將所有關卡的答題紀錄、歷史數據以及「金幣」全數歸零嗎？\n此動作無法復原！');
        if (confirmed) {
            resetAllStatsAndCoins();
            if (onResetAll) {
                onResetAll();
            }
            setRefreshKey(k => k + 1);
            alert('已成功清空所有答題紀錄與金幣！');
        }
    };

    const getAccColor = (acc) => {
        if (acc === null || acc === undefined) return 'var(--text-muted)';
        if (acc >= 80) return '#4ecca3';
        if (acc >= 50) return '#f1c40f';
        return '#ff6b6b';
    };

    return (
        <div className="screen-container" style={{ justifyContent: 'flex-start', paddingTop: '1.5rem', overflowY: 'auto', minHeight: '100dvh', paddingBottom: '3rem' }}>
            {/* Header */}
            <header style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '14px', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button
                        onClick={onBack}
                        className="btn-primary"
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '1rem', padding: '8px 16px' }}
                    >
                        ← 返回選關
                    </button>
                    {onGoAchievements && (
                        <button
                            onClick={onGoAchievements}
                            className="btn-primary"
                            style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#1a1a2e', fontSize: '0.9rem', padding: '8px 14px' }}
                        >
                            🏆 成就系統
                        </button>
                    )}
                </div>
                <h2 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    📊 關卡答題統計
                </h2>
                <div style={{ color: 'gold', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span>🪙</span> {coins}
                </div>
            </header>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '1rem', maxWidth: '1000px', width: '100%', marginBottom: '1.5rem' }}>
                <button
                    className="btn-primary"
                    onClick={() => setActiveTab('OVERALL')}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        fontSize: '1.1rem',
                        background: activeTab === 'OVERALL' ? 'var(--primary)' : 'var(--surface)',
                        color: activeTab === 'OVERALL' ? '#1a1a2e' : 'var(--text-main)',
                        border: '1px solid var(--border)',
                        boxShadow: activeTab === 'OVERALL' ? '0 0 15px var(--primary-glow)' : 'none'
                    }}
                >
                    📊 總統計結果 (1~{levelsData.length}關)
                </button>
                <button
                    className="btn-primary"
                    onClick={() => setActiveTab('DAILY')}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        fontSize: '1.1rem',
                        background: activeTab === 'DAILY' ? 'var(--primary)' : 'var(--surface)',
                        color: activeTab === 'DAILY' ? '#1a1a2e' : 'var(--text-main)',
                        border: '1px solid var(--border)',
                        boxShadow: activeTab === 'DAILY' ? '0 0 15px var(--primary-glow)' : 'none'
                    }}
                >
                    📅 遊戲日作答統計
                </button>
            </div>

            {/* TAB 1: 總統計結果 (9 張卡片) */}
            {activeTab === 'OVERALL' && (
                <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                    {allLevelStats.map(lvlStat => {
                        const levelAccColor = getAccColor(lvlStat.accuracy);
                        return (
                            <div
                                key={lvlStat.levelMultiplier}
                                className="glass-panel"
                                style={{
                                    padding: '1.2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    background: 'rgba(255, 255, 255, 0.04)'
                                }}
                            >
                                {/* Card Top: Level Info & Overall Stats */}
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--secondary)' }}>
                                            🎯 Stage {lvlStat.levelMultiplier} (乘數 x{lvlStat.levelMultiplier})
                                        </h3>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.3)',
                                            color: levelAccColor,
                                            fontWeight: 'bold',
                                            fontSize: '1rem'
                                        }}>
                                            {lvlStat.accuracy !== null ? `${lvlStat.accuracy}%` : '未作答'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                        <span>總作答: <b style={{ color: 'var(--text-main)' }}>{lvlStat.totalAttempts}</b> 次</span>
                                        <span>累計擊殺: <b style={{ color: '#4ecca3' }}>{lvlStat.totalKills}</b> 隻</span>
                                    </div>
                                </div>

                                {/* Card Bottom: 10 Formulas Breakdown */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
                                    {lvlStat.formulas.map(f => {
                                        const fColor = getAccColor(f.accuracy);
                                        return (
                                            <div
                                                key={f.formula}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    background: 'rgba(255, 255, 255, 0.02)',
                                                    fontSize: '0.88rem'
                                                }}
                                            >
                                                <span style={{ fontWeight: '600', minWidth: '60px' }}>{f.formula}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <span style={{ fontSize: '0.75rem', color: f.reliable ? '#4ecca3' : 'var(--text-muted)' }}>
                                                        {f.attempts}次{f.reliable ? '✓' : ''}
                                                    </span>
                                                    <span style={{ fontWeight: 'bold', color: fColor, minWidth: '42px', textAlign: 'right' }}>
                                                        {f.accuracy !== null ? `${f.accuracy}%` : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TAB 2: 遊戲日作答統計 */}
            {activeTab === 'DAILY' && (
                <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                    {/* Date Selector Banner */}
                    <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>📅 選擇日期：</span>
                            <select
                                value={selectedDate || availableDates[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    background: 'var(--surface-hover)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {availableDates.map(date => (
                                    <option key={date} value={date} style={{ background: '#1b2735', color: '#fff' }}>
                                        {date} {date === availableDates[0] ? '(最新紀錄)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            範圍: 00:00 ~ 23:59 全天作答
                        </div>
                    </div>

                    {/* Day Overview KPIs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>當日總作答</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{dailyStats.total} 題</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>答對題數</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ecca3' }}>{dailyStats.correct} 題</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>答錯題數</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff6b6b' }}>{dailyStats.wrong} 題</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>當日綜合正確率</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getAccColor(dailyStats.accuracy) }}>
                                {dailyStats.total > 0 ? `${dailyStats.accuracy}%` : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Questions Detailed Breakdown */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📝 當日做的題目與結果</h3>
                        {dailyStats.formulaBreakdown.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                本日尚無任何作答紀錄。
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '6px 12px', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                                    <div>題目算式</div>
                                    <div style={{ textAlign: 'center' }}>作答次數</div>
                                    <div style={{ textAlign: 'center' }}>對 / 錯</div>
                                    <div style={{ textAlign: 'right' }}>當日正確率</div>
                                </div>
                                {dailyStats.formulaBreakdown.map(item => {
                                    const itemAccColor = getAccColor(item.accuracy);
                                    return (
                                        <div
                                            key={item.formula}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                                                alignItems: 'center',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.02)',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold' }}>{item.formula}</div>
                                            <div style={{ textAlign: 'center', color: 'var(--text-main)' }}>{item.attempts} 次</div>
                                            <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#4ecca3' }}>{item.correct}</span> / <span style={{ color: '#ff6b6b' }}>{item.wrong}</span>
                                            </div>
                                            <div style={{ textAlign: 'right', fontWeight: 'bold', color: itemAccColor }}>
                                                {item.accuracy}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Actions: Reset Button */}
            <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button
                    onClick={handleReset}
                    className="btn-primary"
                    style={{
                        background: 'rgba(255, 107, 107, 0.15)',
                        border: '1px solid rgba(255, 107, 107, 0.5)',
                        color: '#ff6b6b',
                        boxShadow: '0 0 15px rgba(255, 107, 107, 0.2)',
                        padding: '12px 30px',
                        fontSize: '1rem',
                        borderRadius: '10px'
                    }}
                >
                    🔄 重設所有答題紀錄與金幣 (歸零)
                </button>
            </div>
        </div>
    );
}
