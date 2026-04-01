import { ReactNode } from "react";

export default function DialogueBox({ children, title, className = "", style }: { children: ReactNode, title?: string, className?: string, style?: React.CSSProperties }) {
  return (
    <div className={`pixel-corners ${className}`} style={{
      position: 'relative',
      backgroundColor: 'var(--color-cream)',
      border: '4px solid var(--color-moss-green)',
      color: 'var(--color-black)',
      boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.5)',
      imageRendering: 'pixelated',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Wooden corner decorations could go here */}
      <div style={{
        position: 'absolute', top: -4, left: -4, width: 8, height: 8, backgroundColor: 'var(--color-forest-dark)'
      }} />
      <div style={{
        position: 'absolute', top: -4, right: -4, width: 8, height: 8, backgroundColor: 'var(--color-forest-dark)'
      }} />
      <div style={{
        position: 'absolute', bottom: -4, left: -4, width: 8, height: 8, backgroundColor: 'var(--color-forest-dark)'
      }} />
      <div style={{
        position: 'absolute', bottom: -4, right: -4, width: 8, height: 8, backgroundColor: 'var(--color-forest-dark)'
      }} />

      {title && (
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '20px',
          backgroundColor: 'var(--color-forest-dark)',
          color: 'var(--color-cream)',
          padding: '4px 12px',
          border: '2px solid var(--color-moss-green)',
          fontFamily: "var(--font-sixtyfour), cursive",
          fontSize: '0.75rem',
          boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.5)',
        }}>
          {title}
        </div>
      )}

      <div className="pixelify-font" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
        {children}
      </div>
    </div>
  );
}
