export enum ElementTypes {
  container = 'container',
  text = 'text',
  heading = 'heading',
  paragraph = 'paragraph',
  button = 'button',
  image = 'image',
  video = 'video',
  icon = 'icon',
  grid = 'grid',
  flexbox = 'flexbox',
  section = 'section',
  divider = 'divider',
  input = 'input',
  checkbox = 'checkbox',
  select = 'select',
  form = 'form',
  productCard = 'productCard',
  cart = 'cart',
  checkout = 'checkout',
  productGallery = 'productGallery',
  carousel = 'carousel',
}

export interface ElementType {
  type: ElementTypes;
  name: string;
  icon: string;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultContent?: string;
  defaultStyles?: Record<string, any>;
}

export const elementTypes: Record<string, ElementType> = {
  container: {
    type: ElementTypes.container,
    name: 'Div / Container',
    icon: '□',
    defaultWidth: 300,
    defaultHeight: 200,
    defaultStyles: {
      backgroundColor: '#f5f5f5',
      border: '1px solid #e0e0e0',
      borderRadius: '4px'
    }
  },
  text: {
    type: ElementTypes.text,
    name: 'Texto',
    icon: 'T',
    defaultWidth: 200,
    defaultHeight: 50,
    defaultContent: 'Texto de exemplo',
    defaultStyles: {
      fontSize: '16px',
      color: '#333333'
    }
  },
  heading: {
    type: ElementTypes.heading,
    name: 'Título',
    icon: 'H',
    defaultWidth: 300,
    defaultHeight: 60,
    defaultContent: 'Título principal',
    defaultStyles: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111111'
    }
  },
  paragraph: {
    type: ElementTypes.paragraph,
    name: 'Parágrafo',
    icon: '¶',
    defaultWidth: 400,
    defaultHeight: 80,
    defaultContent: 'Este é um texto de exemplo para o parágrafo. Você pode editar este conteúdo conforme necessário.',
    defaultStyles: {
      fontSize: '16px',
      lineHeight: '1.5',
      color: '#444444'
    }
  },
  button: {
    type: ElementTypes.button,
    name: 'Botão',
    icon: 'B',
    defaultWidth: 120,
    defaultHeight: 40,
    defaultContent: 'Botão',
    defaultStyles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  image: {
    type: ElementTypes.image,
    name: 'Imagem',
    icon: '🖼️',
    defaultWidth: 300,
    defaultHeight: 200,
    defaultStyles: {
      objectFit: 'cover',
      borderRadius: '4px'
    }
  },
  video: {
    type: ElementTypes.video,
    name: 'Vídeo',
    icon: '▶️',
    defaultWidth: 400,
    defaultHeight: 225,
    defaultStyles: {
      backgroundColor: '#f0f0f0',
      borderRadius: '4px'
    }
  },
  icon: {
    type: ElementTypes.icon,
    name: 'Ícone',
    icon: '⚡',
    defaultWidth: 32,
    defaultHeight: 32,
    defaultStyles: {
      color: '#3b82f6'
    }
  },
  grid: {
    type: ElementTypes.grid,
    name: 'Grid',
    icon: '⊞',
    defaultWidth: 400,
    defaultHeight: 300,
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px'
    }
  },
  flexbox: {
    type: ElementTypes.flexbox,
    name: 'Flexbox',
    icon: '≡',
    defaultWidth: 400,
    defaultHeight: 150,
    defaultStyles: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  },
  section: {
    type: ElementTypes.section,
    name: 'Seção',
    icon: '§',
    defaultWidth: 500,
    defaultHeight: 300,
    defaultStyles: {
      padding: '32px',
      backgroundColor: '#f9fafb'
    }
  },
  divider: {
    type: ElementTypes.divider,
    name: 'Divisor',
    icon: '―',
    defaultWidth: 400,
    defaultHeight: 1,
    defaultStyles: {
      backgroundColor: '#e5e7eb',
      height: '1px'
    }
  },
  input: {
    type: ElementTypes.input,
    name: 'Campo de texto',
    icon: '⌨️',
    defaultWidth: 300,
    defaultHeight: 40,
    defaultStyles: {
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '8px 12px',
      backgroundColor: 'white'
    }
  },
  checkbox: {
    type: ElementTypes.checkbox,
    name: 'Checkbox',
    icon: '☑️',
    defaultWidth: 24,
    defaultHeight: 24,
    defaultStyles: {
      accentColor: '#3b82f6'
    }
  },
  select: {
    type: ElementTypes.select,
    name: 'Seletor',
    icon: '▼',
    defaultWidth: 300,
    defaultHeight: 40,
    defaultStyles: {
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '8px 12px',
      backgroundColor: 'white'
    }
  },
  form: {
    type: ElementTypes.form,
    name: 'Formulário',
    icon: '📝',
    defaultWidth: 400,
    defaultHeight: 300,
    defaultStyles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '24px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px'
    }
  },
  productCard: {
    type: ElementTypes.productCard,
    name: 'Produto',
    icon: '🛍️',
    defaultWidth: 250,
    defaultHeight: 350,
    defaultStyles: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }
  },
  cart: {
    type: ElementTypes.cart,
    name: 'Carrinho',
    icon: '🛒',
    defaultWidth: 400,
    defaultHeight: 450,
    defaultStyles: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px'
    }
  },
  checkout: {
    type: ElementTypes.checkout,
    name: 'Pagamento',
    icon: '💳',
    defaultWidth: 500,
    defaultHeight: 600,
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  },
  productGallery: {
    type: ElementTypes.productGallery,
    name: 'Galeria de Produtos',
    icon: '🏪',
    defaultWidth: 800,
    defaultHeight: 400,
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px'
    }
  },
  carousel: {
    type: ElementTypes.carousel,
    name: 'Carrossel',
    icon: '🔄',
    defaultWidth: 800,
    defaultHeight: 400,
    defaultStyles: {
      position: 'relative',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      overflow: 'hidden'
    }
  }
};
