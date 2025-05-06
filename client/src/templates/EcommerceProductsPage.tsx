import React, { useState, useEffect } from 'react';
import { NewsletterSection, StoreFooter } from '@/components/ecommerce';
import { Link } from 'wouter';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  salePrice: string | null;
  featuredImage: string;
  status: string;
  inventory: number;
  categoryId: number;
}

interface EcommerceProductsPageProps {
  projectId: number;
  title?: string;
  subtitle?: string;
  initialProducts?: ProductItem[];
  initialCategories?: Category[];
  editable?: boolean;
  onEditSection?: (sectionId: string) => void;
}

export function EcommerceProductsPage({
  projectId,
  title = 'Produtos',
  subtitle = 'Explore nossa colleção completa',
  initialProducts = [],
  initialCategories = [],
  editable = false,
  onEditSection,
}: EcommerceProductsPageProps) {
  // Estado
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [displayType, setDisplayType] = useState<'grid' | 'list'>('grid');
  
  // Carregar produtos e categorias
  useEffect(() => {
    if (initialProducts.length === 0 || initialCategories.length === 0) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Em uma aplicação real, estes dados seriam carregados a partir de uma API
          const productsResponse = await fetch(`/api/projects/${projectId}/products`);
          const categoriesResponse = await fetch(`/api/projects/${projectId}/categories`);
          
          if (productsResponse.ok && categoriesResponse.ok) {
            const productsData = await productsResponse.json();
            const categoriesData = await categoriesResponse.json();
            
            setProducts(productsData);
            setCategories(categoriesData);
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [projectId, initialProducts.length, initialCategories.length]);
  
  // Filtrar produtos por categoria
  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];
    
    // Filtrar por categoria
    if (selectedCategory !== null) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }
    
    // Filtrar por faixa de preço
    filtered = filtered.filter(p => {
      const price = parseFloat(p.salePrice || p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Ordenar
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => parseFloat(a.salePrice || a.price) - parseFloat(b.salePrice || b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => parseFloat(b.salePrice || b.price) - parseFloat(a.salePrice || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        // Aqui assumimos que os IDs mais altos são os mais recentes
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'featured':
      default:
        // Manter a ordem original ou aplicar alguma lógica de destaque
        break;
    }
    
    return filtered;
  }, [products, selectedCategory, sortBy, priceRange]);
  
  // Formatar preço
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };
  
  // Calcular faixa de preço máxima e mínima dos produtos
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => parseFloat(p.salePrice || p.price));
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceRange([min, max]);
    }
  }, [products]);
  
  // Handler para edição de seção
  const handleEdit = (sectionId: string) => {
    if (onEditSection) {
      onEditSection(sectionId);
    }
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
      {/* Header Section */}
      <div className="bg-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center relative">
            {editable && (
              <button
                onClick={() => handleEdit('productsHeader')}
                className="absolute top-0 right-0 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                title="Editar cabeçalho"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
            )}
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            {subtitle && <p className="text-foreground/70">{subtitle}</p>}
          </div>
        </div>
      </div>
      
      {/* Products Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4">
            <div className="border border-gray-200 rounded-lg p-4 mb-6 relative">
              {editable && (
                <button
                  onClick={() => handleEdit('filters')}
                  className="absolute top-2 right-2 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                  title="Editar filtros"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </button>
              )}
              
              <h3 className="text-lg font-medium mb-4">Categorias</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cat-all"
                    name="category"
                    checked={selectedCategory === null}
                    onChange={() => setSelectedCategory(null)}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor="cat-all" className="ml-2 text-sm text-foreground/90">
                    Todos os Produtos
                  </label>
                </div>
                
                {categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`cat-${category.id}`}
                      name="category"
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor={`cat-${category.id}`} className="ml-2 text-sm text-foreground/90">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Faixa de Preço</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full accent-primary"
                  />
                  <input
                    type="range"
                    min={priceRange[0]}
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary"
                  />
                </div>
                
                <div className="flex justify-between">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="w-full lg:w-3/4">
            {/* Sorting and Display Options */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="w-full sm:w-auto">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="featured">Destaque</option>
                  <option value="price_asc">Preço: Menor para Maior</option>
                  <option value="price_desc">Preço: Maior para Menor</option>
                  <option value="name">Nome: A-Z</option>
                  <option value="newest">Mais Recentes</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-foreground/70">
                  Mostrando {filteredProducts.length} produto(s)
                </div>
                
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setDisplayType('grid')}
                    className={`p-2 ${displayType === 'grid' ? 'bg-secondary/20' : 'hover:bg-secondary/10'}`}
                    title="Visualização em Grade"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDisplayType('list')}
                    className={`p-2 ${displayType === 'list' ? 'bg-secondary/20' : 'hover:bg-secondary/10'}`}
                    title="Visualização em Lista"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* No Products Found */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-foreground/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum produto encontrado</h3>
                <p className="text-foreground/70">Tente ajustar seus filtros ou buscar por outro termo.</p>
              </div>
            )}
            
            {/* Products Grid View */}
            {!loading && filteredProducts.length > 0 && displayType === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Link key={product.id} href={`/produto/${product.slug}`} className="group relative transition-all">
                    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square relative">
                        <img 
                          src={product.featuredImage} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
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
                        
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-foreground font-medium mb-1 line-clamp-1">{product.name}</h3>
                        
                        <div className="flex items-center">
                          {product.salePrice ? (
                            <>
                              <span className="text-primary font-bold">{formatPrice(product.salePrice)}</span>
                              <span className="text-foreground/60 text-sm line-through ml-2">{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Products List View */}
            {!loading && filteredProducts.length > 0 && displayType === 'list' && (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <Link key={product.id} href={`/produto/${product.slug}`} className="block group transition-all">
                    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/4 aspect-square relative">
                          <img 
                            src={product.featuredImage} 
                            alt={product.name} 
                            className="w-full h-full object-cover rounded-md"
                          />
                          
                          {product.salePrice && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              Oferta
                            </div>
                          )}
                          
                          {product.inventory <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                              <span className="text-white font-medium px-3 py-1 bg-black/70 rounded">
                                Esgotado
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full sm:w-3/4 flex flex-col justify-between">
                          <div>
                            <h3 className="text-foreground font-medium text-lg mb-2">{product.name}</h3>
                            
                            <div className="flex items-center mb-4">
                              {product.salePrice ? (
                                <>
                                  <span className="text-primary font-bold text-xl">{formatPrice(product.salePrice)}</span>
                                  <span className="text-foreground/60 text-sm line-through ml-2">{formatPrice(product.price)}</span>
                                </>
                              ) : (
                                <span className="text-primary font-bold text-xl">{formatPrice(product.price)}</span>
                              )}
                            </div>
                            
                            <p className="text-foreground/70 mb-4">
                              {/* Aqui poderia ter uma descrição curta do produto */}
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vitae ante vel eros fermentum faucibus.
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-foreground/70">
                              {product.inventory > 0 ? (
                                <span className="text-green-600">Em estoque</span>
                              ) : (
                                <span className="text-red-500">Fora de estoque</span>
                              )}
                            </div>
                            
                            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                              Ver Detalhes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
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
