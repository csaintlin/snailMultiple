import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import LevelSelect from './components/LevelSelect';
import Shop from './components/Shop';
import Battle from './components/Battle';
import ResultScreen from './components/ResultScreen';
import StatsScreen from './components/StatsScreen';
import AchievementScreen from './components/AchievementScreen';
import AchievementPopup from './components/AchievementPopup';
import {
  getCoins,
  saveCoins,
  getOwnedWeapons,
  saveOwnedWeapons,
  getEquippedWeapon,
  saveEquippedWeapon,
  getUnlockedLevels,
  saveUnlockedLevels
} from './utils/statsStorage';
import { evaluateAndUnlockAchievements } from './utils/achievementStorage';
import levelsData from './config/levels.json';

function App() {
  const [currentScreen, setCurrentScreen] = useState('START');
  const [coins, setCoins] = useState(() => getCoins());
  const [ownedWeapons, setOwnedWeapons] = useState(() => getOwnedWeapons());
  const [equippedWeapon, setEquippedWeapon] = useState(() => getEquippedWeapon());
  const [unlockedLevels, setUnlockedLevels] = useState(() => getUnlockedLevels());
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [battleResult, setBattleResult] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);

  // 當金幣變動時自動同步存入 localStorage
  useEffect(() => {
    saveCoins(coins);
  }, [coins]);

  // 當擁有武器變動時自動同步存入 localStorage
  useEffect(() => {
    saveOwnedWeapons(ownedWeapons);
  }, [ownedWeapons]);

  // 當裝備武器變動時自動同步存入 localStorage
  useEffect(() => {
    saveEquippedWeapon(equippedWeapon);
  }, [equippedWeapon]);

  // 當解鎖關卡變動時自動同步存入 localStorage
  useEffect(() => {
    saveUnlockedLevels(unlockedLevels);
  }, [unlockedLevels]);

  return (
    <div className="app-container">
      {/* 首次達成成就時跳出的 3 秒動畫 PopUp */}
      {newAchievements.length > 0 && (
        <AchievementPopup
          achievements={newAchievements}
          onClose={() => setNewAchievements([])}
        />
      )}

      {currentScreen === 'START' && (
        <StartScreen onStart={() => setCurrentScreen('SELECT')} />
      )}
      {currentScreen === 'SELECT' && (
        <LevelSelect 
          coins={coins}
          unlockedLevels={unlockedLevels}
          onSelectLevel={(level) => {
            setSelectedLevel(level);
            setCurrentScreen('BATTLE');
          }}
          onGoShop={() => setCurrentScreen('SHOP')}
          onGoStats={() => setCurrentScreen('STATS')}
          onGoAchievements={() => setCurrentScreen('ACHIEVEMENTS')}
        />
      )}
      {currentScreen === 'SHOP' && (
        <Shop 
          coins={coins}
          setCoins={setCoins}
          ownedWeapons={ownedWeapons}
          setOwnedWeapons={setOwnedWeapons}
          equippedWeapon={equippedWeapon}
          setEquippedWeapon={setEquippedWeapon}
          onBack={() => setCurrentScreen('SELECT')}
          onGoAchievements={() => setCurrentScreen('ACHIEVEMENTS')}
        />
      )}
      {currentScreen === 'STATS' && (
        <StatsScreen 
          coins={coins}
          onResetAll={() => setCoins(0)}
          onBack={() => setCurrentScreen('SELECT')}
          onGoAchievements={() => setCurrentScreen('ACHIEVEMENTS')}
        />
      )}
      {currentScreen === 'ACHIEVEMENTS' && (
        <AchievementScreen
          coins={coins}
          onBack={() => setCurrentScreen('SELECT')}
        />
      )}
      {currentScreen === 'BATTLE' && (
        <Battle 
          level={selectedLevel}
          equippedWeapon={equippedWeapon}
          onBattleEnd={(resultData) => {
            const currentLvl = levelsData.find(l => l.id === selectedLevel);
            const levelMult = currentLvl?.multiplier || selectedLevel;

            if (resultData.victory) {
              const coinMulti = currentLvl?.coinMultiplier || 1;
              const earnedCoins = Math.round(10 * coinMulti);
              setCoins(c => c + earnedCoins);
              resultData.earnedCoins = earnedCoins;

              if (selectedLevel === unlockedLevels && unlockedLevels < levelsData.length) {
                setUnlockedLevels(l => l + 1);
              }
            }

            // 關卡結束時計算成就是否達成，初次達成後觸發 3 秒動畫 PopUp
            const { newlyUnlocked } = evaluateAndUnlockAchievements(selectedLevel, levelMult);
            if (newlyUnlocked && newlyUnlocked.length > 0) {
              setNewAchievements(newlyUnlocked);
            }

            setBattleResult(resultData);
            setCurrentScreen('RESULT');
          }}
        />
      )}
      {currentScreen === 'RESULT' && battleResult && (
        <ResultScreen
          result={battleResult}
          onBack={() => {
            setBattleResult(null);
            setCurrentScreen('SELECT');
          }}
        />
      )}
    </div>
  );
}

export default App;
