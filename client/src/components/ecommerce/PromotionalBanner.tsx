import React from 'react';
import { Link } from 'wouter';

interface PromotionalBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageSrc: string;
  layout?: 'left' | 'right' | 'center';
  height?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  editable?: boolean;
  onEdit?: () => void;
}

export function PromotionalBanner({
  title,
  subtitle,
  description,
  buttonText = 'Saiba Mais',
  buttonLink = '/',
  imageSrc,
  layout = 'left',
  height = 'h-[500px]',
  overlay = true,
  overlayOpacity = 50,
  editable = false,
  onEdit,
}: PromotionalBannerProps) {
  // Classes baseadas no layout
  const containerClass = layout === 'center' 
    ? 'flex flex-col items-center justify-center text-center px-4'
    : `flex flex-col justify-center ${layout === 'left' ? 'items-start pl-8 pr-4 md:pl-16 md:pr-8' : 'items-end pr-8 pl-4 md:pr-16 md:pl-8'}`;
  
  // Classe do overlay
  const overlayClass = overlay ? `absolute inset-0 bg-black opacity-${overlayOpacity / 10}` : '';
  
  // Determinar se o texto deve ser claro ou escuro com base no overlay
  const textClass = overlay ? 'text-white' : 'text-foreground';

  return (
    <div className={`w-full ${height} relative overflow-hidden`}>
      {editable && (
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 z-30 p-2 text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors"
          title="Editar banner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
      )}
      
      {/* Imagem de fundo */}
      <img 
        src={imageSrc} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay opcional */}
      {overlay && <div className={overlayClass}></div>}
      
      {/* Conteúdo */}
      <div className="relative z-10 h-full w-full max-w-screen-xl mx-auto">
        <div className={containerClass}>
          <div className="max-w-md">
            {subtitle && (
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary ${overlay ? 'text-white' : 'text-white'} mb-3`}>
                {subtitle}
              </span>
            )}
            
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>{title}</h2>
            
            {description && <p className={`mb-6 ${overlay ? 'text-white/90' : 'text-foreground/70'}`}>{description}</p>}
            
            {buttonText && buttonLink && (
              <Link href={buttonLink} className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
                {buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
