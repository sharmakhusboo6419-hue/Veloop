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
      icon: <Coins className="text-warning" size={24} />,
      badgeClass: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'
    },
    {
      name: 'SVEs (Silver Vault Earnings)',
      balance: wallet.sveBalance,
      symbol: 'SVE',
      description: 'Secured vault earnings accrued.',
      icon: <Sparkles className="text-light" size={24} />,
      badgeClass: 'bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50'
    },
    {
      name: 'Gems',
      balance: wallet.gemsBalance,
      symbol: 'GEMS',
      description: 'Rare utility gems for exclusive redemptions.',
      icon: <Gem className="text-info" size={24} />,
      badgeClass: 'bg-info bg-opacity-10 text-info border border-info border-opacity-25'
    },
    {
      name: 'Platform Tokens',
      balance: wallet.tokensBalance,
      symbol: 'TOKENS',
      description: 'Governance and ecosystem liquidity tokens.',
      icon: <Coins className="text-success" size={24} />,
      badgeClass: 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
    },
    {
      name: 'Experience Points (XP)',
      balance: wallet.xpBalance,
      symbol: 'XP',
      description: 'Progression metric for level advancement.',
      icon: <Award className="text-primary" size={24} />,
      badgeClass: 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="d-flex align-items-center justify-between mb-3">
        <h2 className="h5 fw-bold text-white mb-0">Your Reward Assets</h2>
        <button
          onClick={() => onActionClick('withdraw')}
          className="btn btn-link text-info p-0 text-decoration-none small fw-semibold d-flex align-items-center gap-1"
        >
          Withdraw Assets <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="row g-3">
        {assets.map((asset, idx) => (
          <div key={idx} className="col-md-6 col-lg-4">
            <div className={styles.assetCard}>
              <div>
                <div className="d-flex align-items-center justify-between mb-3">
                  <div className={styles.iconBox}>
                    {asset.icon}
                  </div>
                  <span className={`badge font-monospace small px-2.5 py-1 ${asset.badgeClass}`}>
                    {asset.symbol}
                  </span>
                </div>
                <h3 className="small text-muted mb-1">{asset.name}</h3>
                <div className="h3 fw-bold text-white font-monospace mb-2">
                  {formatNumber(asset.balance)}
                </div>
              </div>
              <p className="text-muted small pt-3 border-top border-secondary border-opacity-25 mb-0">
                {asset.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
