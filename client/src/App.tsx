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

// Importando a página de Meus Projetos
import MeusProjetos from "@/pages/meus-projetos";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <ProtectedRoute path="/editor" component={Editor} />
      <ProtectedRoute path="/meus-projetos" component={MeusProjetos} />
      <Route path="/auth" component={Auth} />
      <Route path="/produtos" component={Products} />
      <Route path="/produtos/:slug" component={ProductDetails} />
      <Route path="/carrinho" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/pedido-confirmado/:orderId" component={OrderConfirmation} />
      <Route path="/assinatura" component={Subscribe} />
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
