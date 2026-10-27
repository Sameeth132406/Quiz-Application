import React, { useState } from 'react';

export const ScoreTrendChart = ({ attempts = [], quizzesMap = {} }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!attempts || attempts.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
        No attempt records available to generate trend chart.
      </div>
    );
  }

  // Take the last 10 attempts in chronological order
  const data = [...attempts]
    .slice(-10)
    .map((att, index) => {
      const score = att.score || 0;
      const quiz = quizzesMap[att.quizId];
      const total = quiz?.totalQuestions || att.totalMarks || 1;
      const pct = att.percentage != null ? Math.round(att.percentage) : Math.min(100, Math.max(0, Math.round((score / total) * 100)));
      return {
        id: att.attemptId || att.id || index,
        label: att.quizTitle || quiz?.title || `Quiz ${index + 1}`,
        score: pct,
        rawScore: score,
        total: total,
        date: att.completedAt ? new Date(att.completedAt).toLocaleDateString() : `Attempt ${index + 1}`
      };
    });

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / Math.max(1, data.length - 1);
    const y = height - paddingY - (d.score / 100) * (height - 2 * paddingY);
    return { ...d, x, y };
  });

  const pathD = points.length === 1
    ? `M ${paddingX},${points[0].y} L ${width - paddingX},${points[0].y}`
    : points.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x},${curr.y}`, '');

  const areaD = points.length === 1
    ? ''
    : `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid guide lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = height - paddingY - (val / 100) * (height - 2 * paddingY);
          return (
            <g key={val}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text x={paddingX - 10} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="600">
                {val}%
              </text>
            </g>
          );
        })}

        {/* Filled area under curve */}
        {areaD && <path d={areaD} fill="url(#scoreTrendGradient)" />}

        {/* Trend line */}
        <path d={pathD} fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Data Points */}
        {points.map((pt, idx) => (
          <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.id === pt.id ? 7 : 4.5}
              fill="#ffffff"
              stroke="#dc2626"
              strokeWidth={hoveredPoint?.id === pt.id ? 3 : 2}
              style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
            />
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          top: `${(hoveredPoint.y / height) * 100}%`,
          left: `${(hoveredPoint.x / width) * 100}%`,
          transform: 'translate(-50%, -125%)',
          background: '#0f172a',
          color: '#ffffff',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 10
        }}>
          {hoveredPoint.label}: {hoveredPoint.score}% ({hoveredPoint.rawScore}/{hoveredPoint.total})
        </div>
      )}
    </div>
  );
};

