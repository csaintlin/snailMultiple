import React from 'react';

export default function ResultScreen({ result, onBack }) {
    const { victory, level, levelMult, score, hp, formulaStats, cumulativeKills } = result;

    // Sort formulas by the multiplier number (e.g. "2 x 5" sorted by 5)
    const sortedFormulas = Object.entries(formulaStats)
        .sort((a, b) => {
            const numA = parseInt(a[0].split(' x ')[0]);
            const numB = parseInt(b[0].split(' x ')[0]);
            return numA - numB;
        });

    return (
        <div className="screen-container" style={{ justifyContent: 'flex-start', paddingTop: '2rem', overflow: 'auto' }}>
            {/* Header banner */}
            <div className="glass-panel" style={{
                padding: '2rem 3rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                background: victory
                    ? 'linear-gradient(135deg, rgba(78,204,163,0.2), rgba(78,204,163,0.05))'
                    : 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,107,107,0.05))',
                border: `1px solid ${victory ? 'rgba(78,204,163,0.3)' : 'rgba(255,107,107,0.3)'}`
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                    {victory ? '🎉' : '💀'}
                </div>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.5rem',
                    background: victory
                        ? 'linear-gradient(45deg, #4ecca3, #e2f1f8)'
                        : 'linear-gradient(45deg, #ff6b6b, #ffa07a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {victory ? '通關成功！' : '關卡失敗'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Stage {level} — 乘數 x{levelMult}
                </p>
            </div>

            {/* Score summary */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div className="glass-panel" style={{ padding: '1rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>得分</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'gold' }}>⭐ {score}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>剩餘 HP</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: hp > 0 ? '#4ecca3' : '#ff6b6b' }}>❤️ {hp}/10</div>
                </div>
                {victory && result.earnedCoins !== undefined && (
                    <div className="glass-panel" style={{ padding: '1rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>獲得金幣</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'gold' }}>🪙 +{result.earnedCoins}</div>
                    </div>
                )}
            </div>

            {/* Formula stats table */}
            {sortedFormulas.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.5rem', width: '90%', maxWidth: '600px', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', textAlign: 'center' }}>📊 算式統計</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 'bold' }}>算式</div>
                        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>本次準確率</div>
                        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>累計消滅</div>
                    </div>
                    {sortedFormulas.map(([formula, stats]) => {
                        const total = stats.successes + stats.failures;
                        const accuracy = total > 0 ? Math.round((stats.successes / total) * 100) : 0;
                        const cumKills = cumulativeKills[formula] || 0;
                        const accColor = accuracy >= 80 ? '#4ecca3' : accuracy >= 50 ? 'gold' : '#ff6b6b';

                        return (
                            <div key={formula} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '0.5rem',
                                padding: '0.6rem 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                alignItems: 'center'
                            }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{formula}</div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ color: accColor, fontWeight: 'bold', fontSize: '1.1rem' }}>{accuracy}%</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                        ({stats.successes}成功 / {stats.failures}失敗)
                                    </span>
                                </div>
                                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--secondary)' }}>
                                    {cumKills} 次
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Back button */}
            <button
                className="btn-primary"
                style={{ fontSize: '1.3rem', padding: '14px 40px', marginBottom: '2rem' }}
                onClick={onBack}
            >
                返回選關
            </button>
        </div>
    );
}
