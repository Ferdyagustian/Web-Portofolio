import React, { useState } from 'react';

interface ObservableSkillProps {
  name: string;
  rank: 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';
  percentage: number;
  iconColor: string;
}

const RANK_COLORS: Record<string, string> = {
  ss: '#facc15',
  s: '#f87171',
  a: '#c084fc',
  b: '#60a5fa',
  c: '#4ade80',
  d: '#d1d5db',
};

export default function ObservableSkill({ name, rank, percentage, iconColor }: ObservableSkillProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const rankColor = RANK_COLORS[rank.toLowerCase()] || '#d1d5db';

  return (
    <div
      className="observable-skill-container"
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* ─── Skill Header Row ─── */}
      <div
        className="skill-header"
        style={{
          backgroundColor: isExpanded
            ? 'rgba(255, 255, 255, 0.06)'
            : isHovered
              ? 'rgba(255, 255, 255, 0.08)'
              : 'transparent',
          transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {/* Pixel Art Icon */}
        <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2H10V4H12V6H14V10H12V12H10V14H6V12H4V10H2V6H4V4H6V2Z" fill={iconColor} />
            <path d="M8 4H10V6H12V10H10V12H8V10H6V6H8V4Z" fill="white" fillOpacity="0.4" />
            <path opacity="0.5" d="M12 6H14V10H12V6Z" fill="black" />
            <path opacity="0.5" d="M10 10H12V12H10V10Z" fill="black" />
            <path opacity="0.5" d="M6 12H10V14H6V12Z" fill="black" />
            <path opacity="0.5" d="M4 10H6V12H4V10Z" fill="black" />
          </svg>

          {/* Hover Tooltip */}
          {isHovered && !isExpanded && (
            <div className="observe-tooltip pixel-font">
              [ Use Clairvoyance ]
            </div>
          )}
        </div>

        {/* Skill Name */}
        <span
          className="pixelify-font skill-name-text"
          style={{
            color: isExpanded ? rankColor : 'var(--color-cream)',
            textShadow: isExpanded
              ? `0 0 10px ${rankColor}30, 2px 2px 0px var(--color-black)`
              : '2px 2px 0px var(--color-black)',
            flex: 1,
            transition: 'color 0.3s ease, text-shadow 0.3s ease',
          }}
        >
          {name}
        </span>

        {/* Rank Badge — appears inline when expanded */}
        {isExpanded && (
          <span
            className="skill-rank-badge-inline"
            style={{
              color: rankColor,
              textShadow: `0 0 14px ${rankColor}50, 2px 2px 0px var(--color-black)`,
            }}
          >
            {rank}
          </span>
        )}

        {/* Mobile Hint */}
        {!isExpanded && (
          <span
            className="pixel-font mobile-hint"
            style={{
              fontSize: '0.65rem',
              color: 'var(--color-firefly)',
              opacity: 0.9,
              marginLeft: 'auto',
              textShadow: '1px 1px 0px var(--color-black)',
              animation: 'gachaBlinkPulse 1.4s ease-in-out infinite',
              flexShrink: 0,
            }}
          >
            [ TAP ]
          </span>
        )}
      </div>

      {/* ─── Inline Accordion Expand ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="skill-inline-stats">
            {/* RPG Progress Bar */}
            <div className="skill-bar-rpg">
              <div
                className={`skill-bar-rpg-fill ${isExpanded ? 'filling' : ''}`}
                style={{
                  width: isExpanded ? `${percentage}%` : '0%',
                  backgroundColor: iconColor,
                  boxShadow: isExpanded
                    ? `0 0 10px ${iconColor}60, inset 0 2px 0 rgba(255,255,255,0.35)`
                    : 'none',
                }}
              />
              {/* Shimmer sweep */}
              {isExpanded && <div className="skill-bar-shimmer" />}
            </div>

            {/* Label + Percentage */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
              <span
                className="pixelify-font"
                style={{ fontSize: '0.75rem', color: 'var(--color-cream)', opacity: 0.5 }}
              >
                Mastery Level
              </span>
              <span
                className={`pixelify-font skill-pct-counter ${isExpanded ? 'visible' : ''}`}
                style={{ fontSize: '0.9rem', color: rankColor, fontWeight: 'bold' }}
              >
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
