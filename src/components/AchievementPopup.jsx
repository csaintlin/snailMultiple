import React, { useEffect, useState } from 'react';
import MedalIcon from './MedalIcon';

export default function AchievementPopup({ achievements = [], onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const currentItem = achievements[currentIndex];

    useEffect(() => {
        if (!achievements || achievements.length === 0) return;

        // 每張成就彈窗展示 3 秒 (3000ms)
        const timer = setTimeout(() => {
            if (currentIndex < achievements.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setIsVisible(false);
                if (onClose) onClose();
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [currentIndex, achievements, onClose]);

    if (!achievements || achievements.length === 0 || !currentItem || !isVisible) {
        return null;
    }

    const { levelId, tier, tierInfo } = currentItem;

    const tierBadgeColors = {
        0: 'linear-gradient(135deg, #cd7f32, #8c5827)',
        1: 'linear-gradient(135deg, #e0e0e0, #9e9e9e)',
        2: 'linear-gradient(135deg, #ffd700, #ffaa00)',
        3: 'linear-gradient(135deg, #00d2ff, #3a7bd5)'
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={() => {
                if (currentIndex < achievements.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setIsVisible(false);
                    if (onClose) onClose();
                }
            }}
        >
            <div
                className="glass-panel"
                style={{
                    padding: '2rem 3rem',
                    borderRadius: '24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    maxWidth: '90vw',
                    width: '380px',
                    margin: 'auto',
                    background: 'linear-gradient(145deg, rgba(30, 40, 60, 0.95), rgba(15, 20, 35, 0.95))',
                    border: '2px solid rgba(255, 215, 0, 0.6)',
                    boxShadow: '0 0 40px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.15)',
                    transform: 'scale(1)',
                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                <div style={{ fontSize: '1.2rem', color: '#ffd700', letterSpacing: '2px', fontWeight: 'bold' }}>
                    🎉 解鎖新成就！ 🎉
                </div>

                <div style={{ position: 'relative', margin: '0.8rem 0' }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)',
                            animation: 'pulseGlow 1.5s infinite alternate'
                        }}
                    />
                    <MedalIcon
                        level={levelId}
                        tier={tier}
                        isUnlocked={true}
                        size={110}
                        style={{ transform: 'scale(1.1)' }}
                    />
                </div>

                <div>
                    <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.8rem', color: '#ffffff' }}>
                        Stage {levelId}
                    </h2>
                    <div
                        style={{
                            display: 'inline-block',
                            padding: '6px 18px',
                            borderRadius: '20px',
                            background: tierBadgeColors[tier] || tierBadgeColors[0],
                            color: tier === 1 || tier === 2 ? '#1a1a2e' : '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                        }}
                    >
                        {tierInfo.name} 獎牌
                    </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                    點擊任意處或等待 3 秒自動關閉
                </div>
            </div>
        </div>
    );
}
