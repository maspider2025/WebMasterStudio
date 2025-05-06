import React, { useState, useEffect } from 'react';
import PayPalButton from '@/components/PayPalButton';
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

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  shippingMethod: string;
  paymentMethod: string;
}

const initialFormData: CheckoutFormData = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  addressNumber: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  shippingMethod: '',
  paymentMethod: ''
};

const shippingOptions: ShippingOption[] = [
  { id: 'standard', name: 'Entrega Padrão', price: 19.99, estimatedDays: 7 },
  { id: 'express', name: 'Entrega Expressa', price: 29.99, estimatedDays: 3 },
  { id: 'same_day', name: 'Entrega no Mesmo Dia', price: 49.99, estimatedDays: 0 }
];

const paymentMethods: PaymentMethod[] = [
  { id: 'credit_card', name: 'Cartão de Crédito', icon: 'credit-card' },
  { id: 'paypal', name: 'PayPal', icon: 'paypal' },
  { id: 'pix', name: 'Pix', icon: 'pix' },
  { id: 'bank_slip', name: 'Boleto Bancário', icon: 'bank-slip' }
];

export default function Checkout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  
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

  // Verificar a validade do formulário quando os dados mudarem
  useEffect(() => {
    const requiredFields = [
      'email', 'firstName', 'lastName', 'address', 'addressNumber',
      'neighborhood', 'city', 'state', 'zipCode', 'phone', 'shippingMethod', 'paymentMethod'
    ];
    
    const allFieldsValid = requiredFields.every(field => formData[field as keyof CheckoutFormData]);
    setIsFormValid(allFieldsValid);
  }, [formData]);

  // Atualizar o método de envio selecionado
  useEffect(() => {
    if (formData.shippingMethod) {
      const selected = shippingOptions.find(option => option.id === formData.shippingMethod);
      setSelectedShipping(selected || null);
    } else {
      setSelectedShipping(null);
    }
  }, [formData.shippingMethod]);

  // Atualizar o método de pagamento selecionado
  useEffect(() => {
    if (formData.paymentMethod) {
      const selected = paymentMethods.find(method => method.id === formData.paymentMethod);
      setSelectedPayment(selected || null);
    } else {
      setSelectedPayment(null);
    }
  }, [formData.paymentMethod]);

  // Mutação para criar um pedido
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      if (!response.ok) {
        throw new Error('Falha ao criar pedido');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      // Limpar o carrinho após o pedido ser criado com sucesso
      localStorage.removeItem('cartId');
      queryClient.invalidateQueries({ queryKey: [`/api/carts/${cartId}`] });
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${data.id} foi confirmado e está sendo processado.`
      });
      
      // Redirecionar para a página de confirmação de pedido
      navigate(`/pedido-confirmado/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Erro ao processar pedido",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !cart) {
      toast({
        title: "Formulário incompleto",
        description: "Por favor, preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessingPayment(true);
    
    // Criar o objeto de pedido
    const orderData = {
      projectId,
      cartId: cart.id,
      customerInfo: {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      },
      shippingAddress: {
        address: formData.address,
        number: formData.addressNumber,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'Brasil'
      },
      shippingMethod: formData.shippingMethod,
      shippingPrice: selectedShipping?.price || 0,
      paymentMethod: formData.paymentMethod,
      subtotal: cart.total,
      total: cart.total + (selectedShipping?.price || 0),
      items: cart.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      }))
    };
    
    // Chamar a mutação para criar o pedido
    try {
      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      // Erro já tratado no onError da mutação
    }
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

  // Calcular o total (subtotal + frete)
  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.total + (selectedShipping?.price || 0);
  };

  // Renderização para carregamento
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>
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
        <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>
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
        <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>
        <div className="text-center bg-gray-50 p-10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-xl font-medium mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Você precisa adicionar produtos ao carrinho antes de finalizar a compra.</p>
          <Link href="/produtos" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Explorar produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Formulário de checkout */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações pessoais */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">Nome *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-1">Sobrenome *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Endereço de entrega */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="zipCode" className="block text-sm font-medium mb-1">CEP *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium mb-1">Endereço *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                  
                  <div className="col-span-3 md:col-span-1">
                    <label htmlFor="addressNumber" className="block text-sm font-medium mb-1">Número *</label>
                    <input
                      type="text"
                      id="addressNumber"
                      name="addressNumber"
                      value={formData.addressNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="complement" className="block text-sm font-medium mb-1">Complemento</label>
                  <input
                    type="text"
                    id="complement"
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                
                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium mb-1">Bairro *</label>
                  <input
                    type="text"
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">Cidade *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-1">Estado *</label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Método de envio */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Método de Envio</h2>
              
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label 
                    key={option.id} 
                    className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors ${
                      formData.shippingMethod === option.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-secondary/10'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={option.id}
                        checked={formData.shippingMethod === option.id}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-foreground/70">
                          {option.estimatedDays === 0 
                            ? 'Entrega hoje' 
                            : `Entrega em até ${option.estimatedDays} ${option.estimatedDays === 1 ? 'dia' : 'dias'}`}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">{formatPrice(option.price)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Método de pagamento */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Método de Pagamento</h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.id} 
                    className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${
                      formData.paymentMethod === method.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-secondary/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleInputChange}
                      className="mr-3 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center mr-3 bg-secondary/30 rounded">
                        {method.icon === 'credit-card' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        )}
                        {method.icon === 'paypal' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {method.icon === 'pix' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        {method.icon === 'bank-slip' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              {formData.paymentMethod === 'credit_card' && (
                <div className="mt-4 p-4 border rounded-md bg-secondary/10">
                  <p className="text-sm text-foreground/70 mb-2">Os detalhes do cartão serão solicitados no próximo passo.</p>
                </div>
              )}
              
              {formData.paymentMethod === 'paypal' && (
                <div className="mt-4 p-4 border rounded-md">
                  <h3 className="text-md font-medium mb-3">Pagamento via PayPal</h3>
                  <p className="text-sm text-foreground/70 mb-4">Clique no botão abaixo para finalizar seu pagamento com segurança através do PayPal.</p>
                  
                  <div className="flex justify-center">
                    <PayPalButton 
                      amount={calculateTotal().toString()}
                      currency="BRL"
                      intent="CAPTURE"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Botão de finalização */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || isProcessingPayment}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processando...
                  </>
                ) : (
                  'Finalizar Pedido'
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Resumo do pedido */}
        <div className="lg:w-1/3">
          <div className="bg-card rounded-lg shadow-sm p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center py-2 border-b last:border-b-0">
                  <div className="h-16 w-16 flex-shrink-0 rounded-md border overflow-hidden mr-3">
                    <img 
                      src={parseProductImage(item.product.images)} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-foreground/70">{item.quantity} x {formatPrice(item.price)}</p>
                      <p className="font-medium">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-foreground/70">Subtotal ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} itens)</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Frete</span>
                <span>{selectedShipping ? formatPrice(selectedShipping.price) : 'Selecione um método'}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-xl text-primary">{formatPrice(calculateTotal())}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 text-sm text-foreground/70">
              <p className="mb-2">Nós aceitamos:</p>
              <div className="flex space-x-2">
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">Visa</div>
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">Master</div>
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">PayPal</div>
                <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">Pix</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
