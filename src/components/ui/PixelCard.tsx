import { ReactNode, useState } from "react";

export default function PixelCard({ children, title, icon }: { children: ReactNode, title: string, icon?: ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);

  const baseShadow = '4px 4px 0px 0px rgba(0,0,0,0.5)';
  const hoverShadow = '8px 8px 0px 0px rgba(0,0,0,0.5), 0px 0px 20px 5px rgba(74, 222, 128, 0.25)';
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--color-forest-dark)',
        border: '4px solid var(--color-moss-green)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        boxShadow: isHovered ? hoverShadow : baseShadow,
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0px)',
        filter: isHovered ? 'brightness(1.15)' : 'none',
        transition: 'all 0.2s ease-out',
        cursor: 'default'
      }}
    >
      <div style={{
        backgroundColor: 'var(--color-moss-green)',
        color: 'var(--color-cream)',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '4px solid var(--color-black)'
      }}>
        {icon}
        <span className="pixel-font" style={{ fontSize: '0.8rem' }}>{title}</span>
      </div>
      <div className="pixelify-font" style={{ padding: '1rem', flex: 1, color: 'var(--color-cream)' }}>
        {children}
      </div>
    </div>
  );
}
