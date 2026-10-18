import React from 'react';
import weaponsData from '../config/weapons.json';

export default function Shop({ coins, setCoins, ownedWeapons, setOwnedWeapons, equippedWeapon, setEquippedWeapon, onBack, onGoAchievements }) {
    const handleBuy = (w) => {
        if (coins >= w.price && !ownedWeapons.includes(w.id)) {
            setCoins(coins - w.price);
            setOwnedWeapons([...ownedWeapons, w.id]);
        }
    };

    return (
        <div className="screen-container" style={{ justifyContent: 'flex-start', paddingTop: '2rem', paddingBottom: '3rem' }}>
            <header style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', marginBottom: '2rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button onClick={onBack} style={{ background: 'transparent', color: 'var(--text-main)', fontSize: '1.1rem' }}>← Back</button>
                    {onGoAchievements && (
                        <button
                            onClick={onGoAchievements}
                            className="btn-primary"
                            style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#1a1a2e', fontSize: '0.9rem', padding: '6px 12px' }}
                        >
                            🏆 成就
                        </button>
                    )}
                </div>
                <h2 style={{ margin: 0 }}>Weapon Shop</h2>
                <div style={{ color: 'gold', fontWeight: 'bold', fontSize: '1.2rem' }}>🪙 {coins}</div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', maxWidth: '800px', width: '100%', paddingBottom: '2rem' }}>
                {weaponsData.map(w => {
                    const isOwned = ownedWeapons.includes(w.id);
                    const isEquipped = equippedWeapon === w.id;
                    const canAfford = coins >= w.price;

                    return (
                        <div key={w.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', height: '64px', marginBottom: '1rem' }}>
                                <div className="sprite-snail" style={{ '--sprite-size': '64px', backgroundImage: `url(${new URL(`../assets/${w.imagePath}`, import.meta.url).href})` }}></div>
                            </div>
                            <h3>{w.name}</h3>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                ATK: {w.attack} | SPD: {w.fireRate}ms
                            </div>

                            <div style={{ width: '100%', marginTop: 'auto' }}>
                                {isEquipped ? (
                                    <button className="btn-disabled" style={{ width: '100%' }} disabled>Equipped</button>
                                ) : isOwned ? (
                                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => setEquippedWeapon(w.id)}>Equip</button>
                                ) : (
                                    <button
                                        className={canAfford ? "btn-primary" : "btn-disabled"}
                                        style={{ width: '100%', background: canAfford ? 'var(--primary)' : '' }}
                                        disabled={!canAfford}
                                        onClick={() => handleBuy(w)}
                                    >
                                        Buy (🪙 {w.price})
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
