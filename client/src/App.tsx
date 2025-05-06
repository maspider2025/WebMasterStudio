import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { NavBar } from "@/components/NavBar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import Products from "@/pages/products";
import ProductDetails from "@/pages/product-details";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/editor" component={Editor} />
      <Route path="/produtos" component={Products} />
      <Route path="/produtos/:slug" component={ProductDetails} />
      <Route path="/carrinho" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/assinatura" component={Subscribe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
