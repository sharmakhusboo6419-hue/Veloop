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
      <div className="d-flex align-items-center justify-between mb-4">
        <h2 className="h5 fw-bold text-white mb-0 d-flex align-items-center gap-2">
          <Award className="text-warning" size={20} /> Level Progression
        </h2>
        <span className="badge font-monospace bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1">
          Level 0{levelData?.currentLevel || 1}
        </span>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className={styles.subBox}>
            <span className="text-muted small d-block mb-1">Current Title</span>
            <span className="fw-bold text-white">{levelData?.levelName || 'Novice'}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className={styles.subBox}>
            <span className="text-muted small d-block mb-1">Accumulated XP</span>
            <span className="fw-bold text-warning font-monospace">{formatNumber(levelData?.currentXp)} XP</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className={styles.subBox}>
            <span className="text-muted small d-block mb-1">Next Milestone</span>
            <span className="fw-bold text-info font-monospace">{formatNumber(levelData?.requiredXp)} XP</span>
          </div>
        </div>
      </div>

      <div>
        <div className="d-flex justify-content-between text-muted small mb-2 font-monospace">
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
