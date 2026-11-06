import React from 'react';
import { Award, CheckCircle2, Copy } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/helpers';
import styles from './ProfileHero.module.css';

interface ProfileHeroProps {
  user: any;
  levelData: any;
  onCopyToast: (msg: string) => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ user, levelData, onCopyToast }) => {
  const initials = user?.username
    ? user.username.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'AV';

  return (
    <section className={styles.heroCard}>
      <div className={styles.heroGrid}>
        <div className={styles.identityBlock}>
          <div className={styles.avatar}>
            {initials}
          </div>

          <div className={styles.identityCopy}>
            <div className={styles.metaRow}>
              <span className={styles.statusBadge}>
                <CheckCircle2 size={14} /> {user?.status || 'Active'}
              </span>
              <span className={styles.userId}>ID: {user?.id?.substring(0, 8)}...</span>
              <button
                onClick={() => {
                  copyToClipboard(user?.id || '');
                  onCopyToast('User ID copied to clipboard!');
                }}
                className={styles.copyButton}
                title="Copy User ID"
              >
                <Copy size={14} />
              </button>
            </div>

            <h1 className={styles.title}>
              Welcome back, {user?.username || 'Explorer'}!
            </h1>
            <p className={styles.subtitle}>
              {user?.email} · Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className={styles.levelBox}>
          <div className={styles.levelHeading}>
            <span className={styles.levelName}>
              <Award size={16} /> Level 0{levelData?.currentLevel || 1} <span className={styles.levelDivider}>/</span> {levelData?.levelName || 'Novice'}
            </span>
            <span className={styles.xpCount}>
              {formatNumber(levelData?.currentXp)} / {formatNumber(levelData?.requiredXp)} XP
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={levelData?.progressPercent || 25}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: `${levelData?.progressPercent || 25}%` }}
            ></div>
          </div>
          <div className={styles.remainingXp}>
            {formatNumber(levelData?.remainingXp)} XP to next level
          </div>
        </div>
      </div>
    </section>
  );
};
