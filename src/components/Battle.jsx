import React, { useState, useEffect, useRef, useCallback } from 'react';
import enemiesData from '../config/enemies.json';
import weaponsData from '../config/weapons.json';
import levelsData from '../config/levels.json';
import { getFormulaHistory, recordAnswer, addCumulativeKills } from '../utils/statsStorage';

export default function Battle({ level, equippedWeapon, onBattleEnd }) {
    const [hp, setHp] = useState(10);
    const [enemies, setEnemies] = useState([]);
    const [bullets, setBullets] = useState([]);
    const [timeLeft, setTimeLeft] = useState(45);
    const [mathInput, setMathInput] = useState("");
    const [score, setScore] = useState(0);

    // Use refs to hold the authoritative game state for the game loop
    const enemiesRef = useRef([]);
    const bulletsRef = useRef([]);
    const hpRef = useRef(10);
    const timeLeftRef = useRef(45);
    const gameOverRef = useRef(false);
    const scoreRef = useRef(0);

    // Formula accuracy tracking for this round
    // Key = formula string (e.g. "2 x 5"), Value = { successes, failures, kills }
    const formulaStatsRef = useRef({});

    // History 追蹤 (儲存最後 20 次 1/0)
    const historyRef = useRef({});
    // 此場各題目的出現次數記錄
    const formulaAppearancesRef = useRef({});
    // 距離上次大型怪生成的 ticks (每次 1.5s)
    const ticksSinceLastLargeRef = useRef(0);

    useEffect(() => {
        // Init history from statsStorage
        historyRef.current = getFormulaHistory();
    }, []);

    const levelMult = levelsData.find(l => l.id === level)?.multiplier || 1;
    const weapon = weaponsData.find(w => w.id === equippedWeapon);

    const syncState = useCallback(() => {
        setEnemies([...enemiesRef.current]);
        setBullets([...bulletsRef.current]);
    }, []);

    // Helper: end the game with result data
    const endGame = useCallback((victory) => {
        if (gameOverRef.current) return;
        gameOverRef.current = true;

        // Merge this round's kills into cumulative kills via statsStorage
        const roundStats = formulaStatsRef.current;
        const killsMap = {};
        Object.entries(roundStats).forEach(([formula, stats]) => {
            if (stats.kills > 0) {
                killsMap[formula] = stats.kills;
            }
        });
        const stored = addCumulativeKills(killsMap);

        // Build result data
        const resultData = {
            victory,
            level,
            levelMult,
            score: scoreRef.current,
            hp: hpRef.current,
            formulaStats: { ...roundStats },
            cumulativeKills: { ...stored }
        };

        setTimeout(() => onBattleEnd(resultData), 500);
    }, [level, levelMult, onBattleEnd]);

    // Main game loop: movement + collision
    useEffect(() => {
        let lastTime = performance.now();
        let animationFrameId;

        const loop = (time) => {
            if (gameOverRef.current) return;
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            // Move enemies left
            enemiesRef.current = enemiesRef.current.map(e => ({
                ...e,
                x: e.x - (100 / e.speed) * dt
            }));

            // Move bullets right, remove off-screen
            bulletsRef.current = bulletsRef.current
                .map(b => ({ ...b, x: b.x + 80 * dt }))
                .filter(b => b.x < 110);

            // --- Collision detection ---
            let damage = 0;

            // 1. Enemy reaches snail (x <= 5%)
            enemiesRef.current = enemiesRef.current.filter(e => {
                if (e.x <= 5) {
                    damage += e.type === 'small' ? enemiesData.small.atk : enemiesData.large.atk;
                    return false;
                }
                return true;
            });

            if (damage > 0) {
                hpRef.current = Math.max(0, hpRef.current - damage);
                setHp(hpRef.current);
                if (hpRef.current <= 0) {
                    endGame(false);
                    return;
                }
            }

            // 2. Bullets hit the FIRST enemy they contact (nearest by X)
            const hitBulletIds = new Set();
            const enemyDamageMap = new Map();

            bulletsRef.current.forEach(b => {
                if (hitBulletIds.has(b.id)) return;
                let nearestEnemy = null;
                let nearestX = Infinity;
                enemiesRef.current.forEach(e => {
                    if (Math.abs(e.x - b.x) < 3.5) {
                        if (e.x < nearestX) {
                            nearestX = e.x;
                            nearestEnemy = e;
                        }
                    }
                });
                if (nearestEnemy) {
                    hitBulletIds.add(b.id);
                    if (nearestEnemy.type === 'small') {
                        const prev = enemyDamageMap.get(nearestEnemy.id) || 0;
                        enemyDamageMap.set(nearestEnemy.id, prev + weapon.attack);
                    }
                }
            });

            enemiesRef.current = enemiesRef.current.map(e => {
                const dmg = enemyDamageMap.get(e.id);
                return dmg ? { ...e, hp: e.hp - dmg } : e;
            }).filter(e => e.hp > 0);

            bulletsRef.current = bulletsRef.current.filter(b => !hitBulletIds.has(b.id));

            // 3. Check victory (timer ended + board clear)
            if (timeLeftRef.current <= 0 && !gameOverRef.current) {
                endGame(true);
                return;
            }

            syncState();
            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const countdown = setInterval(() => {
            timeLeftRef.current -= 1;
            setTimeLeft(t => t - 1);
        }, 1000);
        return () => clearInterval(countdown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft <= 0]);

    // Enemy spawner
    useEffect(() => {
        if (timeLeft <= 0) return;
        const spawnTimer = setInterval(() => {
            ticksSinceLastLargeRef.current += 1;
            
            // 遊戲結束前 3 秒不再生成大怪，以免題目來不及被處理就進入統計
            const isNearEnd = timeLeftRef.current <= 3;
            const forceLarge = !isNearEnd && ticksSinceLastLargeRef.current >= 4; // 保底 6 秒 (4 * 1.5s)
            
            // 最少間隔 3 秒 (2 * 1.5s)，因此若 ticks < 2 強制不能出大怪
            const canSpawnLarge = !isNearEnd && ticksSinceLastLargeRef.current >= 2;
            const isLarge = !isNearEnd && (forceLarge || (canSpawnLarge && Math.random() <= 0.7));

            if (!isLarge) {
                const newEnemy = {
                    id: Date.now() + Math.random(),
                    type: 'small',
                    hp: enemiesData.small.baseHp,
                    maxHp: enemiesData.small.baseHp,
                    x: 100,
                    y: 70,
                    speed: enemiesData.small.speed
                };
                enemiesRef.current = [...enemiesRef.current, newEnemy];
            } else {
                ticksSinceLastLargeRef.current = 0; // 重置保底計數

                // 準備計算題目條件
                const allLevelFormulas = Array.from({length: 10}, (_, i) => ({
                    a: i + 1,
                    formula: `${levelMult} x ${i + 1}`
                }));

                let maxAcc = -Infinity;
                let minAcc = Infinity;
                let allReliable = true;

                const formulaStats = allLevelFormulas.map(item => {
                    const hist = historyRef.current[item.formula] || [];
                    const reliable = hist.length >= 10;
                    if (!reliable) allReliable = false;
                    const acc = reliable ? hist.reduce((sum, val) => sum + val, 0) / hist.length : 0;
                    if (reliable) {
                        if (acc > maxAcc) maxAcc = acc;
                        if (acc < minAcc) minAcc = acc;
                    }
                    return { ...item, reliable, acc };
                });

                const gap = (maxAcc !== -Infinity && minAcc !== Infinity) ? (maxAcc - minAcc) : Infinity;
                const ignoreRule4 = allReliable && gap <= 0.3;

                let availableFormulas = formulaStats.filter(item => {
                    let limit = 3;
                    if (!ignoreRule4 && item.reliable) {
                        if (item.acc > 0.9) limit = 1;
                        else if (item.acc < 0.5) limit = 5;
                    }
                    const appearances = formulaAppearancesRef.current[item.formula] || 0;
                    return appearances < limit;
                });

                if (availableFormulas.length === 0) {
                    // 若所有可用題目皆耗盡額度，將所有題目額度重置
                    formulaAppearancesRef.current = {};
                    availableFormulas = formulaStats;
                }

                const picked = availableFormulas[Math.floor(Math.random() * availableFormulas.length)];
                formulaAppearancesRef.current[picked.formula] = (formulaAppearancesRef.current[picked.formula] || 0) + 1;

                const a = picked.a;
                const formula = picked.formula;
                const newEnemy = {
                    id: Date.now() + Math.random(),
                    type: 'large',
                    hp: enemiesData.large.baseHp,
                    maxHp: enemiesData.large.baseHp,
                    x: 100,
                    y: 70,
                    speed: enemiesData.large.speed,
                    mathProblem: formula,
                    answer: a * levelMult
                };
                enemiesRef.current = [...enemiesRef.current, newEnemy];

                // Initialize formula stats if needed
                if (!formulaStatsRef.current[formula]) {
                    formulaStatsRef.current[formula] = { successes: 0, failures: 0, kills: 0 };
                }
            }
        }, 1500);
        return () => clearInterval(spawnTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft <= 0, levelMult]);

    // Auto-fire
    useEffect(() => {
        if (timeLeft <= 0) return;
        const fireInterval = setInterval(() => {
            const hasEnemy = enemiesRef.current.length > 0;
            if (hasEnemy) {
                bulletsRef.current = [...bulletsRef.current, { id: Date.now() + Math.random(), x: 10, y: 70 }];
            }
        }, weapon.fireRate);
        return () => clearInterval(fireInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weapon.fireRate, timeLeft <= 0]);

    // Answers are the multiples of levelMult (1×mult … 10×mult)
    const answerOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * levelMult);

    // Math numpad — clicking an answer directly kills the matching large enemy
    const handleNumpad = (answer) => {
        if (gameOverRef.current) return;

        setMathInput(answer.toString());
        setTimeout(() => setMathInput(""), 300);

        // Get all large enemies currently on screen
        const largeEnemiesOnScreen = enemiesRef.current.filter(e => e.type === 'large');
        if (largeEnemiesOnScreen.length === 0) return;

        // Check if answer matches any on-screen large enemy
        const matchingEnemy = largeEnemiesOnScreen.find(e => e.answer === answer);

        if (matchingEnemy) {
            // SUCCESS: matched formula gets +1 success, +1 kill
            const formula = matchingEnemy.mathProblem;
            if (!formulaStatsRef.current[formula]) {
                formulaStatsRef.current[formula] = { successes: 0, failures: 0, kills: 0 };
            }
            formulaStatsRef.current[formula].successes += 1;
            formulaStatsRef.current[formula].kills += 1;

            recordAnswer(formula, true, levelMult);
            historyRef.current = getFormulaHistory();

            // Remove the enemy, score +1
            scoreRef.current += 1;
            setScore(scoreRef.current);
            enemiesRef.current = enemiesRef.current.filter(e => e.id !== matchingEnemy.id);
        } else {
            // FAILURE: ALL on-screen large enemy formulas get +1 failure
            const uniqueFormulas = new Set(largeEnemiesOnScreen.map(e => e.mathProblem));
            uniqueFormulas.forEach(formula => {
                if (!formulaStatsRef.current[formula]) {
                    formulaStatsRef.current[formula] = { successes: 0, failures: 0, kills: 0 };
                }
                formulaStatsRef.current[formula].failures += 1;

                recordAnswer(formula, false, levelMult);
            });
            historyRef.current = getFormulaHistory();
        }
    };

    return (
        <div className="screen-container" style={{ position: 'relative', overflow: 'hidden' }}>
            <header style={{ position: 'absolute', top: 0, width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', color: '#ff6b6b', fontWeight: 'bold' }}>❤️ HP: {hp}/10</div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', color: 'gold', fontWeight: 'bold' }}>⭐ {score}</div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', color: '#4ecca3', fontWeight: 'bold' }}>⏱️ {Math.max(0, timeLeft)}s</div>
            </header>

            {/* Game Field */}
            <div style={{ width: '100%', height: 'calc(100dvh - 280px)', position: 'relative', marginTop: '60px' }}>
                {/* Ground line */}
                <div style={{ position: 'absolute', bottom: '18%', left: 0, width: '100%', height: '2px', background: 'rgba(78,204,163,0.15)' }} />

                {/* Snail */}
                <div style={{ position: 'absolute', left: '2%', top: '70%', transform: 'translateY(-50%)', zIndex: 5 }}>
                    <div className="sprite-snail" style={{ '--sprite-size': '160px', backgroundImage: `url(${new URL(`../assets/${weapon.imagePath}`, import.meta.url).href})` }}></div>
                </div>

                {/* Bullets */}
                {bullets.map(b => {
                    const hasBulletImg = weapon.bulletImage && weapon.bulletImage.trim() !== "";
                    return (
                        <div key={b.id} style={{ 
                            position: 'absolute', 
                            left: `${b.x}%`, 
                            top: '70%', 
                            transform: 'translate(-50%, -50%)',
                            width: hasBulletImg ? '20px' : '15px', 
                            height: hasBulletImg ? '20px' : '6px', 
                            background: hasBulletImg ? `url(${new URL(`../assets/${weapon.bulletImage}`, import.meta.url).href}) center/contain no-repeat` : 'yellow', 
                            borderRadius: hasBulletImg ? '0' : '3px', 
                            filter: hasBulletImg ? 'none' : 'drop-shadow(0 0 5px yellow)'
                        }} />
                    );
                })}

                {/* Enemies */}
                {enemies.map(e => (
                    <div key={e.id} style={{
                        position: 'absolute',
                        left: `${e.x}%`,
                        top: `${e.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: e.type === 'large' ? '4rem' : '2.5rem',
                        animation: 'wobble 1s infinite alternate'
                    }}>
                        {e.type === 'large' ? '🪲' : '🐜'}
                        {e.type === 'small' && (
                            <div style={{ position: 'absolute', top: '-10px', left: 0, width: '100%', background: 'rgba(255,0,0,0.4)', height: '4px', borderRadius: '2px' }}>
                                <div style={{ width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%`, background: '#4ecca3', height: '100%', borderRadius: '2px', transition: 'width 0.1s' }} />
                            </div>
                        )}
                        {e.type === 'large' && (
                            <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: 'var(--surface)', padding: '5px 10px', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', border: '2px solid yellow', color: 'white' }}>
                                {e.mathProblem}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Math Numpad UI */}
            <div className="glass-panel" style={{ position: 'absolute', bottom: '20px', width: '90%', maxWidth: '700px', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', marginRight: '1rem', fontWeight: 'bold', minWidth: '80px' }}>
                    <span style={{ color: 'var(--accent)' }}>{mathInput || "_"}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {answerOptions.map(n => (
                        <button key={n} className="btn-primary" style={{ fontSize: '1.2rem', padding: '10px 8px' }} onClick={() => handleNumpad(n)}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
