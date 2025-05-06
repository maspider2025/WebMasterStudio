import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Componente de botão de autenticação que alterna entre login e menu de usuário
function AuthenticationButton() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <Button size="sm" variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button 
        size="sm" 
        onClick={() => navigate('/auth')}
        className="bg-primary text-white hover:bg-primary/90"
      >
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
            <AvatarFallback>
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            <p className="font-medium text-sm">{user.username}</p>
            {user.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/meus-projetos" className="cursor-pointer w-full">
            Meus Projetos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/editor" className="cursor-pointer w-full">
            Editor
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 cursor-pointer"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saindo...
            </>
          ) : (
            "Sair"
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface Cart {
  items: any[];
}

export function NavBar() {
  const [location] = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Get cart ID from localStorage to check items count
  const cartId = typeof window !== 'undefined' ? localStorage.getItem('cartId') : null;
  
  // Query for cart data to get item count
  const { data: cartData } = useQuery<Cart>({
    queryKey: [`/api/carts/${cartId}`],
    enabled: !!cartId,
    retry: 1
  });

  // Update cart item count when cart data changes
  useEffect(() => {
    if (cartData && cartData.items) {
      setCartItemCount(cartData.items.length);
    }
  }, [cartData]);

  const isActive = (path: string) => {
    return location === path ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:text-primary hover:bg-primary/5';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z" />
              <path d="M7 4v3M17 4v3M8 17v3M16 17v3" />
            </svg>
            <span className="text-xl font-bold">NextGen Site Builder</span>
          </Link>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Link href="/" className={`px-4 py-2 rounded-md text-sm ${isActive('/')}`}>
                Início
              </Link>
              <Link href="/editor" className={`px-4 py-2 rounded-md text-sm ${isActive('/editor')}`}>
                Editor
              </Link>
              <Link href="/produtos" className={`px-4 py-2 rounded-md text-sm ${isActive('/produtos')}`}>
                Produtos
              </Link>
              <Link href="/checkout" className={`px-4 py-2 rounded-md text-sm ${isActive('/checkout')}`}>
                Finalizar Compra
              </Link>
              <Link href="/assinatura" className={`px-4 py-2 rounded-md text-sm ${isActive('/assinatura')}`}>
                Assinatura
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/carrinho" className="px-3 py-2 rounded-md text-sm hover:bg-primary/5 relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-5 w-5 ${isActive('/carrinho') ? 'text-primary' : 'text-foreground/80'}`}
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md text-sm text-foreground/80 hover:text-primary hover:bg-primary/5"
              >
                GitHub
              </a>
              {/* Botão de login temporariamente simplificado */}
              <Link href="/auth">
                <Button 
                  size="sm" 
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
