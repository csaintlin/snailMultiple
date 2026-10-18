import React from 'react';

export default function StartScreen({ onStart }) {
    return (
        <div className="screen-container" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="glass-panel" style={{ padding: '4rem 3rem', textAlign: 'center', animation: 'pulse 3s infinite', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div className="sprite-snail" style={{ '--sprite-size': '100px' }}></div>
                </div>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Snail Defender</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>Defend your shell with the power of Math!</p>
                <button className="btn-primary" onClick={onStart} style={{ fontSize: '1.5rem', padding: '15px 40px' }}>
                    PLAY NOW
                </button>
            </div>

            {/* Decorative background blocks */}
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'var(--primary-glow)', filter: 'blur(50px)', zIndex: 1 }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(60px)', zIndex: 1 }}></div>
        </div>
    );
}
