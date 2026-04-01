import { ReactNode } from "react";

export default function PixelCard({ children, title, icon }: { children: ReactNode, title: string, icon?: ReactNode }) {
  // We shifted the styling complex hover logic to globals.css class 'quest-board-card'
  
  return (
    <div className="quest-board-card">
      <div className="quest-board-header">
        {icon}
        <span className="pixel-font" style={{ fontSize: '1rem', textShadow: '2px 2px 0px var(--color-black)' }}>
          {title}
        </span>
      </div>
      <div 
        className="pixelify-font" 
        style={{ 
          padding: '1.5rem 1rem', 
          flex: 1, 
          color: 'var(--color-cream)',
        }}>
        {children}
      </div>
    </div>
  );
}
