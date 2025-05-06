import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string | null;
  images: string;
  featured: boolean;
  status: string;
}

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  projectId: number;
  limit?: number;
  featured?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  editable?: boolean;
  onEdit?: () => void;
}

export function ProductCarousel({
  title,
  subtitle,
  projectId,
  limit = 8,
  featured = false,
  autoplay = true,
  autoplaySpeed = 5000,
  editable = false,
  onEdit,
}: ProductCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productsPerView, setProductsPerView] = useState(4);
  
  // Consulta para obter produtos
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [`/api/projects/${projectId}/products`, { featured }],
    queryFn: async () => {
      const filters = featured ? '?featured=true' : '';
      const response = await fetch(`/api/projects/${projectId}/products${filters}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar produtos');
      }
      const data = await response.json();
      return data.slice(0, limit); // Limitar o número de produtos
    },
  });

  // Atualizar o número de produtos por slide com base no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setProductsPerView(1);
      } else if (window.innerWidth < 768) {
        setProductsPerView(2);
      } else if (window.innerWidth < 1024) {
        setProductsPerView(3);
      } else {
        setProductsPerView(4);
      }
    };

    handleResize(); // Configuração inicial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!autoplay || !products || products.length <= productsPerView) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const totalSlides = Math.ceil(products.length / productsPerView);
        return (prev + 1) % totalSlides;
      });
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [autoplay, autoplaySpeed, products, productsPerView]);

  // Navegar para o slide anterior
  const prevSlide = () => {
    if (!products) return;
    
    const totalSlides = Math.ceil(products.length / productsPerView);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  // Navegar para o próximo slide
  const nextSlide = () => {
    if (!products) return;
    
    const totalSlides = Math.ceil(products.length / productsPerView);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  // Analisar imagens de produto
  const parseProductImage = (images: string): string => {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0].url || parsed[0] : '';
    } catch (e) {
      return images; // Retornar o valor original se não for JSON válido
    }
  };

  // Formatar preço
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  // Renderizar produtos
  const renderProducts = () => {
    if (isLoading) {
      return Array(productsPerView).fill(0).map((_, index) => (
        <div key={`skeleton-${index}`} className="p-2">
          <div className="bg-gray-100 animate-pulse rounded-lg h-40 mb-2"></div>
          <div className="bg-gray-100 animate-pulse h-4 w-3/4 mb-2"></div>
          <div className="bg-gray-100 animate-pulse h-4 w-1/2"></div>
        </div>
      ));
    }

    if (error || !products || products.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">Nenhum produto encontrado.</p>
        </div>
      );
    }

    const startIndex = currentSlide * productsPerView;
    return products.slice(startIndex, startIndex + productsPerView).map((product) => (
      <div key={product.id} className="p-2">
        <Link href={`/produtos/${product.slug}`} className="block group">
          <div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100 aspect-square">
            <img
              src={parseProductImage(product.images)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.salePrice && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Oferta
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white text-sm font-medium truncate">
                Ver detalhes
              </div>
            </div>
          </div>
          <h3 className="font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center">
            {product.salePrice ? (
              <>
                <span className="font-bold text-primary mr-2">{formatPrice(product.salePrice)}</span>
                <span className="text-foreground/60 text-sm line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-bold text-primary">{formatPrice(product.price)}</span>
            )}
          </div>
        </Link>
      </div>
    ));
  };

  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-foreground/70 mt-1">{subtitle}</p>}
          </div>
          {editable && (
            <button
              onClick={onEdit}
              className="ml-2 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Editar carrossel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
          {products && products.length > productsPerView && (
            <div className="flex space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                aria-label="Slide anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"></path>
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                aria-label="Próximo slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="relative overflow-hidden">
          <div
            className="grid transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              gridTemplateColumns: `repeat(${productsPerView}, minmax(0, 1fr))`,
            }}
          >
            {renderProducts()}
          </div>
        </div>
      </div>
    </div>
  );
}
