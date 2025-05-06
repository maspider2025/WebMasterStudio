import { Element } from './editor-store';
import { ElementTypes } from './element-types';

export type TemplateCategory = 'landing' | 'ecommerce' | 'blog' | 'portfolio';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: TemplateCategory;
  elements: Element[];
}

// Helper function to create element IDs
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Landing page header element
const createHeader = (): Element => ({
  id: createId('header'),
  type: ElementTypes.container,
  x: 0,
  y: 0,
  width: 1200,
  height: 80,
  styles: {
    backgroundColor: '#3b82f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 10,
  },
  children: [createId('logo'), createId('nav')],
  zIndex: 1,
});

// Logo element
const createLogo = (): Element => ({
  id: createId('logo'),
  type: ElementTypes.text,
  x: 10,
  y: 25,
  width: 200,
  height: 30,
  content: 'Meu Site',
  styles: {
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  zIndex: 2,
});

// Navigation element
const createNav = (): Element => ({
  id: createId('nav'),
  type: ElementTypes.flexbox,
  x: 400,
  y: 25,
  width: 400,
  height: 30,
  styles: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'flex-end',
  },
  children: [
    createId('nav-item-1'),
    createId('nav-item-2'),
    createId('nav-item-3'),
    createId('nav-item-4'),
  ],
  zIndex: 2,
});

// Navigation items
const createNavItem = (id: string, content: string): Element => ({
  id,
  type: ElementTypes.text,
  x: 0,
  y: 0,
  width: 80,
  height: 30,
  content,
  styles: {
    color: 'white',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  zIndex: 3,
});

// Hero section
const createHero = (): Element => ({
  id: createId('hero'),
  type: ElementTypes.section,
  x: 0,
  y: 80,
  width: 1200,
  height: 500,
  styles: {
    backgroundColor: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
    textAlign: 'center',
  },
  children: [
    createId('hero-title'),
    createId('hero-subtitle'),
    createId('hero-button'),
  ],
  zIndex: 1,
});

// Hero title
const createHeroTitle = (): Element => ({
  id: createId('hero-title'),
  type: ElementTypes.heading,
  x: 200,
  y: 120,
  width: 800,
  height: 60,
  content: 'Bem-vindo ao NextGen Site Builder',
  styles: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px',
  },
  zIndex: 2,
});

// Hero subtitle
const createHeroSubtitle = (): Element => ({
  id: createId('hero-subtitle'),
  type: ElementTypes.paragraph,
  x: 300,
  y: 200,
  width: 600,
  height: 60,
  content: 'Crie seu site profissional com nossa plataforma de arrastar e soltar',
  styles: {
    fontSize: '20px',
    color: '#4b5563',
    marginBottom: '32px',
  },
  zIndex: 2,
});

// Hero button
const createHeroButton = (): Element => ({
  id: createId('hero-button'),
  type: ElementTypes.button,
  x: 500,
  y: 280,
  width: 200,
  height: 50,
  content: 'Saiba Mais',
  styles: {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: '500',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  zIndex: 2,
});

// Features section
const createFeatures = (): Element => ({
  id: createId('features'),
  type: ElementTypes.section,
  x: 0,
  y: 580,
  width: 1200,
  height: 600,
  styles: {
    backgroundColor: 'white',
    padding: '80px 32px',
  },
  children: [
    createId('features-title'),
    createId('features-grid'),
  ],
  zIndex: 1,
});

// Features title
const createFeaturesTitle = (): Element => ({
  id: createId('features-title'),
  type: ElementTypes.heading,
  x: 400,
  y: 600,
  width: 400,
  height: 50,
  content: 'Nossos Recursos',
  styles: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '48px',
  },
  zIndex: 2,
});

// Features grid
const createFeaturesGrid = (): Element => ({
  id: createId('features-grid'),
  type: ElementTypes.grid,
  x: 100,
  y: 680,
  width: 1000,
  height: 400,
  styles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
  },
  children: [
    createId('feature-1'),
    createId('feature-2'),
    createId('feature-3'),
  ],
  zIndex: 2,
});

// Feature card
const createFeatureCard = (id: string, title: string, description: string): Element => ({
  id,
  type: ElementTypes.container,
  x: 0,
  y: 0,
  width: 300,
  height: 300,
  styles: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  children: [
    `${id}-icon`,
    `${id}-title`,
    `${id}-description`,
  ],
  zIndex: 3,
});

// Feature icon
const createFeatureIcon = (id: string, backgroundColor: string): Element => ({
  id,
  type: ElementTypes.container,
  x: 10,
  y: 10,
  width: 50,
  height: 50,
  styles: {
    backgroundColor,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  zIndex: 4,
});

// Feature title
const createFeatureTitle = (id: string, content: string): Element => ({
  id,
  type: ElementTypes.heading,
  x: 10,
  y: 70,
  width: 280,
  height: 30,
  content,
  styles: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  zIndex: 4,
});

// Feature description
const createFeatureDescription = (id: string, content: string): Element => ({
  id,
  type: ElementTypes.paragraph,
  x: 10,
  y: 110,
  width: 280,
  height: 100,
  content,
  styles: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.5',
  },
  zIndex: 4,
});

