import React from 'react';
import { Link, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function OrderConfirmation() {
  // Obter o ID do pedido dos parâmetros da URL
  const { orderId } = useParams<{ orderId: string }>();
  
  // Consulta para obter dados do pedido (em um sistema real)
  // Esta aplicação de demonstração não tem uma rota real para pedidos individuais ainda
  const { isLoading, error, data: order } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
    // Como não temos uma API real para pedidos individuais, vamos supor que o pedido existe
    // Em uma aplicação de produção, você usaria o código comentado abaixo
    /*
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Falha ao obter pedido');
      }
      return response.json();
    },
    */
    // Simular uma resposta para fins de demonstração
    queryFn: async () => {
      // Simulando um delay para efeito realista
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: orderId,
        status: 'processing',
        customerInfo: {
          email: 'cliente@exemplo.com',
          firstName: 'João',
          lastName: 'Silva'
        },
        total: 129.90,
        paymentMethod: 'credit_card',
        shippingMethod: 'express',
        createdAt: new Date().toISOString()
      };
    }
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'pending': { text: 'Pendente', color: 'text-yellow-600 bg-yellow-100' },
      'processing': { text: 'Em processamento', color: 'text-blue-600 bg-blue-100' },
      'completed': { text: 'Concluído', color: 'text-green-600 bg-green-100' },
      'cancelled': { text: 'Cancelado', color: 'text-red-600 bg-red-100' },
      'refunded': { text: 'Reembolsado', color: 'text-purple-600 bg-purple-100' }
    };
    
    return statusMap[status] || { text: 'Desconhecido', color: 'text-gray-600 bg-gray-100' };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
          <p className="text-gray-600 mb-6">Não foi possível encontrar o pedido solicitado. Por favor, verifique o número do pedido e tente novamente.</p>
          <Link href="/" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  // Obter informações de status
  const status = getStatusText(order?.status || 'pending');

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold mb-2">Pedido recebido!</h1>
          <p className="text-xl text-gray-600">Obrigado pela sua compra.</p>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Pedido #{order?.id}</h2>
                <p className="text-gray-600 mt-1">{order?.createdAt ? formatDate(order.createdAt) : ''}</p>
              </div>
              <div className={`px-3 py-1 rounded-full ${status.color}`}>
                <span className="text-sm font-medium">{status.text}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Detalhes do pedido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-1">Informações do cliente</p>
                  <p className="font-medium">{order?.customerInfo?.firstName} {order?.customerInfo?.lastName}</p>
                  <p>{order?.customerInfo?.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Método de pagamento</p>
                  <p className="font-medium">
                    {order?.paymentMethod === 'credit_card' && 'Cartão de Crédito'}
                    {order?.paymentMethod === 'paypal' && 'PayPal'}
                    {order?.paymentMethod === 'pix' && 'Pix'}
                    {order?.paymentMethod === 'bank_slip' && 'Boleto Bancário'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Envio</h3>
              <div>
                <p className="text-gray-600 mb-1">Método de envio</p>
                <p className="font-medium">
                  {order?.shippingMethod === 'standard' && 'Entrega Padrão'}
                  {order?.shippingMethod === 'express' && 'Entrega Expressa'}
                  {order?.shippingMethod === 'same_day' && 'Entrega no Mesmo Dia'}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Resumo</h3>
              <div className="text-right">
                <div className="text-xl font-bold">
                  Total: {order?.total ? formatPrice(order.total) : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link href="/produtos" className="px-4 py-2 border rounded-md hover:bg-secondary/20 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continuar comprando
          </Link>
          
          <Link href="/" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
