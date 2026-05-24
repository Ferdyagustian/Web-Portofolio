import { ReactNode } from "react";

export default function DialogueBox({ children, title, className = "", style }: { children: ReactNode, title?: string, className?: string, style?: React.CSSProperties }) {
  return (
    <div className={className} style={{
      position: 'relative',
      color: 'var(--color-cream)',
      textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
      imageRendering: 'pixelated',
      maxWidth: '800px',
      margin: '0 auto',
      ...style
    }}>
      {title && (
        <h3 className="pixel-font" style={{
          fontSize: '1.2rem',
          color: 'var(--color-cream)',
          textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
          marginBottom: '1.5rem',
          borderBottom: '4px dashed rgba(255,255,255,0.2)',
          paddingBottom: '0.5rem',
          display: 'inline-block'
        }}>
          {title}
        </h3>
      )}

      <div className="pixelify-font" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
        {children}
      </div>
    </div>
  );
}
