import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CartItem {
  id: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    salePrice: string | null;
    images: string;
    slug: string;
  };
  variant?: {
    id: number;
    name: string;
    price: string;
    salePrice: string | null;
  };
  price: string;
  subtotal: number;
}

interface Cart {
  id: number;
  projectId: number;
  customerId: number | null;
  sessionId: string;
  status: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export default function Cart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // Identificador do projeto (em um sistema real, seria dinâmico baseado na loja)
  const projectId = 1;

  // Obter o ID do carrinho do armazenamento local
  const cartId = localStorage.getItem('cartId');

  // Consulta para obter dados do carrinho
  const {
    data: cart,
    isLoading,
    error,
    refetch
  } = useQuery<Cart>({
    queryKey: [`/api/carts/${cartId}`],
    enabled: !!cartId,
    retry: 1
  });

  // Mutação para atualizar a quantidade de um item
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/carts/${cartId}/items/${itemId}`, { quantity });
      if (!response.ok) {
        throw new Error('Falha ao atualizar item');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/carts/${cartId}`] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao atualizar item",
        variant: "destructive"
      });
    }
  });

  // Mutação para remover um item do carrinho
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest('DELETE', `/api/carts/${cartId}/items/${itemId}`);
      if (!response.ok) {
        throw new Error('Falha ao remover item');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/carts/${cartId}`] });
      toast({
        title: "Item removido",
        description: "Item removido do carrinho com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao remover item",
        variant: "destructive"
      });
    }
  });

  const handleQuantityChange = async (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    await updateItemMutation.mutateAsync({ itemId, quantity: newQuantity });
    setIsUpdating(false);
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  const parseProductImage = (images: string): string => {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0].url || parsed[0] : '';
    } catch (e) {
      return '';
    }
  };

  // Renderização para carregamento
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-8">Meu Carrinho</h1>
        <div className="flex justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Renderização para erro
  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-8">Meu Carrinho</h1>
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-medium text-red-600 mb-2">Erro ao carregar o carrinho</h2>
          <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar os itens do seu carrinho. Por favor, tente novamente.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização para carrinho vazio
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-8">Meu Carrinho</h1>
        <div className="text-center bg-gray-50 p-10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-xl font-medium mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Parece que você ainda não adicionou nenhum produto ao seu carrinho.</p>
          <Link href="/produtos" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">Meu Carrinho</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de itens do carrinho */}
        <div className="flex-1">
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-secondary/20 text-sm font-medium">
              <div className="col-span-6">Produto</div>
              <div className="col-span-2 text-center">Preço</div>
              <div className="col-span-2 text-center">Quantidade</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>
            
            <div className="divide-y">
              {cart.items.map((item) => (
                <div key={item.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Produto */}
                  <div className="col-span-6 flex items-center space-x-4">
                    <div className="h-20 w-20 flex-shrink-0 rounded-md border overflow-hidden">
                      <img 
                        src={parseProductImage(item.product.images)} 
                        alt={item.product.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/produtos/${item.product.slug}`} className="text-foreground hover:text-primary font-medium line-clamp-2">
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-foreground/70 mt-1">
                          Variante: {item.variant.name}
                        </p>
                      )}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remover
                      </button>
                    </div>
                  </div>
                  
                  {/* Preço */}
                  <div className="col-span-2 text-center">
                    <div className="md:hidden text-sm text-foreground/70 mb-1">Preço</div>
                    <div className="font-medium">{formatPrice(item.price)}</div>
                  </div>
                  
                  {/* Quantidade */}
                  <div className="col-span-2 flex justify-center">
                    <div className="md:hidden text-sm text-foreground/70 mb-1">Quantidade</div>
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="px-2 py-1 hover:bg-secondary/50 transition-colors disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 min-w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        disabled={isUpdating}
                        className="px-2 py-1 hover:bg-secondary/50 transition-colors disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Subtotal */}
                  <div className="col-span-2 text-right">
                    <div className="md:hidden text-sm text-foreground/70 mb-1">Subtotal</div>
                    <div className="font-medium">{formatPrice(item.subtotal)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Link href="/produtos" className="text-primary hover:text-primary/80 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continuar comprando
            </Link>
            
            <button
              onClick={() => refetch()}
              className="text-foreground/70 hover:text-foreground flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar carrinho
            </button>
          </div>
        </div>
        
        {/* Resumo do pedido */}
        <div className="lg:w-1/3">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-foreground/70">Subtotal ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} itens)</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Frete</span>
                <span>Calculado no checkout</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-xl text-primary">{formatPrice(cart.total)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Finalizar Compra
            </button>
            
            <div className="mt-4 text-sm text-foreground/70">
              <p>Nós aceitamos:</p>
              <div className="flex space-x-2 mt-2">
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">Visa</div>
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">Master</div>
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">PayPal</div>
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">Pix</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6 mt-4">
            <h3 className="font-medium mb-2">Tem um cupom de desconto?</h3>
            <div className="flex">
              <input 
                type="text" 
                placeholder="Digite o código" 
                className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-r-md transition-colors">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
