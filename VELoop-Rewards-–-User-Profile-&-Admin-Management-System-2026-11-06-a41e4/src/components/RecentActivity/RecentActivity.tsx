import React from 'react';
import { Activity, Clock } from 'lucide-react';
import styles from './RecentActivity.module.css';

interface RecentActivityProps {
  activities: any[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className={styles.cardBox}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white mb-0 flex items-center gap-2">
          <Activity className="text-blue-300" size={20} /> Recent Activity
        </h2>
        <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
          <Clock size={14} /> Live feed
        </span>
      </div>

      <div className="space-y-3">
        {activities && activities.length > 0 ? (
          activities.map((act: any) => (
            <div key={act._id} className={`${styles.actItem} flex items-center justify-between mb-2`}>
              <div className="flex items-center gap-3">
                <div className="bg-primary bg-opacity-10 text-blue-300 border border-primary border-opacity-25 rounded-3 p-2 font-bold">
                  ⚡
                </div>
                <div>
                  <span className="font-semibold text-white text-xs d-block mb-1">{act.description}</span>
                  <span className="text-slate-300 font-mono text-xs">Action: {act.actionType}</span>
                </div>
              </div>
              <span className="text-slate-300 font-mono text-xs">
                {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-300 text-xs py-4">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
