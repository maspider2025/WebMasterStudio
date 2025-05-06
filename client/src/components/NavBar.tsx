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
  const { user, isLoading, logoutMutation } = useAuth();

  // Determinar se estamos na seção do editor ou do e-commerce
  const isEditorSection = location.startsWith('/editor') || location === '/meus-projetos' || location === '/novo-projeto';
  
  // Get cart ID from localStorage to check items count
  const cartId = typeof window !== 'undefined' ? localStorage.getItem('cartId') : null;
  
  // Query for cart data to get item count
  const { data: cartData } = useQuery<Cart>({
    queryKey: [`/api/carts/${cartId}`],
    enabled: !!cartId && !isEditorSection, // Só buscar carrinho na seção de e-commerce
    retry: 1
  });

  // Update cart item count when cart data changes
  useEffect(() => {
    if (cartData && cartData.items) {
      setCartItemCount(cartData.items.length);
    }
  }, [cartData]);

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/') 
      ? 'bg-primary/10 text-primary font-medium' 
      : 'text-foreground/80 hover:text-primary hover:bg-primary/5';
  };

  // Função auxiliar para renderizar o menu de perfil do usuário
  const renderUserMenu = () => {
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
          onClick={() => window.location.href = '/auth'}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Entrar
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border border-muted">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-start gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5 leading-none">
              <p className="font-medium text-sm">{user.username}</p>
              {user.email && (
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/meu-perfil" className="cursor-pointer">
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
                className="mr-2 h-4 w-4"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Meu Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/meus-projetos" className="cursor-pointer">
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
                className="mr-2 h-4 w-4"
              >
                <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z" />
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M9 18H4" />
              </svg>
              Meus Projetos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/novo-projeto" className="cursor-pointer">
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
                className="mr-2 h-4 w-4"
              >
                <path d="M2 12v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
                <path d="M2 12h6" />
                <path d="M5 9v6" />
              </svg>
              Novo Projeto
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/configuracoes" className="cursor-pointer">
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
                className="mr-2 h-4 w-4"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Configurações
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 cursor-pointer"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saindo...
              </>
            ) : (
              <>
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
                  className="mr-2 h-4 w-4"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sair
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
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
            {/* Menu dinâmico baseado na seção atual */}
            <div className="flex items-center space-x-1">
              {isEditorSection ? (
                // Links para a seção do editor
                <>
                  <Link href="/" className={`px-4 py-2 rounded-md text-sm ${isActive('/')}`}>
                    Início
                  </Link>
                  <Link href="/meus-projetos" className={`px-4 py-2 rounded-md text-sm ${isActive('/meus-projetos')}`}>
                    Meus Projetos
                  </Link>
                  <Link href="/novo-projeto" className={`px-4 py-2 rounded-md text-sm ${isActive('/novo-projeto')}`}>
                    Novo Projeto
                  </Link>
                  <Link href="/editor" className={`px-4 py-2 rounded-md text-sm ${isActive('/editor')}`}>
                    Editor
                  </Link>
                  <Link href="/templates" className={`px-4 py-2 rounded-md text-sm ${isActive('/templates')}`}>
                    Templates
                  </Link>
                </>
              ) : (
                // Links para a seção de e-commerce
                <>
                  <Link href="/" className={`px-4 py-2 rounded-md text-sm ${isActive('/')}`}>
                    Início
                  </Link>
                  <Link href="/produtos" className={`px-4 py-2 rounded-md text-sm ${isActive('/produtos')}`}>
                    Produtos
                  </Link>
                  <Link href="/categorias" className={`px-4 py-2 rounded-md text-sm ${isActive('/categorias')}`}>
                    Categorias
                  </Link>
                  <Link href="/novidades" className={`px-4 py-2 rounded-md text-sm ${isActive('/novidades')}`}>
                    Novidades
                  </Link>
                  <Link href="/promocoes" className={`px-4 py-2 rounded-md text-sm ${isActive('/promocoes')}`}>
                    Promoções
                  </Link>
                  <Link href="/contato" className={`px-4 py-2 rounded-md text-sm ${isActive('/contato')}`}>
                    Contato
                  </Link>
                </>
              )}
            </div>

            {/* Área direita da navbar */}
            <div className="flex items-center space-x-2">
              {!isEditorSection && (
                // Mostrar carrinho apenas na seção de e-commerce
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
              )}

              {/* Alternador entre editor e e-commerce */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = isEditorSection ? '/' : '/meus-projetos'}
                className="hidden sm:flex items-center gap-1 mr-1"
              >
                {isEditorSection ? (
                  <>
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
                      className="mr-1 h-4 w-4"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    Loja
                  </>
                ) : (
                  <>
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
                      className="mr-1 h-4 w-4"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editor
                  </>
                )}
              </Button>

              {/* Botão ou menu de perfil do usuário */}
              {renderUserMenu()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
