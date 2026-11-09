import React from 'react';
import { Coins, Sparkles, Gem, Award, ArrowUpRight } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';
import styles from './RewardAssets.module.css';

interface RewardAssetsProps {
  wallet: {
    veBalance: number;
    sveBalance: number;
    gemsBalance: number;
    tokensBalance: number;
    xpBalance: number;
  };
  onActionClick: (action: string) => void;
}

export const RewardAssets: React.FC<RewardAssetsProps> = ({ wallet, onActionClick }) => {
  const assets = [
    {
      name: 'VEs (VELoop Earnings)',
      balance: wallet.veBalance,
      symbol: 'VE',
      description: 'Primary platform reward currency.',
      icon: <Coins size={24} />,
      tone: styles.amber
    },
    {
      name: 'SVEs (Silver Vault Earnings)',
      balance: wallet.sveBalance,
      symbol: 'SVE',
      description: 'Secured vault earnings accrued.',
      icon: <Sparkles size={24} />,
      tone: styles.slate
    },
    {
      name: 'Gems',
      balance: wallet.gemsBalance,
      symbol: 'GEMS',
      description: 'Rare utility gems for exclusive redemptions.',
      icon: <Gem size={24} />,
      tone: styles.cyan
    },
    {
      name: 'Platform Tokens',
      balance: wallet.tokensBalance,
      symbol: 'TOKENS',
      description: 'Governance and ecosystem liquidity tokens.',
      icon: <Coins size={24} />,
      tone: styles.emerald
    },
    {
      name: 'Experience Points (XP)',
      balance: wallet.xpBalance,
      symbol: 'XP',
      description: 'Progression metric for level advancement.',
      icon: <Award size={24} />,
      tone: styles.blue
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Portfolio snapshot</p>
          <h2 className="m-0 text-lg font-bold tracking-tight text-white">Your reward assets</h2>
        </div>
        <button
          onClick={() => onActionClick('withdraw')}
          className="flex w-fit items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
        >
          Withdraw assets <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset, idx) => (
          <div key={idx}>
            <div className={styles.assetCard}>
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className={`${styles.iconBox} ${asset.tone}`}>
                    {asset.icon}
                  </div>
                  <span className={`${styles.badge} ${asset.tone}`}>
                    {asset.symbol}
                  </span>
                </div>
                <h3 className="mb-1 text-xs font-semibold text-slate-400">{asset.name}</h3>
                <div className="mb-2 font-mono text-3xl font-bold tracking-tight text-white">
                  {formatNumber(asset.balance)}
                </div>
              </div>
              <p className="m-0 border-t border-slate-700/70 pt-3 text-xs leading-5 text-slate-500">
                {asset.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
