import React from 'react';
import { Trophy, CheckCircle, Lock, Award } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';
import styles from './AchievementCard.module.css';

interface AchievementCardProps {
  achievements: any[];
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievements }) => {
  return (
    <div className={styles.cardBox}>
      <div className="d-flex align-items-center justify-between mb-4">
        <h2 className="h5 fw-bold text-white mb-0 d-flex align-items-center gap-2">
          <Trophy className="text-warning" size={20} /> Achievements & Badges
        </h2>
        <span className="small text-muted font-monospace">
          {achievements.filter(a => a.isUnlocked).length} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="row g-3">
        {achievements.map((ach, idx) => (
          <div key={idx} className="col-md-6 col-lg-4">
            <div className={styles.achItem}>
              <div>
                <div className="d-flex align-items-center justify-between mb-3">
                  <div className={`p-2 rounded-3 border ${ach.isUnlocked ? 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-25' : 'bg-secondary bg-opacity-25 text-muted border-secondary'}`}>
                    <Award size={20} />
                  </div>
                  {ach.isUnlocked ? (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small d-flex align-items-center gap-1">
                      <CheckCircle size={12} /> Unlocked
                    </span>
                  ) : (
                    <span className="badge bg-secondary bg-opacity-25 text-muted border border-secondary small d-flex align-items-center gap-1">
                      <Lock size={12} /> Locked
                    </span>
                  )}
                </div>

                <h3 className="h6 fw-bold text-white mb-1">{ach.title}</h3>
                <p className="small text-muted mb-3">{ach.description}</p>
              </div>

              <div className="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-between small font-monospace">
                <span className="text-warning fw-semibold">+{formatNumber(ach.xpReward)} XP</span>
                <span className="text-muted">{ach.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
