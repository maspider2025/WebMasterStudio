import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
}

interface FeaturedCategoriesProps {
  title: string;
  subtitle?: string;
  projectId: number;
  limit?: number;
  layout?: 'grid' | 'carousel';
  editable?: boolean;
  onEdit?: () => void;
}

export function FeaturedCategories({
  title,
  subtitle,
  projectId,
  limit = 6,
  layout = 'grid',
  editable = false,
  onEdit,
}: FeaturedCategoriesProps) {
  // Consulta para obter categorias
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: [`/api/projects/${projectId}/categories`],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/categories`);
      if (!response.ok) {
        throw new Error('Falha ao carregar categorias');
      }
      const data = await response.json();
      return data.filter((category: Category) => !category.parentId).slice(0, limit); // Apenas categorias principais, limitadas
    },
  });

  // Analisar imagem de categoria
  const parseImage = (image: string | null): string => {
    if (!image) return '/placeholder-category.jpg'; // Imagem de espaço reservado
    
    try {
      const parsed = JSON.parse(image);
      return typeof parsed === 'object' && parsed.url ? parsed.url : (
        Array.isArray(parsed) && parsed.length > 0 ? (parsed[0].url || parsed[0]) : image
      );
    } catch (e) {
      return image; // Retornar o valor original se não for JSON válido
    }
  };

  // Renderizar esqueletos de carregamento
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className="rounded-lg overflow-hidden">
        <div className="bg-gray-100 animate-pulse h-40"></div>
        <div className="p-4">
          <div className="bg-gray-100 animate-pulse h-4 w-3/4 mb-2"></div>
          <div className="bg-gray-100 animate-pulse h-3 w-1/2"></div>
        </div>
      </div>
    ));
  };

  // Renderizar categorias
  const renderCategories = () => {
    if (!categories || categories.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">Nenhuma categoria encontrada.</p>
        </div>
      );
    }

    return categories.map((category) => (
      <Link
        key={category.id}
        href={`/produtos?categoria=${category.slug}`}
        className="group block rounded-lg overflow-hidden border bg-card hover:shadow-md transition-shadow"
      >
        <div className="relative h-40 overflow-hidden bg-gray-100">
          <img
            src={parseImage(category.image)}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </Link>
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
              title="Editar categorias em destaque"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? renderSkeletons() : renderCategories()}
        </div>
        
        <div className="text-center mt-8">
          <Link
            href="/produtos"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos os produtos
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
