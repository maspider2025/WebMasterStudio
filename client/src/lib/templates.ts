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
  // Cabeçalho de e-commerce
  const headerElement = createHeader();
  const logoElement = { ...createLogo(), content: 'NextGen Shop' };
  const navElement = createNav();
  
  const navItem1 = createNavItem(createId('nav-item-1'), 'Início');
  const navItem2 = createNavItem(createId('nav-item-2'), 'Produtos');
  const navItem3 = createNavItem(createId('nav-item-3'), 'Categorias');
  const navItem4 = createNavItem(createId('nav-item-4'), 'Ofertas');
  const navItem5 = createNavItem(createId('nav-item-5'), 'Carrinho');
  const navItem6 = createNavItem(createId('nav-item-6'), 'Minha Conta');
  
  // Banner principal
  const mainBannerId = createId('main-banner');
  const mainBanner: Element = {
    id: mainBannerId,
    type: ElementTypes.container,
    x: 0,
    y: 80,
    width: 1200,
    height: 600,
    styles: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#f8f9fa',
    },
    zIndex: 1,
    children: [mainBannerId + '-img', mainBannerId + '-overlay', mainBannerId + '-content'],
  };
  
  // Banner background image
  const mainBannerImg: Element = {
    id: mainBannerId + '-img',
    type: ElementTypes.image,
    x: 0,
    y: 0,
    width: 1200,
    height: 600,
    src: 'https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?q=80&w=2069',
    alt: 'Banner principal',
    styles: {
      objectFit: 'cover',
      width: '100%',
      height: '100%',
    },
    zIndex: 1,
  };
  
  // Banner overlay
  const mainBannerOverlay: Element = {
    id: mainBannerId + '-overlay',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 1200,
    height: 600,
    styles: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    zIndex: 2,
  };
  
  // Banner content container
  const mainBannerContent: Element = {
    id: mainBannerId + '-content',
    type: ElementTypes.container,
    x: 50,
    y: 150,
    width: 550,
    height: 300,
    styles: {
      position: 'absolute',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: 'white',
    },
    zIndex: 3,
    children: [
      mainBannerId + '-subtitle',
      mainBannerId + '-title',
      mainBannerId + '-description',
      mainBannerId + '-button',
    ],
  };
  
  // Banner subtitle
  const mainBannerSubtitle: Element = {
    id: mainBannerId + '-subtitle',
    type: ElementTypes.text,
    x: 0,
    y: 0,
    width: 200,
    height: 30,
    content: 'Chegou agora',
    styles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.25rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: 500,
      marginBottom: '1rem',
      display: 'inline-block',
    },
    zIndex: 4,
  };
  
  // Banner title
  const mainBannerTitle: Element = {
    id: mainBannerId + '-title',
    type: ElementTypes.heading,
    x: 0,
    y: 40,
    width: 500,
    height: 80,
    content: 'Nova Coleção de Verão',
    styles: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: 'white',
    },
    zIndex: 4,
  };
  
  // Banner description
  const mainBannerDescription: Element = {
    id: mainBannerId + '-description',
    type: ElementTypes.paragraph,
    x: 0,
    y: 130,
    width: 500,
    height: 80,
    content: 'Descubra nossas peças exclusivas com 20% de desconto por tempo limitado. Estilo, qualidade e conforto para você aproveitar a estação.',
    styles: {
      fontSize: '1rem',
      marginBottom: '2rem',
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: 1.6,
    },
    zIndex: 4,
  };
  
  // Banner button
  const mainBannerButton: Element = {
    id: mainBannerId + '-button',
    type: ElementTypes.button,
    x: 0,
    y: 220,
    width: 200,
    height: 50,
    content: 'Comprar Agora',
    styles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '1rem',
    },
    zIndex: 4,
  };
  
  // Feature grid section
  const featureGridId = createId('feature-grid');
  const featureGrid: Element = {
    id: featureGridId,
    type: ElementTypes.section,
    x: 0,
    y: 680,
    width: 1200,
    height: 250,
    styles: {
      padding: '3rem 2rem',
      backgroundColor: 'white',
    },
    zIndex: 1,
    children: [featureGridId + '-container'],
  };
  
  // Feature grid container
  const featureGridContainer: Element = {
    id: featureGridId + '-container',
    type: ElementTypes.grid,
    x: 50,
    y: 0,
    width: 1100,
    height: 180,
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
    },
    zIndex: 2,
    children: [
      featureGridId + '-feature-1',
      featureGridId + '-feature-2',
      featureGridId + '-feature-3',
      featureGridId + '-feature-4',
    ],
  };
  
  // Function to create feature items
  const createFeatureItem = (id: string, title: string, description: string): Element => ({
    id: id,
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 250,
    height: 180,
    styles: {
      padding: '1.5rem',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
    },
    zIndex: 3,
    children: [id + '-icon', id + '-title', id + '-description'],
  });
  
  // Function to create feature icon
  const createFeatureItemIcon = (id: string): Element => ({
    id: id,
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    styles: {
      color: '#3b82f6',
      marginBottom: '1rem',
    },
    zIndex: 4,
  });
  
  // Function to create feature title
  const createFeatureItemTitle = (id: string, content: string): Element => ({
    id: id,
    type: ElementTypes.heading,
    x: 0,
    y: 50,
    width: 250,
    height: 30,
    content: content,
    styles: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#111827',
    },
    zIndex: 4,
  });
  
  // Function to create feature description
  const createFeatureItemDescription = (id: string, content: string): Element => ({
    id: id,
    type: ElementTypes.paragraph,
    x: 0,
    y: 90,
    width: 250,
    height: 70,
    content: content,
    styles: {
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: 1.6,
    },
    zIndex: 4,
  });
  
  // Create feature items
  const feature1 = createFeatureItem(
    featureGridId + '-feature-1',
    'Entrega Rápida',
    'Enviamos seus pedidos em até 24 horas após a confirmação do pagamento.'
  );
  
  const feature2 = createFeatureItem(
    featureGridId + '-feature-2',
    'Compra Segura',
    'Seus dados estão protegidos com a mais alta tecnologia de criptografia.'
  );
  
  const feature3 = createFeatureItem(
    featureGridId + '-feature-3',
    'Suporte 24/7',
    'Nossa equipe está disponível para ajudar você a qualquer momento.'
  );
  
  const feature4 = createFeatureItem(
    featureGridId + '-feature-4',
    'Troca Fácil',
    'Política de devolução simplificada para sua conveniência.'
  );
  
  // Create feature icons
  const feature1Icon = createFeatureItemIcon(featureGridId + '-feature-1-icon');
  const feature2Icon = createFeatureItemIcon(featureGridId + '-feature-2-icon');
  const feature3Icon = createFeatureItemIcon(featureGridId + '-feature-3-icon');
  const feature4Icon = createFeatureItemIcon(featureGridId + '-feature-4-icon');
  
  // Create feature titles
  const feature1Title = createFeatureItemTitle(featureGridId + '-feature-1-title', 'Entrega Rápida');
  const feature2Title = createFeatureItemTitle(featureGridId + '-feature-2-title', 'Compra Segura');
  const feature3Title = createFeatureItemTitle(featureGridId + '-feature-3-title', 'Suporte 24/7');
  const feature4Title = createFeatureItemTitle(featureGridId + '-feature-4-title', 'Troca Fácil');
  
  // Create feature descriptions
  const feature1Description = createFeatureItemDescription(
    featureGridId + '-feature-1-description',
    'Enviamos seus pedidos em até 24 horas após a confirmação do pagamento.'
  );
  
  const feature2Description = createFeatureItemDescription(
    featureGridId + '-feature-2-description',
    'Seus dados estão protegidos com a mais alta tecnologia de criptografia.'
  );
  
  const feature3Description = createFeatureItemDescription(
    featureGridId + '-feature-3-description',
    'Nossa equipe está disponível para ajudar você a qualquer momento.'
  );
  
  const feature4Description = createFeatureItemDescription(
    featureGridId + '-feature-4-description',
    'Política de devolução simplificada para sua conveniência.'
  );
  
  // Featured products section
  const featuredProductsId = createId('featured-products');
  const featuredProducts: Element = {
    id: featuredProductsId,
    type: ElementTypes.section,
    x: 0,
    y: 930,
    width: 1200,
    height: 600,
    styles: {
      padding: '4rem 2rem',
      backgroundColor: '#f9fafb',
    },
    zIndex: 1,
    children: [featuredProductsId + '-header', featuredProductsId + '-grid'],
  };
  
  // Featured products header
  const featuredProductsHeader: Element = {
    id: featuredProductsId + '-header',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 1200,
    height: 100,
    styles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '3rem',
      textAlign: 'center',
    },
    zIndex: 2,
    children: [featuredProductsId + '-title', featuredProductsId + '-subtitle'],
  };
  
  // Featured products title
  const featuredProductsTitle: Element = {
    id: featuredProductsId + '-title',
    type: ElementTypes.heading,
    x: 400,
    y: 0,
    width: 400,
    height: 50,
    content: 'Produtos em Destaque',
    styles: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '0.5rem',
    },
    zIndex: 3,
  };
  
  // Featured products subtitle
  const featuredProductsSubtitle: Element = {
    id: featuredProductsId + '-subtitle',
    type: ElementTypes.paragraph,
    x: 300,
    y: 60,
    width: 600,
    height: 30,
    content: 'Conheça nossos produtos mais populares e exclusivos',
    styles: {
      fontSize: '1rem',
      color: '#6b7280',
    },
    zIndex: 3,
  };
  
  // Featured products grid
  const featuredProductsGrid: Element = {
    id: featuredProductsId + '-grid',
    type: ElementTypes.grid,
    x: 50,
    y: 120,
    width: 1100,
    height: 450,
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
    },
    zIndex: 2,
    children: [
      featuredProductsId + '-product-1',
      featuredProductsId + '-product-2',
      featuredProductsId + '-product-3',
      featuredProductsId + '-product-4',
    ],
  };
  
  // Function to create product cards
  const createProductCard = (id: string, name: string, price: string, salePrice: string | null = null): Element => ({
    id,
    type: ElementTypes.productCard,
    x: 0,
    y: 0,
    width: 250,
    height: 450,
    styles: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    },
    zIndex: 3,
    children: [id + '-image', id + '-content'],
  });
  
  // Function to create product images
  const createProductImage = (id: string, imageSrc: string): Element => ({
    id,
    type: ElementTypes.image,
    x: 0,
    y: 0,
    width: 250,
    height: 250,
    src: imageSrc,
    alt: 'Produto',
    styles: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    zIndex: 4,
  });
  
  // Function to create product content
  const createProductContent = (id: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 250,
    width: 250,
    height: 200,
    styles: {
      padding: '1.5rem',
    },
    zIndex: 4,
    children: [id + '-name', id + '-price', id + '-button'],
  });
  
  // Function to create product name
  const createProductName = (id: string, name: string): Element => ({
    id,
    type: ElementTypes.heading,
    x: 0,
    y: 0,
    width: 220,
    height: 30,
    content: name,
    styles: {
      fontSize: '1.125rem',
      fontWeight: 'semibold',
      color: '#111827',
      marginBottom: '0.5rem',
    },
    zIndex: 5,
  });
  
  // Function to create product price
  const createProductPrice = (id: string, price: string, salePrice: string | null = null): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 40,
    width: 220,
    height: 30,
    styles: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    zIndex: 5,
    children: salePrice ? [id + '-sale', id + '-original'] : [id + '-regular'],
  });
  
  // Function to create sale price
  const createSalePrice = (id: string, price: string): Element => ({
    id,
    type: ElementTypes.text,
    x: 0,
    y: 0,
    width: 80,
    height: 25,
    content: `R$ ${price}`,
    styles: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#3b82f6',
    },
    zIndex: 6,
  });
  
  // Function to create original price
  const createOriginalPrice = (id: string, price: string): Element => ({
    id,
    type: ElementTypes.text,
    x: 90,
    y: 0,
    width: 80,
    height: 25,
    content: `R$ ${price}`,
    styles: {
      fontSize: '0.875rem',
      color: '#9ca3af',
      textDecoration: 'line-through',
      marginLeft: '0.75rem',
    },
    zIndex: 6,
  });
  
  // Function to create regular price
  const createRegularPrice = (id: string, price: string): Element => ({
    id,
    type: ElementTypes.text,
    x: 0,
    y: 0,
    width: 80,
    height: 25,
    content: `R$ ${price}`,
    styles: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#111827',
    },
    zIndex: 6,
  });
  
  // Function to create add to cart button
  const createAddToCartButton = (id: string): Element => ({
    id,
    type: ElementTypes.button,
    x: 0,
    y: 80,
    width: 220,
    height: 45,
    content: 'Adicionar ao Carrinho',
    styles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '0.375rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: 'medium',
      cursor: 'pointer',
      width: '100%',
      transition: 'background-color 0.2s',
    },
    zIndex: 5,
  });
  
  // Create product cards and components
  // Product 1
  const product1 = createProductCard(featuredProductsId + '-product-1', 'Camiseta Premium', '79,90', '59,90');
  const product1Image = createProductImage(featuredProductsId + '-product-1-image', 'https://images.unsplash.com/photo-1613852348851-df1739db8201?q=80&w=1974&auto=format&fit=crop');
  const product1Content = createProductContent(featuredProductsId + '-product-1-content');
  const product1Name = createProductName(featuredProductsId + '-product-1-content-name', 'Camiseta Premium');
  const product1Price = createProductPrice(featuredProductsId + '-product-1-content-price', '79,90', '59,90');
  const product1SalePrice = createSalePrice(featuredProductsId + '-product-1-content-price-sale', '59,90');
  const product1OriginalPrice = createOriginalPrice(featuredProductsId + '-product-1-content-price-original', '79,90');
  const product1Button = createAddToCartButton(featuredProductsId + '-product-1-content-button');
  
  // Product 2
  const product2 = createProductCard(featuredProductsId + '-product-2', 'Tênis Esportivo', '299,90');
  const product2Image = createProductImage(featuredProductsId + '-product-2-image', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop');
  const product2Content = createProductContent(featuredProductsId + '-product-2-content');
  const product2Name = createProductName(featuredProductsId + '-product-2-content-name', 'Tênis Esportivo');
  const product2Price = createProductPrice(featuredProductsId + '-product-2-content-price', '299,90');
  const product2RegularPrice = createRegularPrice(featuredProductsId + '-product-2-content-price-regular', '299,90');
  const product2Button = createAddToCartButton(featuredProductsId + '-product-2-content-button');
  
  // Product 3
  const product3 = createProductCard(featuredProductsId + '-product-3', 'Bolsa Moderna', '159,90', '129,90');
  const product3Image = createProductImage(featuredProductsId + '-product-3-image', 'https://images.unsplash.com/photo-1609172795052-05bf80946f5f?q=80&w=1974&auto=format&fit=crop');
  const product3Content = createProductContent(featuredProductsId + '-product-3-content');
  const product3Name = createProductName(featuredProductsId + '-product-3-content-name', 'Bolsa Moderna');
  const product3Price = createProductPrice(featuredProductsId + '-product-3-content-price', '159,90', '129,90');
  const product3SalePrice = createSalePrice(featuredProductsId + '-product-3-content-price-sale', '129,90');
  const product3OriginalPrice = createOriginalPrice(featuredProductsId + '-product-3-content-price-original', '159,90');
  const product3Button = createAddToCartButton(featuredProductsId + '-product-3-content-button');
  
  // Product 4
  const product4 = createProductCard(featuredProductsId + '-product-4', 'Relógio Elegante', '499,90');
  const product4Image = createProductImage(featuredProductsId + '-product-4-image', 'https://images.unsplash.com/photo-1584208124561-b5b8b1403e61?q=80&w=2070&auto=format&fit=crop');
  const product4Content = createProductContent(featuredProductsId + '-product-4-content');
  const product4Name = createProductName(featuredProductsId + '-product-4-content-name', 'Relógio Elegante');
  const product4Price = createProductPrice(featuredProductsId + '-product-4-content-price', '499,90');
  const product4RegularPrice = createRegularPrice(featuredProductsId + '-product-4-content-price-regular', '499,90');
  const product4Button = createAddToCartButton(featuredProductsId + '-product-4-content-button');
  
  // Secondary promotional banner
  const secondaryBannerId = createId('secondary-banner');
  const secondaryBanner: Element = {
    id: secondaryBannerId,
    type: ElementTypes.container,
    x: 0,
    y: 1530,
    width: 1200,
    height: 400,
    styles: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#f8f9fa',
    },
    zIndex: 1,
    children: [secondaryBannerId + '-img', secondaryBannerId + '-overlay', secondaryBannerId + '-content'],
  };
  
  // Secondary banner background image
  const secondaryBannerImg: Element = {
    id: secondaryBannerId + '-img',
    type: ElementTypes.image,
    x: 0,
    y: 0,
    width: 1200,
    height: 400,
    src: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
    alt: 'Banner secundário',
    styles: {
      objectFit: 'cover',
      width: '100%',
      height: '100%',
    },
    zIndex: 1,
  };
  
  // Secondary banner overlay
  const secondaryBannerOverlay: Element = {
    id: secondaryBannerId + '-overlay',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 1200,
    height: 400,
    styles: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    zIndex: 2,
  };
  
  // Secondary banner content container (right aligned)
  const secondaryBannerContent: Element = {
    id: secondaryBannerId + '-content',
    type: ElementTypes.container,
    x: 600,
    y: 100,
    width: 550,
    height: 200,
    styles: {
      position: 'absolute',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: 'white',
    },
    zIndex: 3,
    children: [
      secondaryBannerId + '-subtitle',
      secondaryBannerId + '-title',
      secondaryBannerId + '-description',
      secondaryBannerId + '-button',
    ],
  };
  
  // Secondary banner subtitle
  const secondaryBannerSubtitle: Element = {
    id: secondaryBannerId + '-subtitle',
    type: ElementTypes.text,
    x: 0,
    y: 0,
    width: 200,
    height: 30,
    content: 'Tempo Limitado',
    styles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.25rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: 500,
      marginBottom: '1rem',
      display: 'inline-block',
    },
    zIndex: 4,
  };
  
  // Secondary banner title
  const secondaryBannerTitle: Element = {
    id: secondaryBannerId + '-title',
    type: ElementTypes.heading,
    x: 0,
    y: 40,
    width: 500,
    height: 50,
    content: 'Oferta Especial',
    styles: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: 'white',
    },
    zIndex: 4,
  };
  
  // Secondary banner description
  const secondaryBannerDescription: Element = {
    id: secondaryBannerId + '-description',
    type: ElementTypes.paragraph,
    x: 0,
    y: 100,
    width: 500,
    height: 50,
    content: 'Até 50% de desconto em produtos selecionados. Aproveite enquanto dura!',
    styles: {
      fontSize: '1rem',
      marginBottom: '1.5rem',
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: 1.6,
    },
    zIndex: 4,
  };
  
  // Secondary banner button
  const secondaryBannerButton: Element = {
    id: secondaryBannerId + '-button',
    type: ElementTypes.button,
    x: 0,
    y: 160,
    width: 150,
    height: 45,
    content: 'Ver Ofertas',
    styles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '1rem',
    },
    zIndex: 4,
  };
  
  // Categories section
  const categoriesId = createId('categories');
  const categories: Element = {
    id: categoriesId,
    type: ElementTypes.section,
    x: 0,
    y: 1930,
    width: 1200,
    height: 600,
    styles: {
      padding: '4rem 2rem',
      backgroundColor: 'white',
    },
    zIndex: 1,
    children: [categoriesId + '-header', categoriesId + '-grid'],
  };
  
  // Categories header
  const categoriesHeader: Element = {
    id: categoriesId + '-header',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 1200,
    height: 100,
    styles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '3rem',
      textAlign: 'center',
    },
    zIndex: 2,
    children: [categoriesId + '-title', categoriesId + '-subtitle'],
  };
  
  // Categories title
  const categoriesTitle: Element = {
    id: categoriesId + '-title',
    type: ElementTypes.heading,
    x: 400,
    y: 0,
    width: 400,
    height: 50,
    content: 'Explore Nossas Categorias',
    styles: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '0.5rem',
    },
    zIndex: 3,
  };
  
  // Categories subtitle
  const categoriesSubtitle: Element = {
    id: categoriesId + '-subtitle',
    type: ElementTypes.paragraph,
    x: 300,
    y: 60,
    width: 600,
    height: 30,
    content: 'Encontre o que você procura',
    styles: {
      fontSize: '1rem',
      color: '#6b7280',
    },
    zIndex: 3,
  };
  
  // Categories grid
  const categoriesGrid: Element = {
    id: categoriesId + '-grid',
    type: ElementTypes.grid,
    x: 50,
    y: 120,
    width: 1100,
    height: 450,
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
    },
    zIndex: 2,
    children: [
      categoriesId + '-category-1',
      categoriesId + '-category-2',
      categoriesId + '-category-3',
      categoriesId + '-category-4',
    ],
  };
  
  // Function to create category cards
  const createCategoryCard = (id: string, name: string, imageSrc: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 250,
    height: 450,
    styles: {
      position: 'relative',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
    },
    zIndex: 3,
    children: [id + '-image', id + '-overlay', id + '-content'],
  });
  
  // Function to create category images
  const createCategoryImage = (id: string, imageSrc: string): Element => ({
    id,
    type: ElementTypes.image,
    x: 0,
    y: 0,
    width: 250,
    height: 450,
    src: imageSrc,
    alt: 'Categoria',
    styles: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease',
    },
    zIndex: 3,
  });
  
  // Function to create category overlay
  const createCategoryOverlay = (id: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 250,
    height: 450,
    styles: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 50%)',
    },
    zIndex: 4,
  });
  
  // Function to create category content
  const createCategoryContent = (id: string, name: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 350,
    width: 250,
    height: 100,
    styles: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      padding: '1.5rem',
      zIndex: 10,
    },
    zIndex: 5,
    children: [id + '-name', id + '-link'],
  });
  
  // Function to create category name
  const createCategoryName = (id: string, name: string): Element => ({
    id,
    type: ElementTypes.heading,
    x: 0,
    y: 0,
    width: 220,
    height: 30,
    content: name,
    styles: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem',
    },
    zIndex: 6,
  });
  
  // Function to create category link
  const createCategoryLink = (id: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 40,
    width: 220,
    height: 30,
    styles: {
      display: 'flex',
      alignItems: 'center',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: 'medium',
    },
    zIndex: 6,
    children: [id + '-text', id + '-icon'],
  });
  
  // Function to create category link text
  const createCategoryLinkText = (id: string): Element => ({
    id,
    type: ElementTypes.text,
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    content: 'Ver produtos',
    styles: {
      color: 'white',
      fontSize: '0.875rem',
    },
    zIndex: 7,
  });
  
  // Function to create category link icon
  const createCategoryLinkIcon = (id: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 105,
    y: 0,
    width: 16,
    height: 16,
    styles: {
      marginLeft: '0.5rem',
      color: 'white',
    },
    zIndex: 7,
  });
  
  // Create category cards
  // Category 1 - Roupas
  const category1 = createCategoryCard(categoriesId + '-category-1', 'Roupas', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070');
  const category1Image = createCategoryImage(categoriesId + '-category-1-image', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070');
  const category1Overlay = createCategoryOverlay(categoriesId + '-category-1-overlay');
  const category1Content = createCategoryContent(categoriesId + '-category-1-content', 'Roupas');
  const category1Name = createCategoryName(categoriesId + '-category-1-content-name', 'Roupas');
  const category1Link = createCategoryLink(categoriesId + '-category-1-content-link');
  const category1LinkText = createCategoryLinkText(categoriesId + '-category-1-content-link-text');
  const category1LinkIcon = createCategoryLinkIcon(categoriesId + '-category-1-content-link-icon');
  
  // Category 2 - Calçados
  const category2 = createCategoryCard(categoriesId + '-category-2', 'Calçados', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012');
  const category2Image = createCategoryImage(categoriesId + '-category-2-image', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012');
  const category2Overlay = createCategoryOverlay(categoriesId + '-category-2-overlay');
  const category2Content = createCategoryContent(categoriesId + '-category-2-content', 'Calçados');
  const category2Name = createCategoryName(categoriesId + '-category-2-content-name', 'Calçados');
  const category2Link = createCategoryLink(categoriesId + '-category-2-content-link');
  const category2LinkText = createCategoryLinkText(categoriesId + '-category-2-content-link-text');
  const category2LinkIcon = createCategoryLinkIcon(categoriesId + '-category-2-content-link-icon');
  
  // Category 3 - Acessórios
  const category3 = createCategoryCard(categoriesId + '-category-3', 'Acessórios', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935');
  const category3Image = createCategoryImage(categoriesId + '-category-3-image', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935');
  const category3Overlay = createCategoryOverlay(categoriesId + '-category-3-overlay');
  const category3Content = createCategoryContent(categoriesId + '-category-3-content', 'Acessórios');
  const category3Name = createCategoryName(categoriesId + '-category-3-content-name', 'Acessórios');
  const category3Link = createCategoryLink(categoriesId + '-category-3-content-link');
  const category3LinkText = createCategoryLinkText(categoriesId + '-category-3-content-link-text');
  const category3LinkIcon = createCategoryLinkIcon(categoriesId + '-category-3-content-link-icon');
  
  // Category 4 - Eletrônicos
  const category4 = createCategoryCard(categoriesId + '-category-4', 'Eletrônicos', 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=2080');
  const category4Image = createCategoryImage(categoriesId + '-category-4-image', 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=2080');
  const category4Overlay = createCategoryOverlay(categoriesId + '-category-4-overlay');
  const category4Content = createCategoryContent(categoriesId + '-category-4-content', 'Eletrônicos');
  const category4Name = createCategoryName(categoriesId + '-category-4-content-name', 'Eletrônicos');
  const category4Link = createCategoryLink(categoriesId + '-category-4-content-link');
  const category4LinkText = createCategoryLinkText(categoriesId + '-category-4-content-link-text');
  const category4LinkIcon = createCategoryLinkIcon(categoriesId + '-category-4-content-link-icon');
  
  // Testimonials section
  const testimonialsId = createId('testimonials');
  const testimonials: Element = {
    id: testimonialsId,
    type: ElementTypes.section,
    x: 0,
    y: 2530,
    width: 1200,
    height: 500,
    styles: {
      padding: '4rem 2rem',
      backgroundColor: '#f9fafb',
    },
    zIndex: 1,
    children: [testimonialsId + '-header', testimonialsId + '-carousel'],
  };
  
  // Testimonials header
  const testimonialsHeader: Element = {
    id: testimonialsId + '-header',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 1200,
    height: 100,
    styles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '3rem',
      textAlign: 'center',
    },
    zIndex: 2,
    children: [testimonialsId + '-title', testimonialsId + '-subtitle'],
  };
  
  // Testimonials title
  const testimonialsTitle: Element = {
    id: testimonialsId + '-title',
    type: ElementTypes.heading,
    x: 400,
    y: 0,
    width: 400,
    height: 50,
    content: 'O Que Nossos Clientes Dizem',
    styles: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '0.5rem',
    },
    zIndex: 3,
  };
  
  // Testimonials subtitle
  const testimonialsSubtitle: Element = {
    id: testimonialsId + '-subtitle',
    type: ElementTypes.paragraph,
    x: 300,
    y: 60,
    width: 600,
    height: 30,
    content: 'Opiniões de quem já comprou conosco',
    styles: {
      fontSize: '1rem',
      color: '#6b7280',
    },
    zIndex: 3,
  };
  
  // Testimonials carousel
  const testimonialsCarousel: Element = {
    id: testimonialsId + '-carousel',
    type: ElementTypes.carousel,
    x: 100,
    y: 120,
    width: 1000,
    height: 350,
    styles: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    zIndex: 2,
    children: [
      testimonialsId + '-testimonial-1',
      testimonialsId + '-testimonial-2',
      testimonialsId + '-testimonial-3',
    ],
  };
  
  // Function to create testimonial cards
  const createTestimonialCard = (id: string, author: string, role: string, content: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 320,
    height: 320,
    styles: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      marginRight: '2rem',
    },
    zIndex: 3,
    children: [id + '-rating', id + '-content', id + '-author-container'],
  });
  
  // Function to create testimonial rating
  const createTestimonialRating = (id: string, rating: number): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 280,
    height: 24,
    styles: {
      display: 'flex',
      marginBottom: '1rem',
      color: '#fbbf24',
    },
    zIndex: 4,
  });
  
  // Function to create testimonial content
  const createTestimonialContent = (id: string, content: string): Element => ({
    id,
    type: ElementTypes.paragraph,
    x: 0,
    y: 34,
    width: 280,
    height: 180,
    content,
    styles: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#4b5563',
      marginBottom: '1.5rem',
      flex: 1,
      fontStyle: 'italic',
    },
    zIndex: 4,
  });
  
  // Function to create testimonial author container
  const createTestimonialAuthorContainer = (id: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 220,
    width: 280,
    height: 60,
    styles: {
      display: 'flex',
      flexDirection: 'column',
    },
    zIndex: 4,
    children: [id + '-name', id + '-role'],
  });
  
  // Function to create testimonial author name
  const createTestimonialAuthorName = (id: string, author: string): Element => ({
    id,
    type: ElementTypes.heading,
    x: 0,
    y: 0,
    width: 280,
    height: 30,
    content: author,
    styles: {
      fontSize: '1.125rem',
      fontWeight: 'semibold',
      color: '#111827',
    },
    zIndex: 5,
  });
  
  // Function to create testimonial author role
  const createTestimonialAuthorRole = (id: string, role: string): Element => ({
    id,
    type: ElementTypes.text,
    x: 0,
    y: 30,
    width: 280,
    height: 20,
    content: role,
    styles: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    zIndex: 5,
  });
  
  // Create testimonial cards
  // Testimonial 1
  const testimonial1 = createTestimonialCard(
    testimonialsId + '-testimonial-1',
    'Ana Silva',
    'Cliente Fidelizada',
    'Produtos incríveis e atendimento excepcional! Compro nesta loja há anos e nunca me decepcionei. Recomendo a todos meus amigos e familiares.'
  );
  const testimonial1Rating = createTestimonialRating(testimonialsId + '-testimonial-1-rating', 5);
  const testimonial1Content = createTestimonialContent(
    testimonialsId + '-testimonial-1-content',
    'Produtos incríveis e atendimento excepcional! Compro nesta loja há anos e nunca me decepcionei. Recomendo a todos meus amigos e familiares.'
  );
  const testimonial1AuthorContainer = createTestimonialAuthorContainer(testimonialsId + '-testimonial-1-author-container');
  const testimonial1AuthorName = createTestimonialAuthorName(testimonialsId + '-testimonial-1-author-container-name', 'Ana Silva');
  const testimonial1AuthorRole = createTestimonialAuthorRole(testimonialsId + '-testimonial-1-author-container-role', 'Cliente Fidelizada');
  
  // Testimonial 2
  const testimonial2 = createTestimonialCard(
    testimonialsId + '-testimonial-2',
    'Rafael Souza',
    'Cliente Novo',
    'Primeira compra e já posso dizer que superou minhas expectativas. Entrega rápida e produto conforme descrito no site. Certamente voltarei a comprar.'
  );
  const testimonial2Rating = createTestimonialRating(testimonialsId + '-testimonial-2-rating', 4);
  const testimonial2Content = createTestimonialContent(
    testimonialsId + '-testimonial-2-content',
    'Primeira compra e já posso dizer que superou minhas expectativas. Entrega rápida e produto conforme descrito no site. Certamente voltarei a comprar.'
  );
  const testimonial2AuthorContainer = createTestimonialAuthorContainer(testimonialsId + '-testimonial-2-author-container');
  const testimonial2AuthorName = createTestimonialAuthorName(testimonialsId + '-testimonial-2-author-container-name', 'Rafael Souza');
  const testimonial2AuthorRole = createTestimonialAuthorRole(testimonialsId + '-testimonial-2-author-container-role', 'Cliente Novo');
  
  // Testimonial 3
  const testimonial3 = createTestimonialCard(
    testimonialsId + '-testimonial-3',
    'Carla Mendes',
    'Cliente Frequente',
    'Preços competitivos e variedade de produtos incomparável. O serviço de atendimento ao cliente responde rápido e resolve qualquer problema eficientemente.'
  );
  const testimonial3Rating = createTestimonialRating(testimonialsId + '-testimonial-3-rating', 5);
  const testimonial3Content = createTestimonialContent(
    testimonialsId + '-testimonial-3-content',
    'Preços competitivos e variedade de produtos incomparável. O serviço de atendimento ao cliente responde rápido e resolve qualquer problema eficientemente.'
  );
  const testimonial3AuthorContainer = createTestimonialAuthorContainer(testimonialsId + '-testimonial-3-author-container');
  const testimonial3AuthorName = createTestimonialAuthorName(testimonialsId + '-testimonial-3-author-container-name', 'Carla Mendes');
  const testimonial3AuthorRole = createTestimonialAuthorRole(testimonialsId + '-testimonial-3-author-container-role', 'Cliente Frequente');
  
  // Newsletter section
  const newsletterId = createId('newsletter');
  const newsletter: Element = {
    id: newsletterId,
    type: ElementTypes.section,
    x: 0,
    y: 3030,
    width: 1200,
    height: 300,
    styles: {
      padding: '4rem 2rem',
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    zIndex: 1,
    children: [newsletterId + '-container'],
  };
  
  // Newsletter container
  const newsletterContainer: Element = {
    id: newsletterId + '-container',
    type: ElementTypes.container,
    x: 200,
    y: 0,
    width: 800,
    height: 220,
    styles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    zIndex: 2,
    children: [newsletterId + '-title', newsletterId + '-subtitle', newsletterId + '-form'],
  };
  
  // Newsletter title
  const newsletterTitle: Element = {
    id: newsletterId + '-title',
    type: ElementTypes.heading,
    x: 0,
    y: 0,
    width: 800,
    height: 50,
    content: 'Inscreva-se em nossa newsletter',
    styles: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem',
    },
    zIndex: 3,
  };
  
  // Newsletter subtitle
  const newsletterSubtitle: Element = {
    id: newsletterId + '-subtitle',
    type: ElementTypes.paragraph,
    x: 100,
    y: 60,
    width: 600,
    height: 30,
    content: 'Fique por dentro das novidades, lançamentos e ofertas exclusivas.',
    styles: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '2rem',
    },
    zIndex: 3,
  };
  
  // Newsletter form
  const newsletterForm: Element = {
    id: newsletterId + '-form',
    type: ElementTypes.form,
    x: 150,
    y: 100,
    width: 500,
    height: 60,
    styles: {
      display: 'flex',
      width: '100%',
      maxWidth: '500px',
      gap: '1rem',
    },
    zIndex: 3,
    children: [newsletterId + '-input', newsletterId + '-button'],
  };
  
  // Newsletter input
  const newsletterInput: Element = {
    id: newsletterId + '-input',
    type: ElementTypes.input,
    x: 0,
    y: 0,
    width: 350,
    height: 60,
    content: '',
    styles: {
      flex: 1,
      padding: '1rem',
      fontSize: '1rem',
      borderRadius: '0.375rem',
      border: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
    },
    zIndex: 4,
  };
  
  // Newsletter button
  const newsletterButton: Element = {
    id: newsletterId + '-button',
    type: ElementTypes.button,
    x: 360,
    y: 0,
    width: 140,
    height: 60,
    content: 'Inscrever-se',
    styles: {
      padding: '1rem 1.5rem',
      fontWeight: 'medium',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      color: '#3b82f6',
      border: 'none',
      cursor: 'pointer',
    },
    zIndex: 4,
  };
  
  // Footer section
  const footerId = createId('footer');
  const footer: Element = {
    id: footerId,
    type: ElementTypes.footer,
    x: 0,
    y: 3330,
    width: 1200,
    height: 500,
    styles: {
      padding: '4rem 2rem 2rem',
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
    },
    zIndex: 1,
    children: [footerId + '-main', footerId + '-bottom'],
  };
  
  // Footer main container
  const footerMain: Element = {
    id: footerId + '-main',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 1200,
    height: 350,
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      marginBottom: '3rem',
    },
    zIndex: 2,
    children: [
      footerId + '-company',
      footerId + '-links-1',
      footerId + '-links-2',
      footerId + '-links-3',
    ],
  };
  
  // Footer company container
  const footerCompany: Element = {
    id: footerId + '-company',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 280,
    height: 350,
    styles: {},
    zIndex: 3,
    children: [footerId + '-logo', footerId + '-tagline', footerId + '-social'],
  };
  
  // Footer logo container
  const footerLogo: Element = {
    id: footerId + '-logo',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 280,
    height: 50,
    styles: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    zIndex: 4,
    children: [footerId + '-logo-icon', footerId + '-logo-text'],
  };
  
  // Footer logo icon
  const footerLogoIcon: Element = {
    id: footerId + '-logo-icon',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    styles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '0.375rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.75rem',
      fontWeight: 'bold',
    },
    zIndex: 5,
    content: 'N',
  };
  
  // Footer logo text
  const footerLogoText: Element = {
    id: footerId + '-logo-text',
    type: ElementTypes.heading,
    x: 50,
    y: 0,
    width: 220,
    height: 30,
    content: 'NextGen Shop',
    styles: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
    },
    zIndex: 5,
  };
  
  // Footer tagline
  const footerTagline: Element = {
    id: footerId + '-tagline',
    type: ElementTypes.paragraph,
    x: 0,
    y: 60,
    width: 280,
    height: 60,
    content: 'Sua loja online para produtos de qualidade.',
    styles: {
      fontSize: '1rem',
      color: '#6b7280',
      lineHeight: 1.6,
      marginBottom: '1.5rem',
    },
    zIndex: 4,
  };
  
  // Footer social
  const footerSocial: Element = {
    id: footerId + '-social',
    type: ElementTypes.container,
    x: 0,
    y: 130,
    width: 280,
    height: 40,
    styles: {
      display: 'flex',
      gap: '1rem',
    },
    zIndex: 4,
    children: [
      footerId + '-social-facebook',
      footerId + '-social-instagram',
      footerId + '-social-twitter',
    ],
  };
  
  // Footer social icons
  const footerSocialFacebook: Element = {
    id: footerId + '-social-facebook',
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    styles: {
      width: '40px',
      height: '40px',
      borderRadius: '9999px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#374151',
      cursor: 'pointer',
    },
    zIndex: 5,
  };
  
  const footerSocialInstagram: Element = {
    id: footerId + '-social-instagram',
    type: ElementTypes.container,
    x: 50,
    y: 0,
    width: 40,
    height: 40,
    styles: {
      width: '40px',
      height: '40px',
      borderRadius: '9999px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#374151',
      cursor: 'pointer',
    },
    zIndex: 5,
  };
  
  const footerSocialTwitter: Element = {
    id: footerId + '-social-twitter',
    type: ElementTypes.container,
    x: 100,
    y: 0,
    width: 40,
    height: 40,
    styles: {
      width: '40px',
      height: '40px',
      borderRadius: '9999px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#374151',
      cursor: 'pointer',
    },
    zIndex: 5,
  };
  
  // Function to create footer link columns
  const createFooterLinkColumn = (id: string, title: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 0,
    width: 280,
    height: 350,
    styles: {},
    zIndex: 3,
    children: [id + '-title', id + '-links'],
  });
  
  // Function to create footer link column title
  const createFooterLinkColumnTitle = (id: string, title: string): Element => ({
    id,
    type: ElementTypes.heading,
    x: 0,
    y: 0,
    width: 280,
    height: 30,
    content: title,
    styles: {
      fontSize: '1.25rem',
      fontWeight: 'semibold',
      color: '#111827',
      marginBottom: '1.5rem',
    },
    zIndex: 4,
  });
  
  // Function to create footer links container
  const createFooterLinks = (id: string): Element => ({
    id,
    type: ElementTypes.container,
    x: 0,
    y: 40,
    width: 280,
    height: 300,
    styles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    zIndex: 4,
    children: [id + '-item-1', id + '-item-2', id + '-item-3', id + '-item-4'],
  });
  
  // Function to create footer link items
  const createFooterLinkItem = (id: string, label: string): Element => ({
    id,
    type: ElementTypes.text,
    x: 0,
    y: 0,
    width: 280,
    height: 24,
    content: label,
    styles: {
      fontSize: '1rem',
      color: '#6b7280',
      cursor: 'pointer',
    },
    zIndex: 5,
  });
  
  // Create footer link columns
  // Column 1 - Informações
  const footerLinks1 = createFooterLinkColumn(footerId + '-links-1', 'Informações');
  const footerLinks1Title = createFooterLinkColumnTitle(footerId + '-links-1-title', 'Informações');
  const footerLinks1Links = createFooterLinks(footerId + '-links-1-links');
  const footerLinks1Item1 = createFooterLinkItem(footerId + '-links-1-links-item-1', 'Sobre Nós');
  const footerLinks1Item2 = createFooterLinkItem(footerId + '-links-1-links-item-2', 'Contato');
  const footerLinks1Item3 = createFooterLinkItem(footerId + '-links-1-links-item-3', 'Perguntas Frequentes');
  const footerLinks1Item4 = createFooterLinkItem(footerId + '-links-1-links-item-4', 'Blog');
  
  // Column 2 - Atendimento
  const footerLinks2 = createFooterLinkColumn(footerId + '-links-2', 'Atendimento');
  const footerLinks2Title = createFooterLinkColumnTitle(footerId + '-links-2-title', 'Atendimento');
  const footerLinks2Links = createFooterLinks(footerId + '-links-2-links');
  const footerLinks2Item1 = createFooterLinkItem(footerId + '-links-2-links-item-1', 'Meus Pedidos');
  const footerLinks2Item2 = createFooterLinkItem(footerId + '-links-2-links-item-2', 'Entrega e Frete');
  const footerLinks2Item3 = createFooterLinkItem(footerId + '-links-2-links-item-3', 'Trocas e Devoluções');
  const footerLinks2Item4 = createFooterLinkItem(footerId + '-links-2-links-item-4', 'Garantia');
  
  // Column 3 - Legal
  const footerLinks3 = createFooterLinkColumn(footerId + '-links-3', 'Legal');
  const footerLinks3Title = createFooterLinkColumnTitle(footerId + '-links-3-title', 'Legal');
  const footerLinks3Links = createFooterLinks(footerId + '-links-3-links');
  const footerLinks3Item1 = createFooterLinkItem(footerId + '-links-3-links-item-1', 'Termos de Serviço');
  const footerLinks3Item2 = createFooterLinkItem(footerId + '-links-3-links-item-2', 'Política de Privacidade');
  const footerLinks3Item3 = createFooterLinkItem(footerId + '-links-3-links-item-3', 'Política de Cookies');
  const footerLinks3Item4 = createFooterLinkItem(footerId + '-links-3-links-item-4', 'Política de Envio');
  
  // Footer bottom container
  const footerBottom: Element = {
    id: footerId + '-bottom',
    type: ElementTypes.container,
    x: 0,
    y: 360,
    width: 1200,
    height: 60,
    styles: {
      borderTop: '1px solid #e5e7eb',
      paddingTop: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    zIndex: 2,
    children: [footerId + '-copyright', footerId + '-bottom-links'],
  };
  
  // Footer copyright
  const footerCopyright: Element = {
    id: footerId + '-copyright',
    type: ElementTypes.text,
    x: 0,
    y: 0,
    width: 600,
    height: 24,
    content: `© ${new Date().getFullYear()} NextGen Shop. Todos os direitos reservados.`,
    styles: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    zIndex: 3,
  };
  
  // Footer bottom links
  const footerBottomLinks: Element = {
    id: footerId + '-bottom-links',
    type: ElementTypes.container,
    x: 700,
    y: 0,
    width: 300,
    height: 24,
    styles: {
      display: 'flex',
      gap: '1.5rem',
    },
    zIndex: 3,
    children: [footerId + '-bottom-link-1', footerId + '-bottom-link-2'],
  };
  
  // Footer bottom link items
  const footerBottomLink1: Element = {
    id: footerId + '-bottom-link-1',
    type: ElementTypes.text,
    x: 0,
    y: 0,
    width: 140,
    height: 24,
    content: 'Termos de Serviço',
    styles: {
      fontSize: '0.875rem',
      color: '#6b7280',
      cursor: 'pointer',
    },
    zIndex: 4,
  };
  
  const footerBottomLink2: Element = {
    id: footerId + '-bottom-link-2',
    type: ElementTypes.text,
    x: 150,
    y: 0,
    width: 150,
    height: 24,
    content: 'Política de Privacidade',
    styles: {
      fontSize: '0.875rem',
      color: '#6b7280',
      cursor: 'pointer',
    },
    zIndex: 4,
  };
  
  // Concatenate all elements to form the complete e-commerce page
  return [
    // Header and navigation
    headerElement,
    logoElement,
    navElement,
    navItem1,
    navItem2,
    navItem3,
    navItem4,
    navItem5,
    navItem6,
    
    // Main banner
    mainBanner,
    mainBannerImg,
    mainBannerOverlay,
    mainBannerContent,
    mainBannerSubtitle,
    mainBannerTitle,
    mainBannerDescription,
    mainBannerButton,
    
    // Feature grid
    featureGrid,
    featureGridContainer,
    feature1, feature2, feature3, feature4,
    feature1Icon, feature2Icon, feature3Icon, feature4Icon,
    feature1Title, feature2Title, feature3Title, feature4Title,
    feature1Description, feature2Description, feature3Description, feature4Description,
    
    // Featured products
    featuredProducts,
    featuredProductsHeader,
    featuredProductsTitle,
    featuredProductsSubtitle,
    featuredProductsGrid,
    product1, product2, product3, product4,
    product1Image, product2Image, product3Image, product4Image,
    product1Content, product2Content, product3Content, product4Content,
    product1Name, product2Name, product3Name, product4Name,
    product1Price, product2Price, product3Price, product4Price,
    product1SalePrice, product1OriginalPrice,
    product2RegularPrice,
    product3SalePrice, product3OriginalPrice,
    product4RegularPrice,
    product1Button, product2Button, product3Button, product4Button,
    
    // Secondary banner
    secondaryBanner,
    secondaryBannerImg,
    secondaryBannerOverlay,
    secondaryBannerContent,
    secondaryBannerSubtitle,
    secondaryBannerTitle,
    secondaryBannerDescription,
    secondaryBannerButton,
    
    // Categories
    categories,
    categoriesHeader,
    categoriesTitle,
    categoriesSubtitle,
    categoriesGrid,
    category1, category2, category3, category4,
    category1Image, category2Image, category3Image, category4Image,
    category1Overlay, category2Overlay, category3Overlay, category4Overlay,
    category1Content, category2Content, category3Content, category4Content,
    category1Name, category2Name, category3Name, category4Name,
    category1Link, category2Link, category3Link, category4Link,
    category1LinkText, category2LinkText, category3LinkText, category4LinkText,
    category1LinkIcon, category2LinkIcon, category3LinkIcon, category4LinkIcon,
    
    // Testimonials
    testimonials,
    testimonialsHeader,
    testimonialsTitle,
    testimonialsSubtitle,
    testimonialsCarousel,
    testimonial1, testimonial2, testimonial3,
    testimonial1Rating, testimonial2Rating, testimonial3Rating,
    testimonial1Content, testimonial2Content, testimonial3Content,
    testimonial1AuthorContainer, testimonial2AuthorContainer, testimonial3AuthorContainer,
    testimonial1AuthorName, testimonial2AuthorName, testimonial3AuthorName,
    testimonial1AuthorRole, testimonial2AuthorRole, testimonial3AuthorRole,
    
    // Newsletter
    newsletter,
    newsletterContainer,
    newsletterTitle,
    newsletterSubtitle,
    newsletterForm,
    newsletterInput,
    newsletterButton,
    
    // Footer
    footer,
    footerMain, footerBottom,
    footerCompany,
    footerLogo, footerLogoIcon, footerLogoText,
    footerTagline,
    footerSocial, footerSocialFacebook, footerSocialInstagram, footerSocialTwitter,
    footerLinks1, footerLinks2, footerLinks3,
    footerLinks1Title, footerLinks2Title, footerLinks3Title,
    footerLinks1Links, footerLinks2Links, footerLinks3Links,
    footerLinks1Item1, footerLinks1Item2, footerLinks1Item3, footerLinks1Item4,
    footerLinks2Item1, footerLinks2Item2, footerLinks2Item3, footerLinks2Item4,
    footerLinks3Item1, footerLinks3Item2, footerLinks3Item3, footerLinks3Item4,
    footerCopyright, footerBottomLinks, footerBottomLink1, footerBottomLink2,
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
        name: 'Loja Online NextGen',
        description: 'Template completo e profissional para e-commerce com seções modulares e alto nível de personalização.',
        thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'ecommerce',
        elements: createEcommercePageElements(),
      },
      {
        id: 'ecommerce-2',
        name: 'Marketplace Avançado',
        description: 'Plataforma multivendor para criar seu próprio marketplace, com layouts modernos e responsivos.',
        thumbnail: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
        category: 'ecommerce',
        elements: createEcommercePageElements(),
      },
      {
        id: 'ecommerce-3',
        name: 'Loja de Moda',
        description: 'Template especializado para moda e vestuário, com carrosséis de produtos e seções de categorias.',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop&w=300&q=80',
        category: 'ecommerce',
        elements: createEcommercePageElements(),
      },
      {
        id: 'ecommerce-4',
        name: 'E-commerce Minimalista',
        description: 'Design clean e elegante, perfeito para marcas premium que valorizam simplicidade.',
        thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop&w=300&q=80',
        category: 'ecommerce',
        elements: createEcommercePageElements(),
      },
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
