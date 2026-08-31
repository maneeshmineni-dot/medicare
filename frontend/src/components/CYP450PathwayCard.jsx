import React, { useState } from 'react';
import { Activity, ShieldAlert, Zap, Clock, Droplets, Info, ExternalLink } from 'lucide-react';

export const CYP450PathwayCard = ({ pkData, medicationName = 'Medication' }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!pkData) {
    return null;
  }

  const {
    name = medicationName,
    cypSubstrates = [],
    cypInhibitors = [],
    cypInducers = [],
    elimination = 'Hepatic & Renal excretion',
    halfLifeHours = 3.5,
    tmaxHours = 2.0,
    cmaxUnits = 'µg/mL',
    cmaxTypical = 10.0,
    bioavailability = '70-85%',
    proteinBinding = '40%',
    clinicalAlert = '',
    plasmaCurve = []
  } = pkData;

  // SVG Chart dimensions
  const chartWidth = 560;
  const chartHeight = 160;
  const padding = { top: 20, right: 25, bottom: 25, left: 45 };

  const maxConc = Math.max(...plasmaCurve.map(p => p.concentration), cmaxTypical * 1.1, 1);
  const maxTime = 24;

  const scaleX = (t) => padding.left + (t / maxTime) * (chartWidth - padding.left - padding.right);
  const scaleY = (c) => chartHeight - padding.bottom - (c / maxConc) * (chartHeight - padding.top - padding.bottom);

  // Generate SVG path string
  let pathD = '';
  if (plasmaCurve.length > 0) {
    pathD = plasmaCurve.reduce((acc, point, i) => {
      const x = scaleX(point.timeHour);
      const y = scaleY(point.concentration);
      return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');
  }

  const areaD = pathD ? `${pathD} L ${scaleX(24)},${scaleY(0)} L ${scaleX(0)},${scaleY(0)} Z` : '';

  return (
    <div className="cyp-pathway-card" style={{
      background: 'rgba(15, 23, 42, 0.65)',
      border: '1px solid rgba(124, 58, 237, 0.35)',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '16px',
      color: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(6,182,212,0.3) 100%)',
            border: '1px solid rgba(124,58,237,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a78bfa'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9' }}>
              CYP450 Pharmacokinetics & Clearance Engine
            </h4>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Deterministic Cytochrome P450 Enzyme Pathway & 24-Hour Plasma Modeling
            </div>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '20px',
          fontSize: '0.75rem',
          color: '#67e8f9',
          fontWeight: 600
        }}>
          <Zap size={13} />
          <span>Deterministic PK Engine</span>
        </div>
      </div>

      {/* Pharmacokinetic Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Elimination Half-Life (t½)
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
            {halfLifeHours} hrs
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> Peak Time (Tmax)
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa', marginTop: '2px' }}>
            {tmaxHours} hrs
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Droplets size={12} /> Bioavailability
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
            {bioavailability}
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={12} /> Protein Binding
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
            {proteinBinding}
          </div>
        </div>
      </div>

      {/* 24-Hour Simulated Plasma Clearance Curve SVG */}
      <div style={{
        background: 'rgba(10, 15, 30, 0.8)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1' }}>
            📈 24-Hour Simulated Serum Concentration Curve (Oral Dose)
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {hoveredPoint ? `T: ${hoveredPoint.timeHour}h | Conc: ${hoveredPoint.concentration} ${cmaxUnits}` : `Peak Cmax: ~${cmaxTypical} ${cmaxUnits}`}
          </span>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', minWidth: '420px' }}>
            <defs>
              <linearGradient id="pkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 6, 12, 18, 24].map((t) => (
              <g key={t}>
                <line
                  x1={scaleX(t)}
                  y1={padding.top}
                  x2={scaleX(t)}
                  y2={chartHeight - padding.bottom}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                />
                <text
                  x={scaleX(t)}
                  y={chartHeight - 8}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {t}h
                </text>
              </g>
            ))}

            {/* Therapeutic threshold line */}
            <line
              x1={padding.left}
              y1={scaleY(cmaxTypical * 0.25)}
              x2={chartWidth - padding.right}
              y2={scaleY(cmaxTypical * 0.25)}
              stroke="rgba(16, 185, 129, 0.4)"
              strokeDasharray="4 2"
            />
            <text
              x={chartWidth - padding.right}
              y={scaleY(cmaxTypical * 0.25) - 4}
              fill="#10b981"
              fontSize="9"
              textAnchor="end"
            >
              Therapeutic Baseline
            </text>

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#pkGradient)" />}

            {/* Line Stroke */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Interactive Data Points */}
            {plasmaCurve.filter((_, idx) => idx % 4 === 0).map((point, idx) => {
              const cx = scaleX(point.timeHour);
              const cy = scaleY(point.concentration);
              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* CYP450 Enzymes Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
            CYP Substrates:
          </span>
          <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            {cypSubstrates.length > 0 ? cypSubstrates.join(', ') : 'No major CYP substrate pathways'}
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase' }}>
            CYP Inhibitors:
          </span>
          <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            {cypInhibitors.length > 0 ? cypInhibitors.join(', ') : 'None / Non-inhibitor'}
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase' }}>
            Primary Elimination:
          </span>
          <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            {elimination}
          </div>
        </div>
      </div>

      {/* Clinical Alert Footer */}
      {clinicalAlert && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'rgba(245, 158, 11, 0.1)',
          borderLeft: '3px solid #f59e0b',
          borderRadius: '4px',
          fontSize: '0.8rem',
          color: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldAlert size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>{clinicalAlert}</span>
        </div>
      )}
    </div>
  );
};
