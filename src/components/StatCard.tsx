import React, { useEffect, useState } from 'react';
import { animateValue } from '../utils/countUp';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  suffix?: string;
  sparkline?: number[];
  index?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  suffix = '',
  sparkline,
  index = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animateValue(0, value, 1500, setDisplayValue);
  }, [value]);

  return (
    <div
      className="stat-card page-enter"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div className="stat-card-header">
        <span className="stat-label">{title}</span>
        <div className="stat-icon">
          {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : null}
        </div>
      </div>
      <div className="stat-value">
        {displayValue.toLocaleString()}{suffix}
      </div>
      {change !== undefined && (
        <div className="stat-footer">
          <span className={`stat-delta ${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : ''}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="stat-period">vs last period</span>
        </div>
      )}
      {sparkline && sparkline.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '2px',
          height: '24px',
          alignItems: 'flex-end',
          marginTop: '12px',
        }}>
          {sparkline.map((val, idx) => {
            const maxVal = Math.max(...sparkline);
            const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: height + '%',
                  minHeight: '3px',
                  background: 'var(--teal)',
                  borderRadius: '2px',
                  opacity: 0.6,
                  transition: 'height 0.3s ease',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatCard;
