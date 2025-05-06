import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  price?: string;
  subtotal?: number;
  product: {
    name: string;
    price: string;
    salePrice: string | null;
    images: string;
  };
  variant?: {
    name: string;
    price: string;
    salePrice: string | null;
  } | null;
}

interface Cart {
  id: number;
  sessionId: string;
  customerId: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  total?: number;
}

export default function Cart() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const projectId = 1; // Default project ID for demo
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCreatingCart, setIsCreatingCart] = useState(false);

  // Create cart if needed
  const createCart = async () => {
    if (isCreatingCart) return;
    
    setIsCreatingCart(true);
    try {
      const response = await fetch('/api/carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create cart');
      }
      
      const newCart = await response.json();
      localStorage.setItem('cartId', newCart.id.toString());
      setCart(newCart);
      queryClient.invalidateQueries({ queryKey: [`/api/carts/${newCart.id}`] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create cart",
        variant: "destructive"
      });
    } finally {
      setIsCreatingCart(false);
    }
  };

  // Get cart ID from localStorage
  useEffect(() => {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
      createCart();
    }
  }, []);

  // Query for cart data
  const cartId = localStorage.getItem('cartId');
  const { data: cartData, isLoading: cartLoading, error: cartError } = useQuery<Cart>({
    queryKey: [`/api/carts/${cartId}`],
    enabled: !!cartId,
    retry: 1
  });

  // Set cart data when available
  useEffect(() => {
    if (cartData) {
      setCart(cartData);
    }
  }, [cartData]);

  // Handle cart error
  useEffect(() => {
    if (cartError) {
      // If cart not found, create a new one
      localStorage.removeItem('cartId');
      createCart();
    }
  }, [cartError]);

  // Update item quantity mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ cartId, itemId, quantity }: { cartId: number; itemId: number; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/carts/${cartId}/items/${itemId}`, { quantity });
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/carts/${cartId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item",
        variant: "destructive"
      });
    }
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async ({ cartId, itemId }: { cartId: number; itemId: number }) => {
      const response = await apiRequest('DELETE', `/api/carts/${cartId}/items/${itemId}`);
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/carts/${cartId}`] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive"
      });
    }
  });

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (!cart) return;
    if (quantity < 1) return;
    
    updateItemMutation.mutate({ cartId: cart.id, itemId, quantity });
  };

  const handleRemoveItem = (itemId: number) => {
    if (!cart) return;
    
    removeItemMutation.mutate({ cartId: cart.id, itemId });
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  // Format price helper
  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Get item price (considering variants and sale prices)
  const getItemPrice = (item: CartItem): string => {
    if (item.price) return item.price;
    
    const variantPrice = item.variant?.salePrice || item.variant?.price;
    const productPrice = item.product.salePrice || item.product.price;
    
    return variantPrice || productPrice;
  };

  // Render empty cart
  if (!cart || (cart.items && cart.items.length === 0)) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="bg-card rounded-lg shadow p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mx-auto text-foreground/50 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-foreground/70 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Render cart with items
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {cartLoading || updateItemMutation.isPending || removeItemMutation.isPending ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Cart Items ({cart.items.length})</h2>
              </div>
              
              <div className="divide-y">
                {cart.items.map((item) => {
                  const itemPrice = getItemPrice(item);
                  const productImages = item.product.images ? JSON.parse(item.product.images) : [];
                  const productImageUrl = productImages.length > 0 ? productImages[0] : 'https://placehold.co/400x400/png';
                  
                  return (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={productImageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {item.product.name}
                          {item.variant?.name && <span className="text-foreground/70"> - {item.variant.name}</span>}
                        </h3>
                        
                        <p className="font-medium mb-4">{formatPrice(itemPrice)}</p>
                        
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-secondary/50 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-3 py-1 min-w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-secondary/50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-sm text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="font-semibold text-right min-w-20">
                        {formatPrice((item.subtotal || (parseFloat(itemPrice) * item.quantity)).toString())}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span>{formatPrice((cart.total || 0).toString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice((cart.total || 0).toString())}</span>
                </div>
              </div>
              
              <button
                onClick={proceedToCheckout}
                className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
