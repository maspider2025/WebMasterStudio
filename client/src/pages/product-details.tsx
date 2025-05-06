import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  sku: string;
  price: string;
  salePrice: string | null;
  inventory: number;
  attributes: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  salePrice: string | null;
  sku: string;
  slug: string;
  status: string;
  featured: boolean;
  inventory: number;
  images: string;
  variants?: ProductVariant[];
  categories?: { id: number; name: string }[];
  attributes?: Record<string, string[]>;
  specifications?: Record<string, string>;
  relatedProducts?: number[];
}

interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpfulCount: number;
}

export default function ProductDetails() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ slug: string }>('/produtos/:slug');
  const slug = params?.slug || '';
  
  // Estado para controle de quantidade e variantes selecionadas
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  
  // Use um ID de projeto padrão para demonstração
  const projectId = 1;

  // Consultar dados do produto
  const {
    data: product,
    isLoading: productLoading,
    error: productError
  } = useQuery<Product>({
    queryKey: [`/api/projects/${projectId}/products/by-slug/${slug}`],
    enabled: !!slug,
    retry: 1
  });

  // Consultar avaliações do produto
  const {
    data: reviews = [],
    isLoading: reviewsLoading
  } = useQuery<Review[]>({
    queryKey: [`/api/projects/${projectId}/products/${product?.id}/reviews`],
    enabled: !!product?.id,
    retry: 1
  });
  
  // Quando o produto for carregado, defina a variante padrão
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product]);

  // Tratamento de erros
  if (productError) {
    toast({
      title: "Erro",
      description: "Falha ao carregar detalhes do produto. Tente novamente mais tarde.",
      variant: "destructive"
    });
  }

  // Mutação para adicionar item ao carrinho
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, variantId, qty }: { productId: number; variantId?: number; qty: number }) => {
      // Primeiro, garantir que temos um carrinho
      const cartIdFromStorage = localStorage.getItem('cartId');
      let cartId: number;
      
      if (!cartIdFromStorage) {
        const cartResponse = await apiRequest('POST', '/api/carts', { projectId });
        if (!cartResponse.ok) {
          throw new Error('Falha ao criar carrinho');
        }
        const cart = await cartResponse.json();
        cartId = cart.id;
        localStorage.setItem('cartId', cartId.toString());
      } else {
        cartId = parseInt(cartIdFromStorage);
      }
      
      // Adicionar o item ao carrinho
      const addItemResponse = await apiRequest('POST', `/api/carts/${cartId}/items`, {
        productId,
        variantId: variantId || null,
        quantity: qty
      });
      
      if (!addItemResponse.ok) {
        throw new Error('Falha ao adicionar item ao carrinho');
      }
      
      return await addItemResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Adicionado ao Carrinho",
        description: "Item adicionado ao seu carrinho com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/carts/${localStorage.getItem('cartId')}`] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao adicionar item ao carrinho",
        variant: "destructive"
      });
    }
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCartMutation.mutate({
      productId: product.id,
      variantId: selectedVariantId || undefined,
      qty: quantity
    });
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    setQuantity(value);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/carrinho');
  };

  const formatPrice = (price: string) => {
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
  };

  const parseProductImages = (imagesString: string): ProductImage[] => {
    try {
      const images = JSON.parse(imagesString);
      return Array.isArray(images) ? images.map((url: string) => ({ url, alt: product?.name || 'Imagem de produto' })) : [];
    } catch (e) {
      return [];
    }
  };

  const getCurrentPrice = (): string => {
    if (selectedVariantId && product?.variants) {
      const variant = product.variants.find(v => v.id === selectedVariantId);
      if (variant) {
        return variant.salePrice || variant.price;
      }
    }
    return product?.salePrice || product?.price || '0';
  };

  const getOriginalPrice = (): string | null => {
    if (selectedVariantId && product?.variants) {
      const variant = product.variants.find(v => v.id === selectedVariantId);
      if (variant && variant.salePrice) {
        return variant.price;
      }
    }
    return product?.salePrice ? product.price : null;
  };

  const getAverageRating = (): number => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  // Renderização de carregamento
  if (productLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Produto não encontrado
  if (!product) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
        <p className="mb-6">O produto que você está procurando não existe ou foi removido.</p>
        <Link href="/produtos" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Voltar para Produtos
        </Link>
      </div>
    );
  }

  const productImages = parseProductImages(product.images);
  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const isOnSale = originalPrice !== null;
  const averageRating = getAverageRating();

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm">
        <Link href="/" className="text-gray-500 hover:text-primary">
          Início
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link href="/produtos" className="text-gray-500 hover:text-primary">
          Produtos
        </Link>
        {product.categories && product.categories.length > 0 && (
          <>
            <span className="mx-2 text-gray-500">/</span>
            <Link 
              href={`/produtos?categoria=${product.categories[0].id}`} 
              className="text-gray-500 hover:text-primary"
            >
              {product.categories[0].name}
            </Link>
          </>
        )}
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-foreground/80 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Galeria de imagens do produto */}
        <div className="flex flex-col space-y-4">
          <div className="relative aspect-square overflow-hidden bg-card border rounded-lg">
            {productImages.length > 0 ? (
              <img
                src={productImages[activeImageIndex].url}
                alt={productImages[activeImageIndex].alt}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">Sem imagem</span>
              </div>
            )}
            
            {product.featured && (
              <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                Destaque
              </span>
            )}
            
            {isOnSale && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Oferta
              </span>
            )}
          </div>

          {/* Miniaturas */}
          {productImages.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`relative overflow-hidden border rounded w-20 h-20 flex-shrink-0 transition-all ${
                    activeImageIndex === index ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img 
                    src={image.url} 
                    alt={`Miniatura ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do produto */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Avaliações */}
          <div className="flex items-center space-x-2 mb-4">
            {renderStars(averageRating)}
            <span className="text-sm text-foreground/70">
              {reviews.length > 0 
                ? `${averageRating.toFixed(1)} (${reviews.length} ${reviews.length === 1 ? 'avaliação' : 'avaliações'})` 
                : 'Sem avaliações'}
            </span>
          </div>
          
          {/* Preço */}
          <div className="mb-6">
            <div className="flex items-center">
              {isOnSale ? (
                <>
                  <span className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</span>
                  <span className="ml-2 text-lg text-foreground/60 line-through">{formatPrice(originalPrice!)}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</span>
              )}
            </div>
            
            <p className="text-sm text-foreground/70 mt-1">
              Em até 10x de {formatPrice((parseFloat(currentPrice) / 10).toString())} sem juros
            </p>
          </div>
          
          {/* SKU */}
          <p className="text-sm text-foreground/60 mb-4">SKU: {product.sku}</p>
          
          {/* Variantes do produto */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Opções disponíveis</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                      selectedVariantId === variant.id
                        ? 'bg-primary/10 border-primary text-primary font-medium'
                        : 'bg-card hover:bg-primary/5'
                    }`}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Quantidade */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Quantidade</h3>
            <div className="flex items-center border rounded-md w-fit">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-4 py-2 hover:bg-secondary/50 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2 min-w-8 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-4 py-2 hover:bg-secondary/50 transition-colors"
                disabled={quantity >= (product.inventory || 100)}
              >
                +
              </button>
            </div>
            
            <p className="text-sm text-foreground/70 mt-2">
              {product.inventory > 0 
                ? `${product.inventory} ${product.inventory === 1 ? 'unidade' : 'unidades'} em estoque` 
                : 'Produto indisponível'}
            </p>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.inventory <= 0 || addToCartMutation.isPending}
              className="flex-1 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {addToCartMutation.isPending ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                'Adicionar ao Carrinho'
              )}
            </button>
            
            <button
              onClick={handleBuyNow}
              disabled={product.inventory <= 0 || addToCartMutation.isPending}
              className="flex-1 py-3 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              Comprar Agora
            </button>
          </div>
          
          {/* Compartilhar */}
          <div className="flex items-center space-x-4 text-sm text-foreground/70">
            <span>Compartilhar:</span>
            <button className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </button>
            <button className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </button>
            <button className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </button>
            <button className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Abas de informações detalhadas */}
      <div className="mt-12">
        <div className="border-b">
          <div className="flex space-x-6">
            <button
              className={`py-3 px-1 border-b-2 transition-colors ${activeTab === 'description' ? 'border-primary text-primary font-medium' : 'border-transparent hover:text-primary'}`}
              onClick={() => setActiveTab('description')}
            >
              Descrição
            </button>
            
            <button
              className={`py-3 px-1 border-b-2 transition-colors ${activeTab === 'specifications' ? 'border-primary text-primary font-medium' : 'border-transparent hover:text-primary'}`}
              onClick={() => setActiveTab('specifications')}
            >
              Especificações
            </button>
            
            <button
              className={`py-3 px-1 border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary font-medium' : 'border-transparent hover:text-primary'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Avaliações ({reviews.length})
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications ? (
                Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))
              ) : (
                <p>Nenhuma especificação disponível para este produto.</p>
              )}
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              {reviewsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{review.title}</h4>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-foreground/70">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="text-sm text-foreground/70">
                          por {review.userName}
                        </div>
                      </div>
                      <p className="mt-2">{review.comment}</p>
                      <div className="mt-3 flex items-center">
                        <button className="text-sm text-foreground/70 hover:text-primary flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>
                          <span>Útil ({review.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-foreground/70 mb-4">Este produto ainda não tem avaliações.</p>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                    Seja o primeiro a avaliar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Produtos relacionados */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Aqui iriam os produtos relacionados */}
          </div>
        </div>
      )}
    </div>
  );
}
