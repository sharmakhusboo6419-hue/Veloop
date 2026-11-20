import React from 'react';
import { Coins, Sparkles, Gem, Award, ArrowUpRight } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';
import styles from './RewardAssets.module.css';
interface RewardAssetsProps { wallet: { veBalance:number; sveBalance:number; gemsBalance:number; tokensBalance:number; xpBalance:number; }; onActionClick:(action:string)=>void; }
export const RewardAssets: React.FC<RewardAssetsProps> = ({ wallet, onActionClick }) => {
 const assets=[['VELoop Earnings',wallet.veBalance,'VE',Coins,'ve','Spendable rewards'],['Silver Vault',wallet.sveBalance,'SVE',Sparkles,'sve','Vault-secured earnings'],['Gem Reserve',wallet.gemsBalance,'GEMS',Gem,'gems','Rare reward utilities'],['Platform Tokens',wallet.tokensBalance,'TOKENS',Coins,'tokens','Ecosystem balance'],['Experience',wallet.xpBalance,'XP',Award,'xp','Leveling power']] as const;
 return <section className={styles.section}><header className={styles.head}><div><p>YOUR REWARD VAULT</p><h2>Assets at a glance</h2></div><button onClick={()=>onActionClick('withdraw')}><span>Move rewards</span><ArrowUpRight size={16}/></button></header><div className={styles.grid}>{assets.map(([name,balance,symbol,Icon,tone,description])=><article key={symbol} className={`${styles.assetCard} ${styles[tone]}`}><div className={styles.cardTop}><span className={styles.icon}><Icon size={21}/></span><span className={styles.symbol}>{symbol}</span></div><p className={styles.assetName}>{name}</p><strong className={styles.balance}>{formatNumber(balance)}</strong><div className={styles.cardFoot}><span>{description}</span><ArrowUpRight size={14}/></div></article>)}</div></section>;
};
