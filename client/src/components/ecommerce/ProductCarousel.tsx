import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  salePrice: string | null;
  featuredImage: string;
  inventory: number;
}

interface ProductCarouselProps {
  title?: string;
  subtitle?: string;
  projectId: number;
  featured?: boolean;
  categoryId?: number;
  limit?: number;
  editable?: boolean;
  onEdit?: () => void;
}

export function ProductCarousel({
  title = 'Produtos em Destaque',
  subtitle,
  projectId,
  featured = false,
  categoryId,
  limit = 8,
  editable = false,
  onEdit,
}: ProductCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, 4]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Formatador de moeda brasileiro
  const formatCurrency = (value: string | number): string => {
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return `R$ ${numberValue.toFixed(2).replace('.', ',')}`;
  };

  // Buscar produtos do servidor
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/api/projects/${projectId}/products?limit=${limit}`;
        
        if (featured) {
          url += '&featured=true';
        }
        
        if (categoryId) {
          url += `&categoryId=${categoryId}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [projectId, featured, categoryId, limit]);

  // Calcular quantos produtos são visíveis por vez com base no viewport
  useEffect(() => {
    const calculateVisibleItems = () => {
      let visibleItems = 2; // Padrão para dispositivos pequenos
      
      if (window.innerWidth >= 640) {
        visibleItems = 3; // Para telas sm
      }
      
      if (window.innerWidth >= 1024) {
        visibleItems = 4; // Para telas lg
      }
      
      return visibleItems;
    };
    
    const updateVisibleRange = () => {
      const visibleItems = calculateVisibleItems();
      setVisibleRange([0, visibleItems - 1]);
    };
    
    // Atualizar quando o componente é montado
    updateVisibleRange();
    
    // Atualizar quando a janela é redimensionada
    window.addEventListener('resize', updateVisibleRange);
    
    return () => {
      window.removeEventListener('resize', updateVisibleRange);
    };
  }, []);

  // Manipuladores de navegação do carrossel
  const nextSlide = () => {
    if (products.length <= (visibleRange[1] - visibleRange[0] + 1)) return;
    
    setVisibleRange(prev => {
      const [start, end] = prev;
      const maxStart = products.length - (end - start + 1);
      
      if (start >= maxStart) {
        return [0, end - start]; // Voltar para o início
      }
      
      const newStart = Math.min(start + 1, maxStart);
      return [newStart, newStart + (end - start)];
    });
  };

  const prevSlide = () => {
    if (products.length <= (visibleRange[1] - visibleRange[0] + 1)) return;
    
    setVisibleRange(prev => {
      const [start, end] = prev;
      const itemsPerPage = end - start + 1;
      const maxStart = products.length - itemsPerPage;
      
      if (start <= 0) {
        return [maxStart, maxStart + itemsPerPage - 1]; // Ir para o final
      }
      
      const newStart = Math.max(0, start - 1);
      return [newStart, newStart + itemsPerPage - 1];
    });
  };

  // Manipuladores de eventos de toque para swipe em dispositivos móveis
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    
    if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Calcular produtos visíveis
  const visibleProducts = products.slice(visibleRange[0], visibleRange[1] + 1);

  return (
    <div className="w-full py-16 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 relative">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            {title && <h2 className="text-3xl font-bold text-foreground">{title}</h2>}
            {subtitle && <p className="text-foreground/70 mt-1">{subtitle}</p>}
          </div>
          
          {editable && (
            <button
              onClick={onEdit}
              className="absolute top-0 right-0 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Editar carousel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
          
          {products.length > (visibleRange[1] - visibleRange[0] + 1) && (
            <div className="flex space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors"
                aria-label="Produtos anteriores"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors"
                aria-label="Próximos produtos"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {/* Estado de carregamento */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Mensagem de nenhum produto */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-foreground/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-foreground/70">Não há produtos disponíveis nesta categoria.</p>
          </div>
        )}
        
        {/* Carrossel de produtos */}
        {!loading && products.length > 0 && (
          <div
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex transition-transform duration-300 ease-in-out">
              {/* Produtos a serem exibidos */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {visibleProducts.map((product) => (
                  <Link key={product.id} href={`/produto/${product.slug}`}>
                    <div className="group relative transition-all">
                      <div className="aspect-square rounded-md overflow-hidden bg-gray-100 mb-3 relative">
                        <img
                          src={product.featuredImage || 'https://via.placeholder.com/300'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {product.salePrice && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Oferta
                          </div>
                        )}
                        
                        {product.inventory <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-medium px-3 py-1 bg-black/70 rounded">
                              Esgotado
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-foreground mb-1 line-clamp-1">{product.name}</h3>
                      
                      <div className="flex items-center">
                        {product.salePrice ? (
                          <>
                            <span className="text-primary font-bold">{formatCurrency(product.salePrice)}</span>
                            <span className="text-foreground/60 text-sm line-through ml-2">{formatCurrency(product.price)}</span>
                          </>
                        ) : (
                          <span className="text-primary font-bold">{formatCurrency(product.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Link para ver todos */}
        {!loading && products.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/produtos" className="text-primary hover:underline font-medium">
              Ver todos os produtos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
