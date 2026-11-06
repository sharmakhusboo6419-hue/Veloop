import React from 'react';
import { Activity, Clock } from 'lucide-react';
import styles from './RecentActivity.module.css';

interface RecentActivityProps {
  activities: any[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className={styles.cardBox}>
      <div className="d-flex align-items-center justify-between mb-4">
        <h2 className="h5 fw-bold text-white mb-0 d-flex align-items-center gap-2">
          <Activity className="text-primary" size={20} /> Recent Activity
        </h2>
        <span className="small text-muted font-monospace d-flex align-items-center gap-1">
          <Clock size={14} /> Live feed
        </span>
      </div>

      <div className="space-y-3">
        {activities && activities.length > 0 ? (
          activities.map((act: any) => (
            <div key={act._id} className={`${styles.actItem} d-flex align-items-center justify-between mb-2`}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 p-2 fw-bold">
                  ⚡
                </div>
                <div>
                  <span className="fw-semibold text-white small d-block mb-1">{act.description}</span>
                  <span className="text-muted font-monospace small">Action: {act.actionType}</span>
                </div>
              </div>
              <span className="text-muted font-monospace small">
                {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-muted small py-4">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
