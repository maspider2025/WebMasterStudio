import React from 'react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  backgroundClass?: string;
  editable?: boolean;
  onEdit?: () => void;
}

export function FeatureGrid({
  title,
  subtitle,
  features,
  columns = 4,
  backgroundClass = 'bg-white dark:bg-background',
  editable = false,
  onEdit,
}: FeatureGridProps) {
  // Classes para o número de colunas
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`w-full py-16 ${backgroundClass}`}>
      <div className="container mx-auto px-4">
        {/* Título e subtítulo */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl font-bold text-foreground mb-3">{title}</h2>}
            {subtitle && <p className="text-foreground/70 max-w-3xl mx-auto">{subtitle}</p>}
          </div>
        )}
        
        {/* Botão de edição */}
        {editable && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onEdit}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Editar recursos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </div>
        )}
        
        {/* Grade de recursos */}
        <div className={`grid ${gridClass} gap-8`}>
          {features.map((feature) => (
            <div key={feature.id} className="p-6 bg-card rounded-lg shadow-sm">
              <div className="text-primary mb-4 w-12 h-12 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ícones predefinidos para facilitar o uso
export const FeatureIcons = {
  truck: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16v-8h-8"></path>
      <rect x="2" y="8" width="8" height="8" rx="1"></rect>
      <path d="M22 14h-4l-2 4h-4"></path>
      <circle cx="6" cy="20" r="2"></circle>
      <circle cx="14" cy="20" r="2"></circle>
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  headphones: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
  ),
  creditCard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"></rect>
      <line x1="2" y1="10" x2="22" y2="10"></line>
    </svg>
  ),
  gift: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v10H4V12"></path>
      <path d="M2 7h20v5H2z"></path>
      <path d="M12 22V7"></path>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
  ),
  refresh: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v6h6"></path>
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
      <path d="M21 22v-6h-6"></path>
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
    </svg>
  ),
  mapPin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  thumbsUp: (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12"></path>
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
    </svg>
  ),
};

// Exemplo de uso:
/*
<FeatureGrid
  title="Por que escolher nossa loja"
  subtitle="Compromisso com qualidade e satisfação do cliente."
  features={[
    {
      id: '1',
      icon: FeatureIcons.truck,
      title: 'Entrega Rápida',
      description: 'Enviamos seus pedidos em até 24 horas após a confirmação do pagamento.',
    },
    {
      id: '2',
      icon: FeatureIcons.shield,
      title: 'Compra Segura',
      description: 'Seus dados estão protegidos com a mais alta tecnologia de criptografia.',
    },
    {
      id: '3',
      icon: FeatureIcons.headphones,
      title: 'Suporte 24/7',
      description: 'Nossa equipe está disponível para ajudar você a qualquer momento.',
    },
    {
      id: '4',
      icon: FeatureIcons.refresh,
      title: 'Troca Fácil',
      description: 'Política de devolução simplificada para sua conveniência.',
    },
  ]}
/>
*/
