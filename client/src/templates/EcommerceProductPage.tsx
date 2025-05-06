import React, { useState } from 'react';
import { ProductCarousel, NewsletterSection, StoreFooter } from '@/components/ecommerce';

interface ProductImageProps {
  src: string;
  alt: string;
}

interface ProductVariant {
  id: number;
  name: string;
  price: string;
  salePrice: string | null;
  inventory: number;
  sku: string;
}

interface ProductDetailsProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    salePrice: string | null;
    sku: string;
    inventory: number;
    images: string; // JSON string of images
    attributes: string; // JSON string of attributes
    featured: boolean;
    status: string;
  };
  variants: ProductVariant[];
  projectId: number;
  editable?: boolean;
  onEditSection?: (sectionId: string) => void;
}

export function EcommerceProductPage({
  product,
  variants,
  projectId,
  editable = false,
  onEditSection,
}: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(variants.length > 0 ? variants[0].id : null);
  const [mainImage, setMainImage] = useState<string>('');
  
  // Processar imagens de produto
  const productImages: ProductImageProps[] = React.useMemo(() => {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((img: any, index: number) => ({
          src: typeof img === 'string' ? img : (img.url || ''),
          alt: `${product.name} - Imagem ${index + 1}`
        }));
      }
    } catch (e) {
      // Retornar uma imagem de espaço reservado se não for JSON válido
    }
    return [{ src: '/placeholder-product.jpg', alt: product.name }];
  }, [product.images, product.name]);
  
  // Definir a imagem principal quando o componente é carregado
  React.useEffect(() => {
    if (productImages.length > 0 && !mainImage) {
      setMainImage(productImages[0].src);
    }
  }, [productImages, mainImage]);
  
  // Obter a variante selecionada
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || null;
  
  // Determinar o preço a ser exibido (variante ou produto)
  const currentPrice = selectedVariant 
    ? (selectedVariant.salePrice || selectedVariant.price) 
    : (product.salePrice || product.price);
  
  const regularPrice = selectedVariant 
    ? selectedVariant.price 
    : product.price;
  
  // Formatar preço
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };
  
  // Processar atributos do produto
  const productAttributes = React.useMemo(() => {
    try {
      return JSON.parse(product.attributes) || {};
    } catch (e) {
      return {};
    }
  }, [product.attributes]);
  
  // Calcular desconto
  const calculateDiscount = () => {
    const current = parseFloat(currentPrice);
    const regular = parseFloat(regularPrice);
    
    if (current < regular) {
      const discountPercent = Math.round((1 - current / regular) * 100);
      return `${discountPercent}%`;
    }
    
    return null;
  };
  
  const discount = calculateDiscount();
  
  // Verificar disponibilidade
  const inStock = selectedVariant ? selectedVariant.inventory > 0 : product.inventory > 0;
  
  // Handler para edição de seção
  const handleEdit = (sectionId: string) => {
    if (onEditSection) {
      onEditSection(sectionId);
    }
  };
  
  // Handler para mudar a quantidade
  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    const inventory = selectedVariant ? selectedVariant.inventory : product.inventory;
    if (value > inventory) return;
    setQuantity(value);
  };
  
  // Handler para adicionar ao carrinho
  const handleAddToCart = () => {
    // Em uma aplicação real, usaria uma mutação de react-query para adicionar ao carrinho
    console.log('Adicionando ao carrinho:', {
      productId: product.id,
      variantId: selectedVariantId,
      quantity: quantity
    });
  };
  
  // Exemplo de colunas do rodapé
  const footerColumns = [
    {
      id: 'info',
      title: 'Informações',
      links: [
        { id: 'about', label: 'Sobre Nós', href: '/sobre' },
        { id: 'contact', label: 'Contato', href: '/contato' },
        { id: 'faq', label: 'Perguntas Frequentes', href: '/faq' },
        { id: 'blog', label: 'Blog', href: '/blog' },
      ],
    },
    {
      id: 'customer',
      title: 'Atendimento',
      links: [
        { id: 'orders', label: 'Meus Pedidos', href: '/minha-conta/pedidos' },
        { id: 'shipping', label: 'Entrega e Frete', href: '/entrega' },
        { id: 'returns', label: 'Trocas e Devoluções', href: '/devolucoes' },
        { id: 'warranty', label: 'Garantia', href: '/garantia' },
      ],
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { id: 'terms', label: 'Termos de Serviço', href: '/termos-de-servico' },
        { id: 'privacy', label: 'Política de Privacidade', href: '/politica-de-privacidade' },
        { id: 'cookies', label: 'Política de Cookies', href: '/politica-de-cookies' },
      ],
    },
  ];

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="text-sm mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-500 hover:text-primary">
                  Início
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <a href="/produtos" className="text-gray-500 hover:text-primary">
                    Produtos
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-foreground" aria-current="page">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 relative">
          {editable && (
            <button
              onClick={() => handleEdit('productDetails')}
              className="absolute top-2 right-2 z-10 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Editar detalhes do produto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
          
          {/* Product Images */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
              <img 
                src={mainImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img.src)}
                    className={`aspect-square rounded-md overflow-hidden border-2 ${mainImage === img.src ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img 
                      src={img.src} 
                      alt={img.alt} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <svg className="text-yellow-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg className="text-yellow-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg className="text-yellow-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg className="text-yellow-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg className="text-yellow-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="ml-2 text-foreground/70">4.9 (120 avaliações)</span>
              <span className="mx-2 text-foreground/50">|</span>
              <span className="text-green-600">{inStock ? 'Em estoque' : 'Fora de estoque'}</span>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                {product.salePrice ? (
                  <>
                    <span className="text-3xl font-bold text-primary mr-2">{formatPrice(currentPrice)}</span>
                    <span className="text-lg text-foreground/60 line-through">{formatPrice(regularPrice)}</span>
                    {discount && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -{discount}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</span>
                )}
              </div>
              <p className="text-sm text-foreground/70 mt-1">Preço unitário à vista</p>
            </div>
            
            {/* Variants */}
            {variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Variações</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-3 py-1 border rounded-md ${selectedVariantId === variant.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-300 hover:border-primary'}`}
                      disabled={variant.inventory <= 0}
                    >
                      {variant.name}
                      {variant.inventory <= 0 && <span className="ml-1 text-red-500">(Esgotado)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Quantidade</h3>
              <div className="flex items-center">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                  </svg>
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 h-10 border-y border-gray-300 text-center"
                  min="1"
                  max={selectedVariant ? selectedVariant.inventory : product.inventory}
                />
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-100"
                  disabled={quantity >= (selectedVariant ? selectedVariant.inventory : product.inventory)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <div className="mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {inStock ? 'Adicionar ao Carrinho' : 'Produto Esgotado'}
              </button>
            </div>
            
            {/* Product Description */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Descrição</h3>
              <div className="text-foreground/70 whitespace-pre-line">
                {product.description}
              </div>
            </div>
            
            {/* Product Attributes */}
            {Object.keys(productAttributes).length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Características</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(productAttributes).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="font-medium mr-2">{key}:</span>
                      <span className="text-foreground/70">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* SKU */}
            <div className="text-sm text-foreground/50">
              SKU: {selectedVariant ? selectedVariant.sku : product.sku}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-16">
          <ProductCarousel
            title="Produtos Relacionados"
            subtitle="Você também pode gostar"
            projectId={projectId}
            limit={4}
            editable={editable}
            onEdit={() => handleEdit('relatedProducts')}
          />
        </div>
      </div>
      
      {/* Newsletter */}
      <NewsletterSection
        projectId={projectId}
        editable={editable}
        onEdit={() => handleEdit('newsletter')}
      />
      
      {/* Footer */}
      <StoreFooter
        companyName="NextGen Shop"
        tagline="Sua loja online para produtos de qualidade."
        columns={footerColumns}
        socialLinks={{
          facebook: "https://facebook.com",
          instagram: "https://instagram.com",
          twitter: "https://twitter.com",
        }}
        editable={editable}
        onEdit={() => handleEdit('footer')}
      />
    </div>
  );
}
