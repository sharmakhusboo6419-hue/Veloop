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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white mb-0 flex items-center gap-2">
          <Trophy className="text-amber-300" size={20} /> Achievements & Badges
        </h2>
        <span className="text-xs text-slate-300 font-mono">
          {achievements.filter(a => a.isUnlocked).length} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((ach, idx) => (
          <div key={idx} className="">
            <div className={styles.achItem}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-3 border ${ach.isUnlocked ? 'bg-warning bg-opacity-10 text-amber-300 border-warning border-opacity-25' : 'bg-secondary bg-opacity-25 text-slate-300 border-secondary'}`}>
                    <Award size={20} />
                  </div>
                  {ach.isUnlocked ? (
                    <span className="badge bg-success bg-opacity-10 text-emerald-300 border border-success border-opacity-25 text-xs flex items-center gap-1">
                      <CheckCircle size={12} /> Unlocked
                    </span>
                  ) : (
                    <span className="badge bg-secondary bg-opacity-25 text-slate-300 border border-secondary text-xs flex items-center gap-1">
                      <Lock size={12} /> Locked
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{ach.title}</h3>
                <p className="text-xs text-slate-300 mb-3">{ach.description}</p>
              </div>

              <div className="pt-3 border-top border-secondary border-opacity-25 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 font-semibold">+{formatNumber(ach.xpReward)} XP</span>
                <span className="text-slate-300">{ach.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
