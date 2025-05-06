import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import Auth from "@/pages/auth";
import Products from "@/pages/products";
import ProductDetails from "@/pages/product-details";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import OrderConfirmation from "@/pages/order-confirmation";

// Importando páginas protegidas
import MeusProjetos from "@/pages/meus-projetos";
import MeuPerfil from "@/pages/meu-perfil";

// Componente temporário para a página de configurações
const Configuracoes = () => (
  <div className="container py-10">
    <h1 className="text-3xl font-bold">Configurações</h1>
    <p className="mt-4 text-muted-foreground">Esta página está em desenvolvimento.</p>
  </div>
);

function Router() {
  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/produtos" component={Products} />
      <Route path="/produtos/:slug" component={ProductDetails} />
      <Route path="/carrinho" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/pedido-confirmado/:orderId" component={OrderConfirmation} />
      <Route path="/assinatura" component={Subscribe} />
      
      {/* Rotas protegidas que requerem autenticação */}
      <ProtectedRoute path="/editor" component={Editor} />
      <ProtectedRoute path="/meus-projetos" component={MeusProjetos} />
      <ProtectedRoute path="/meu-perfil" component={MeuPerfil} />
      <ProtectedRoute path="/configuracoes" component={Configuracoes} />
      
      {/* Fallback para rota não encontrada */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
