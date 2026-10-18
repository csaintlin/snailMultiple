import React from 'react';
import levelsData from '../config/levels.json';

export default function LevelSelect({ coins, onSelectLevel, onGoShop, onGoStats, onGoAchievements }) {
    return (
        <div className="screen-container" style={{ justifyContent: 'flex-start', paddingTop: '1.5rem', overflowY: 'auto', minHeight: '100dvh', paddingBottom: '3rem' }}>
            <header style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1.2rem', background: 'var(--surface)', borderRadius: '12px', marginBottom: '1.2rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Level Select</h2>
                <div style={{ color: 'gold', fontWeight: 'bold', fontSize: '1.2rem' }}>🪙 {coins}</div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', maxWidth: '600px', width: '100%' }}>
                {levelsData.map(lvl => {
                    return (
                        <button
                            key={lvl.id}
                            className="btn-primary glass-panel"
                            style={{
                                padding: '1rem 0.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: '12px',
                                cursor: 'pointer'
                            }}
                            onClick={() => onSelectLevel(lvl.id)}
                        >
                            <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>🎯</div>
                            <div style={{ fontWeight: 'bold' }}>Stage {lvl.id}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Multi: x{lvl.multiplier}</div>
                            <div style={{ fontSize: '0.75rem', color: 'gold', fontWeight: 'bold', marginTop: '2px' }}>🪙 x{lvl.coinMultiplier}</div>
                        </button>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.8rem', width: '100%', maxWidth: '600px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    className="btn-primary"
                    style={{ background: 'var(--accent)', flex: 1, padding: '14px 16px', fontSize: '1.05rem', minWidth: '140px' }}
                    onClick={onGoShop}
                >
                    🛒 商店
                </button>
                <button
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #4ecca3, #38ef7d)', color: '#1a1a2e', flex: 1, padding: '14px 16px', fontSize: '1.05rem', minWidth: '140px' }}
                    onClick={onGoStats}
                >
                    📊 統計
                </button>
                {onGoAchievements && (
                    <button
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#1a1a2e', flex: 1, padding: '14px 16px', fontSize: '1.05rem', minWidth: '140px' }}
                        onClick={onGoAchievements}
                    >
                        🏆 成就
                    </button>
                )}
            </div>
        </div>
    );
}
