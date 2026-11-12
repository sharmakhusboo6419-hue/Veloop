import React from 'react';
import { Coins, Gem, Sparkles, Users, Award, ArrowRight } from 'lucide-react';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions = [
    {
      title: 'Earn More VEs',
      description: 'Complete daily tasks & challenges',
      icon: <Coins className="text-amber-300" size={20} />,
      actionKey: 'earn_ve'
    },
    {
      title: 'Get More Gems',
      description: 'Unlock rare vault bonuses',
      icon: <Gem className="text-info" size={20} />,
      actionKey: 'get_gems'
    },
    {
      title: 'Refer Friends',
      description: 'Invite members & earn 50 VEs',
      icon: <Users className="text-emerald-300" size={20} />,
      actionKey: 'refer'
    },
    {
      title: 'Request Withdrawal',
      description: 'Convert VEs to external wallet',
      icon: <Sparkles className="text-blue-300" size={20} />,
      actionKey: 'withdraw'
    }
  ];

  return (
    <div className={styles.cardBox}>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Award className="text-amber-300" size={20} /> Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((act, idx) => (
          <div key={idx} className="">
            <button
              onClick={() => onActionClick(act.actionKey)}
              className={styles.actionBtn}
            >
              <div>
                <div className="bg-secondary bg-opacity-25 rounded-3 p-2 d-inline-block mb-3 border border-secondary border-opacity-50">
                  {act.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-300 mb-0">{act.description}</p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
