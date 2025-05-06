import React from 'react';
import { Link } from 'wouter';

interface BannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageSrc: string;
  imageAlt?: string;
  layout?: 'left' | 'right' | 'center';
  textColor?: string;
  overlay?: boolean;
  fullWidth?: boolean;
  height?: string;
  editable?: boolean;
  onEdit?: () => void;
}

export function PromotionalBanner({
  title,
  subtitle,
  description,
  buttonText = 'Ver mais',
  buttonLink = '/produtos',
  imageSrc,
  imageAlt = 'Banner promocional',
  layout = 'left',
  textColor = 'text-white',
  overlay = true,
  fullWidth = false,
  height = 'h-[500px]',
  editable = false,
  onEdit,
}: BannerProps) {
  // Classe de texto baseada no layout
  const textContainerClass = {
    left: 'items-start text-left',
    right: 'items-end text-right',
    center: 'items-center text-center',
  }[layout];

  // Posição do overlay
  const overlayClass = {
    left: 'bg-gradient-to-r from-black/70 to-transparent',
    right: 'bg-gradient-to-l from-black/70 to-transparent',
    center: 'bg-black/50',
  }[layout];

  // Classe para padding dos dois lados ou não
  const containerClass = fullWidth ? 'px-0' : 'px-4';

  return (
    <div className={`w-full py-8 ${containerClass}`}>
      <div className={`${fullWidth ? 'w-full' : 'container mx-auto'}`}>
        <div className={`relative overflow-hidden rounded-lg ${height}`}>
          {/* Imagem de fundo */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay */}
          {overlay && <div className={`absolute inset-0 ${overlayClass}`}></div>}
          
          {/* Botão de edição */}
          {editable && (
            <button
              onClick={onEdit}
              className="absolute top-2 right-2 z-10 p-2 bg-white/80 text-primary hover:bg-white rounded-full transition-colors"
              title="Editar banner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
          
          {/* Conteúdo do banner */}
          <div className={`absolute inset-0 flex flex-col justify-center p-8 ${textContainerClass}`}>
            {subtitle && <p className={`text-sm font-medium mb-2 ${textColor}`}>{subtitle}</p>}
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${textColor}`}>{title}</h2>
            {description && <p className={`text-lg mb-6 max-w-md ${textColor}`}>{description}</p>}
            {buttonText && buttonLink && (
              <Link
                href={buttonLink}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                {buttonText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
