import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

interface FeaturedCategoriesProps {
  title?: string;
  subtitle?: string;
  projectId: number;
  layout?: 'grid' | 'carousel';
  limit?: number;
  editable?: boolean;
  onEdit?: () => void;
}

export function FeaturedCategories({
  title = 'Categorias em Destaque',
  subtitle,
  projectId,
  layout = 'grid',
  limit = 4,
  editable = false,
  onEdit,
}: FeaturedCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Obter categorias do servidor
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}/categories?limit=${limit}&featured=true`);
        
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [projectId, limit]);
  
  // Navegar para o slide anterior
  const prevSlide = () => {
    if (categories.length <= 1) return;
    setCurrentSlide((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
  };
  
  // Navegar para o próximo slide
  const nextSlide = () => {
    if (categories.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % categories.length);
  };
  
  // Imagens de fallback para algumas categorias
  const placeholderImages: Record<string, string> = {
    roupas: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070',
    calcados: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012',
    acessorios: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935',
    esportes: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070',
    eletronicos: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=2080',
    default: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
  };
  
  // Obter imagem para categoria (usar a categoria ou fallback)
  const getCategoryImage = (category: Category): string => {
    if (category.imageUrl && category.imageUrl.trim() !== '') {
      return category.imageUrl;
    }
    
    const slug = category.slug.toLowerCase();
    return placeholderImages[slug] || placeholderImages.default;
  };

  return (
    <div className="w-full py-16 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 relative">
          {editable && (
            <button
              onClick={onEdit}
              className="absolute top-0 right-0 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Editar categorias"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
          
          {title && <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>}
          {subtitle && <p className="text-foreground/70">{subtitle}</p>}
        </div>
        
        {/* Estado de carregamento */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Layout em grid */}
        {!loading && layout === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/produtos?categoria=${category.slug}`}>
                <div className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-72">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                  <img 
                    src={getCategoryImage(category)} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                    <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                    {category.description && (
                      <p className="text-white/80 text-sm">{category.description}</p>
                    )}
                    <div className="mt-3 flex items-center text-white">
                      <span className="text-sm font-medium">Ver produtos</span>
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Layout em carrossel */}
        {!loading && layout === 'carousel' && (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {categories.map((category) => (
                  <div key={category.id} className="w-full flex-shrink-0 px-2">
                    <Link href={`/produtos?categoria=${category.slug}`}>
                      <div className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-80">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                        <img 
                          src={getCategoryImage(category)} 
                          alt={category.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                          <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                          {category.description && (
                            <p className="text-white/80 text-sm">{category.description}</p>
                          )}
                          <div className="mt-4 flex items-center text-white">
                            <span className="text-sm font-medium">Ver produtos</span>
                            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {categories.length > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  aria-label="Categoria anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"></path>
                  </svg>
                </button>
                <div className="flex space-x-2">
                  {categories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-gray-300'}`}
                      aria-label={`Ver categoria ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  aria-label="Próxima categoria"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