export const CategoryBarChart = ({ categoryData = [] }) => {
  const defaultData = [
    { name: 'Cloud Computing', avgScore: 88 },
    { name: 'Docker & Microservices', avgScore: 74 },
    { name: 'Java Backend', avgScore: 92 },
    { name: 'Network Security', avgScore: 68 }
  ];

  const data = categoryData.length > 0 ? categoryData : defaultData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
      {data.map((cat, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' }}>
            <span style={{ color: '#0f172a' }}>{cat.name}</span>
            <span style={{ color: cat.avgScore >= 80 ? '#16a34a' : cat.avgScore >= 60 ? '#d97706' : '#dc2626' }}>
              {cat.avgScore}%
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${cat.avgScore}%`,
                height: '100%',
                background: cat.avgScore >= 80
                  ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                  : cat.avgScore >= 60
                  ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                  : 'linear-gradient(90deg, #dc2626, #ef4444)',
                borderRadius: '999px',
                transition: 'width 0.6s ease'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ScoreDistributionDonut = ({ attempts = [], quizzesMap = {} }) => {
  let mastery = 0;   // >= 85
  let proficient = 0; // 70 - 84
  let passing = 0;    // 50 - 69
  let review = 0;     // < 50

  attempts.forEach((a) => {
    const score = a.score || 0;
    const quiz = quizzesMap[a.quizId];
    const total = quiz?.totalQuestions || a.totalMarks || 1;
    const pct = a.percentage != null ? a.percentage : (total > 0 ? (score / total) * 100 : 0);
    if (pct >= 85) mastery++;
    else if (pct >= 70) proficient++;
    else if (pct >= 50) passing++;
    else review++;
  });

  const totalCount = attempts.length || 1;
  const segments = [
    { label: 'Mastery (85%+)', count: mastery, color: '#16a34a' },
    { label: 'Proficient (70-84%)', count: proficient, color: '#0284c7' },
    { label: 'Passing (50-69%)', count: passing, color: '#d97706' },
    { label: 'Needs Review (<50%)', count: review, color: '#dc2626' }
  ];

  // SVG Circle stroke dash calculations
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      {/* SVG Donut */}
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => {
            const fraction = seg.count / totalCount;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeOffset;
            cumulativeOffset += fraction * circumference;

            if (seg.count === 0) return null;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            );
          })}
        </svg>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>
            {attempts.length}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600' }}>Attempts</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {segments.map((seg, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color, flexShrink: 0 }}></span>
              <span style={{ color: '#475569', fontWeight: '500' }}>{seg.label}</span>
            </div>
            <span style={{ fontWeight: '700', color: '#0f172a' }}>{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BarChartComponent = ({ items = [], title = '', color = '#2563eb', unit = '%' }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
        No data available for chart.
      </div>
    );
  }

  const maxValue = Math.max(...items.map(it => it.value || 0), 100);

  return (
    <div style={{ width: '100%', padding: '0.5rem 0' }}>
      {title && <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.8rem', color: '#334155' }}>{title}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item, idx) => {
          const pct = Math.min(100, Math.round(((item.value || 0) / maxValue) * 100));
          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.label}</span>
                <span style={{ fontWeight: '700', color: color }}>
                  {item.value}{unit} {item.secondaryText ? `(${item.secondaryText})` : ''}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: item.color || color,
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ProgressComparisonBar = ({ label, current, total, color = '#10b981' }) => {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
        <span style={{ fontWeight: '600', color: '#334155' }}>{label}</span>
        <span style={{ fontWeight: '700', color: '#0f172a' }}>{current} / {total} ({pct}%)</span>
      </div>
      <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.4s ease' }}></div>
      </div>
    </div>
  );
};

export const LineChartComponent = ({ data = [], height = 180, color = '#2563eb' }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
        No trend records available to display.
      </div>
    );
  }

  const width = 500;
  const paddingX = 40;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / Math.max(1, data.length - 1);
    const score = d.score || 0;
    const y = height - paddingY - (score / 100) * (height - 2 * paddingY);
    return { ...d, x, y, score };
  });

  const pathD = points.length === 1
    ? `M ${paddingX},${points[0].y} L ${width - paddingX},${points[0].y}`
    : points.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x},${curr.y}`, '');

  const areaD = points.length === 1
    ? ''
    : `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((val) => {
          const y = height - paddingY - (val / 100) * (height - 2 * paddingY);
          return (
            <g key={val}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text x={paddingX - 10} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="600">
                {val}%
              </text>
            </g>
          );
        })}

        {areaD && <path d={areaD} fill="url(#lineChartGradient)" />}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((pt, idx) => (
          <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint === pt ? 6 : 4}
              fill="#ffffff"
              stroke={color}
              strokeWidth={hoveredPoint === pt ? 3 : 2}
              style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
            />
          </g>
        ))}
      </svg>
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          left: `${(hoveredPoint.x / width) * 100}%`,
          top: `${(hoveredPoint.y / height) * 100}%`,
          transform: 'translate(-50%, -120%)',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.35rem 0.65rem',
          borderRadius: '6px',
          fontSize: '0.78rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}>
          {hoveredPoint.label}: {hoveredPoint.score}%
        </div>
      )}
    </div>
  );
};

