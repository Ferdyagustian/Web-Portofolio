import React, { useState } from 'react';

interface ObservableSkillProps {
  name: string;
  rank: 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';
  percentage: number;
  iconColor: string;
}

export default function ObservableSkill({ name, rank, percentage, iconColor }: ObservableSkillProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="observable-skill-container"
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <div
        className="skill-header"
        style={{
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {/* Pixel Art SVG Icon */}
        <div style={{ position: 'relative', width: '32px', height: '32px' }}>
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2H10V4H12V6H14V10H12V12H10V14H6V12H4V10H2V6H4V4H6V2Z" fill={iconColor} />
            <path d="M8 4H10V6H12V10H10V12H8V10H6V6H8V4Z" fill="white" fillOpacity="0.4" />
            <path opacity="0.5" d="M12 6H14V10H12V6Z" fill="black" />
            <path opacity="0.5" d="M10 10H12V12H10V10Z" fill="black" />
            <path opacity="0.5" d="M6 12H10V14H6V12Z" fill="black" />
            <path opacity="0.5" d="M4 10H6V12H4V10Z" fill="black" />
          </svg>

          {/* Hover Observe Tooltip */}
          {isHovered && !isExpanded && (
            <div
              className="observe-tooltip pixel-font"
            >
              [ Use Clairvoyance ]
            </div>
          )}
        </div>

        <span className="pixelify-font skill-name-text" style={{ color: 'var(--color-cream)', textShadow: '2px 2px 0px var(--color-black)' }}>
          {name}
        </span>
        
        {/* Mobile Hint - Visible only when not hovered/expanded on small screens */}
        {!isExpanded && (
           <span className="pixel-font mobile-hint" style={{ fontSize: '0.6rem', color: 'var(--color-firefly)', opacity: 0.8, marginLeft: 'auto', textShadow: '1px 1px 0px var(--color-black)' }}>
             [ Use Clairvoyance ]
           </span>
        )}
      </div>

      {/* Expanded Stat Bar (Stardew Style) with Smooth Grid Transition */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            className={`stardew-panel panel-transition ${isExpanded ? 'panel-expanded' : ''}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="pixel-font mastery-text">Mastery Level</span>
              <span className={`skill-rank rank-${rank.toLowerCase()}`}>{rank}</span>
            </div>

            <div className="skill-bar-container">
              <div
                className="skill-bar-fill"
                style={{
                  width: isExpanded ? `${percentage}%` : '0%',
                  backgroundColor: iconColor,
                  transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s' // delay slightly for dramatic effect
                }}
              />
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.9rem', marginTop: '-0.3rem' }} className="pixelify-font">
              {percentage}% / 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
