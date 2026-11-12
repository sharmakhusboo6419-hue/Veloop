import React from 'react';
import { Award } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';
import styles from './LevelProgress.module.css';

interface LevelProgressProps {
  levelData: any;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ levelData }) => {
  return (
    <div className={styles.cardBox}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white mb-0 flex items-center gap-2">
          <Award className="text-amber-300" size={20} /> Level Progression
        </h2>
        <span className="badge font-mono bg-warning bg-opacity-10 text-amber-300 border border-warning border-opacity-25 px-3 py-1">
          Level 0{levelData?.currentLevel || 1}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="grid">
          <div className={styles.subBox}>
            <span className="text-slate-300 text-xs d-block mb-1">Current Title</span>
            <span className="font-bold text-white">{levelData?.levelName || 'Novice'}</span>
          </div>
        </div>
        <div className="grid">
          <div className={styles.subBox}>
            <span className="text-slate-300 text-xs d-block mb-1">Accumulated XP</span>
            <span className="font-bold text-amber-300 font-mono">{formatNumber(levelData?.currentXp)} XP</span>
          </div>
        </div>
        <div className="grid">
          <div className={styles.subBox}>
            <span className="text-slate-300 text-xs d-block mb-1">Next Milestone</span>
            <span className="font-bold text-info font-mono">{formatNumber(levelData?.requiredXp)} XP</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-content-between text-slate-300 text-xs mb-2 font-mono">
          <span>Level {levelData?.currentLevel || 1}</span>
          <span>Progress: {levelData?.progressPercent || 25}%</span>
          <span>Level {(levelData?.currentLevel || 1) + 1}</span>
        </div>
        <div className="progress bg-secondary bg-opacity-25" style={{ height: '10px' }}>
          <div
            className="progress-bar bg-warning"
            role="progressbar"
            style={{ width: `${levelData?.progressPercent || 25}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
