import React from 'react';
import { Award, CheckCircle2, Copy, Sparkles, Zap } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/helpers';
import styles from './ProfileHero.module.css';

interface ProfileHeroProps { user: any; levelData: any; onCopyToast: (msg: string) => void; }

export const ProfileHero: React.FC<ProfileHeroProps> = ({ user, levelData, onCopyToast }) => {
  const initials = user?.username ? user.username.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AV';
  const level = levelData?.currentLevel || 1;
  const progress = Math.min(100, Math.max(0, levelData?.progressPercent || 25));
  return <section className={styles.heroCard} aria-label="Member profile overview">
    <div className={styles.orbit} aria-hidden="true" />
    <div className={styles.heroGrid}>
      <div className={styles.identityBlock}>
        <div className={styles.avatarCore} aria-label={`${user?.username || 'Explorer'} avatar`}><span className={styles.avatarGlow} /><span className={styles.avatar}>{initials}</span><span className={styles.onlineDot} title="Active member" /></div>
        <div className={styles.identityCopy}>
          <div className={styles.metaRow}><span className={styles.statusBadge}><CheckCircle2 size={13} /> {user?.status || 'Active member'}</span><span className={styles.memberSince}>REWARD VAULT • EST. {new Date(user?.createdAt || Date.now()).getFullYear()}</span></div>
          <h1 className={styles.title}>Welcome back, <span>{user?.username || 'Explorer'}</span></h1>
          <p className={styles.subtitle}>{user?.email || 'Your reward journey is ready'} <span>•</span> Your next level is within reach.</p>
          <button onClick={() => { copyToClipboard(user?.id || ''); onCopyToast('User ID copied to clipboard!'); }} className={styles.idButton} title="Copy User ID"><Copy size={13} /> MEMBER ID <b>{user?.id?.substring(0, 10) || 'VELOOP-AV'}...</b></button>
        </div>
      </div>
      <div className={styles.levelZone}>
        <div className={styles.levelMedallion} style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><div className={styles.medallionInner}><Award size={20} /><strong>{String(level).padStart(2, '0')}</strong><small>LEVEL</small></div></div>
        <div className={styles.levelCopy}><div className={styles.levelKicker}><Sparkles size={14} /> CURRENT RANK</div><h2>{levelData?.levelName || 'Novice'} <span>• LVL {level}</span></h2><div className={styles.xpLine}><span><Zap size={13} /> {formatNumber(levelData?.currentXp)} XP</span><b>{progress}%</b></div><div className={styles.progressTrack}><span className={styles.progressBar} style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} /></div><p><strong>{formatNumber(levelData?.remainingXp)}</strong> XP until Level {level + 1}</p></div>
      </div>
    </div>
  </section>;
};
