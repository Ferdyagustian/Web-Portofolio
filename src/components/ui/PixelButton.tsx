import { ReactNode, ButtonHTMLAttributes, useState } from "react";
import { useAudio } from "../../providers/AudioProvider";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function PixelButton({ children, variant = "primary", className = "", ...props }: PixelButtonProps) {
  const isPrimary = variant === "primary";
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  let playSfx: (type: 'hover' | 'click' | 'option') => void = () => {};
  try {
    const audioCtx = useAudio();
    playSfx = audioCtx.playSfx;
  } catch {
    // continue
  }
  
  // Calculate dynamic effects
  const baseShadow = '4px 4px 0px 0px rgba(0,0,0,0.5)';
  const glowColor = isPrimary ? 'rgba(109, 216, 146, 0.35)' : 'rgba(240, 197, 94, 0.2)';
  const hoverShadow = `4px 8px 0px 0px rgba(0,0,0,0.5), 0px 0px 15px 4px ${glowColor}`;
  const activeShadow = '0px 0px 0px 0px rgba(0,0,0,0.5)';
  
  const currentShadow = isActive ? activeShadow : (isHovered ? hoverShadow : baseShadow);
  const currentTransform = isActive ? 'translate(4px, 4px)' : (isHovered ? 'translateY(-4px)' : 'translate(0px, 0px)');
  const currentFilter = (isHovered && !isActive) ? 'brightness(1.1)' : 'none';

  return (
    <button 
      className={`pixel-font ${className}`}
      {...props}
      style={{
        backgroundColor: isPrimary ? 'var(--color-moss-green)' : 'var(--color-black)',
        color: 'var(--color-cream)',
        padding: '12px 24px',
        border: `4px solid ${isPrimary ? 'var(--color-cream)' : 'var(--color-moss-green)'}`,
        cursor: 'pointer',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        boxShadow: currentShadow,
        transform: currentTransform,
        filter: currentFilter,
        transition: 'all 0.15s ease-out',
        imageRendering: 'pixelated',
        ...props.style
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        playSfx('hover');
        if (props.onMouseEnter) props.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        setIsActive(false);
        if (props.onMouseLeave) props.onMouseLeave(e);
      }}
      onMouseDown={(e) => {
        setIsActive(true);
        playSfx('click');
        if (props.onMouseDown) props.onMouseDown(e);
      }}
      onMouseUp={(e) => {
        setIsActive(false);
        if (props.onMouseUp) props.onMouseUp(e);
      }}
    >
      {children}
    </button>
  );
}
