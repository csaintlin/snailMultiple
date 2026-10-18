import React from 'react';
import archievementImg from '../assets/archievement.png';

/**
 * MedalIcon Component
 * 依據 Stage (1~12) 與 Tier (0=銅, 1=銀, 2=金, 3=鑽) 切割 12x4 Sprite 圖檔
 */
export default function MedalIcon({ level = 1, tier = 0, isUnlocked = true, size = 64, style = {}, className = '' }) {
    const colIndex = Math.max(0, Math.min(11, level - 1));
    const rowIndex = Math.max(0, Math.min(3, tier));

    // 12 欄 (0~11) 與 4 列 (0~3)
    const posX = (colIndex / 11) * 100;
    const posY = (rowIndex / 3) * 100;

    const sizePx = typeof size === 'number' ? `${size}px` : size;

    return (
        <div
            className={`medal-icon ${className}`}
            style={{
                width: sizePx,
                height: sizePx,
                backgroundImage: `url(${archievementImg})`,
                backgroundSize: '1200% 400%',
                backgroundPosition: `${posX}% ${posY}%`,
                backgroundRepeat: 'no-repeat',
                filter: isUnlocked
                    ? 'drop-shadow(0 4px 12px rgba(255, 215, 0, 0.4))'
                    : 'grayscale(100%) opacity(0.45)',
                transition: 'transform 0.25s ease, filter 0.25s ease',
                flexShrink: 0,
                borderRadius: '50%',
                ...style
            }}
        />
    );
}
