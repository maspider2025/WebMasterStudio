import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';

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

interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  order: number;
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useMobile();

  // Use a default project ID for demo purposes
  const projectId = 1;

  // Query for categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: [`/api/projects/${projectId}/product-categories`],
    retry: 1
  });

  // Query for products with potential category filter
  const {
    data: products = [],
    isLoading: productsLoading,
    error
  } = useQuery<Product[]>({
    queryKey: [
      `/api/projects/${projectId}/products`,
      selectedCategory ? { categoryId: selectedCategory } : null
    ],
    retry: 1
  });

  // Handle errors
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load products. Please try again later.",
      variant: "destructive"
    });
  }

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const handleAddToCart = async (productId: number, variantId?: number) => {
    try {
      // First, ensure we have a cart
      const cartResponse = await fetch('/api/carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
      });
      
      if (!cartResponse.ok) {
        throw new Error('Failed to create cart');
      }
      
      const cart = await cartResponse.json();
      
      // Add the item to the cart
      const addItemResponse = await fetch(`/api/carts/${cart.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity: 1
        })
      });
      
      if (!addItemResponse.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      {/* Categories */}
      {categoriesLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            className={`px-4 py-2 rounded-full text-sm ${!selectedCategory ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-primary/10'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm ${selectedCategory === category.id ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-primary/10'}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Products */}
      {productsLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product: Product) => {
            const productImages = product.images ? JSON.parse(product.images) : [];
            const productImageUrl = productImages.length > 0 ? productImages[0] : 'https://placehold.co/400x400/png';
            const hasVariants = product.variants && product.variants.length > 0;
            const price = product.salePrice || product.price;
            const isOnSale = product.salePrice !== null;
            
            return (
              <div key={product.id} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative aspect-square overflow-hidden bg-secondary/20">
                  <img
                    src={productImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.featured && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                  {isOnSale && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Sale
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-sm text-foreground/70 line-clamp-2 h-10">{product.description}</p>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <div>
                      {isOnSale ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{formatPrice(price)}</span>
                          <span className="text-foreground/60 line-through text-sm">{formatPrice(product.price)}</span>
                        </div>
                      ) : (
                        <span className="font-semibold">{formatPrice(price)}</span>
                      )}
                    </div>
                    
                    <button
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      {hasVariants ? 'View Options' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* No products found */}
      {!productsLoading && (!products || products.length === 0) && (
        <div className="text-center py-20">
          <h3 className="text-xl font-medium">No products found</h3>
          <p className="text-foreground/70 mt-2">Try changing your filter criteria or check back later.</p>
        </div>
      )}
    </div>
  );
}