// Create landing page template elements
const createLandingPageElements = (): Element[] => {
  const headerElement = createHeader();
  const logoElement = createLogo();
  const navElement = createNav();
  
  const navItem1 = createNavItem(createId('nav-item-1'), 'Início');
  const navItem2 = createNavItem(createId('nav-item-2'), 'Produtos');
  const navItem3 = createNavItem(createId('nav-item-3'), 'Sobre');
  const navItem4 = createNavItem(createId('nav-item-4'), 'Contato');
  
  const heroElement = createHero();
  const heroTitleElement = createHeroTitle();
  const heroSubtitleElement = createHeroSubtitle();
  const heroButtonElement = createHeroButton();
  
  const featuresElement = createFeatures();
  const featuresTitleElement = createFeaturesTitle();
  const featuresGridElement = createFeaturesGrid();
  
  const feature1 = createFeatureCard(
    createId('feature-1'),
    'Totalmente Personalizável',
    'Ajuste cores, fontes e estilos facilmente com nossa interface intuitiva.'
  );
  
  const feature2 = createFeatureCard(
    createId('feature-2'),
    'Templates Profissionais',
    'Comece com designs prontos criados por especialistas em UX/UI.'
  );
  
  const feature3 = createFeatureCard(
    createId('feature-3'),
    'Alta Performance',
    'Sites otimizados para velocidade e responsividade em todos os dispositivos.'
  );
  
  const feature1Icon = createFeatureIcon(`${feature1.id}-icon`, '#dbeafe');
  const feature2Icon = createFeatureIcon(`${feature2.id}-icon`, '#dbeafe');
  const feature3Icon = createFeatureIcon(`${feature3.id}-icon`, '#dbeafe');
  
  const feature1Title = createFeatureTitle(`${feature1.id}-title`, 'Totalmente Personalizável');
  const feature2Title = createFeatureTitle(`${feature2.id}-title`, 'Templates Profissionais');
  const feature3Title = createFeatureTitle(`${feature3.id}-title`, 'Alta Performance');
  
  const feature1Description = createFeatureDescription(
    `${feature1.id}-description`,
    'Ajuste cores, fontes e estilos facilmente com nossa interface intuitiva.'
  );
  
  const feature2Description = createFeatureDescription(
    `${feature2.id}-description`,
    'Comece com designs prontos criados por especialistas em UX/UI.'
  );
  
  const feature3Description = createFeatureDescription(
    `${feature3.id}-description`,
    'Sites otimizados para velocidade e responsividade em todos os dispositivos.'
  );
  
  return [
    headerElement,
    logoElement,
    navElement,
    navItem1,
    navItem2,
    navItem3,
    navItem4,
    
    heroElement,
    heroTitleElement,
    heroSubtitleElement,
    heroButtonElement,
    
    featuresElement,
    featuresTitleElement,
    featuresGridElement,
    
    feature1,
    feature2,
    feature3,
    
    feature1Icon,
    feature2Icon,
    feature3Icon,
    
    feature1Title,
    feature2Title,
    feature3Title,
    
    feature1Description,
    feature2Description,
    feature3Description,
  ];
};

// Create ecommerce page template elements
const createEcommercePageElements = (): Element[] => {
  // Similar to createLandingPageElements but with ecommerce specific elements
  // For brevity, just creating a simple structure
  const headerElement = createHeader();
  const logoElement = createLogo();
  const navElement = createNav();
  
  const navItem1 = createNavItem(createId('nav-item-1'), 'Início');
  const navItem2 = createNavItem(createId('nav-item-2'), 'Produtos');
  const navItem3 = createNavItem(createId('nav-item-3'), 'Carrinho');
  const navItem4 = createNavItem(createId('nav-item-4'), 'Minha Conta');
  
  // Ecommerce specific elements would be added here
  
  return [
    headerElement,
    logoElement,
    navElement,
    navItem1,
    navItem2,
    navItem3,
    navItem4,
    // Plus ecommerce specific elements
  ];
};

// Template definitions
export const templates: Record<TemplateCategory, { title: string; items: Template[] }> = {
  landing: {
    title: 'Landing Pages',
    items: [
      {
        id: 'landing-1',
        name: 'Landing Page Moderna',
        description: 'Template perfeito para páginas de vendas com design moderno e elegante.',
        thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'landing',
        elements: createLandingPageElements(),
      },
      {
        id: 'landing-2',
        name: 'Startup',
        description: 'Ideal para apresentar sua startup e atrair investidores.',
        thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'landing',
        elements: createLandingPageElements(),
      }
    ],
  },
  ecommerce: {
    title: 'E-commerce',
    items: [
      {
        id: 'ecommerce-1',
        name: 'Loja Online',
        description: 'Template completo para lojas virtuais com recursos de e-commerce.',
        thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'ecommerce',
        elements: createEcommercePageElements(),
      },
      {
        id: 'ecommerce-2',
        name: 'Marketplace',
        description: 'Plataforma multivendor para criar seu próprio marketplace.',
        thumbnail: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'ecommerce',
        elements: createEcommercePageElements(),
      }
    ],
  },
  blog: {
    title: 'Blog',
    items: [
      {
        id: 'blog-1',
        name: 'Blog Minimalista',
        description: 'Design clean e legível para destacar seu conteúdo.',
        thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'blog',
        elements: createLandingPageElements(), // Using landing elements as placeholder
      },
      {
        id: 'blog-2',
        name: 'Magazine',
        description: 'Layout tipo revista com múltiplas colunas e destaque para imagens.',
        thumbnail: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'blog',
        elements: createLandingPageElements(), // Using landing elements as placeholder
      }
    ],
  },
  portfolio: {
    title: 'Portfólio',
    items: [
      {
        id: 'portfolio-1',
        name: 'Portfólio Criativo',
        description: 'Showcase seus trabalhos com este layout artístico e impactante.',
        thumbnail: 'https://images.unsplash.com/photo-1545665277-5937489579f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'portfolio',
        elements: createLandingPageElements(), // Using landing elements as placeholder
      },
      {
        id: 'portfolio-2',
        name: 'Currículo Online',
        description: 'Apresente suas habilidades e experiência de forma profissional.',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'portfolio',
        elements: createLandingPageElements(), // Using landing elements as placeholder
      }
    ],
  }
};
