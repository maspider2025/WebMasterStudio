import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import CheckoutPaypal from './CheckoutPaypal';

interface PaymentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentSectionProps {
  amount: number;
  onPaymentComplete?: (data: any) => void;
  onPaymentError?: (error: any) => void;
  className?: string;
}

export default function PaymentSection({
  amount,
  onPaymentComplete,
  onPaymentError,
  className = '',
}: PaymentSectionProps) {
  const [selectedPayment, setSelectedPayment] = useState<string>('credit-card');
  const { toast } = useToast();

  const paymentOptions: PaymentOption[] = [
    {
      id: 'credit-card',
      name: 'Cartão de Crédito',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      description: 'Pague com seu cartão de crédito em até 12x',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5 10.5C6.5 10.5 6.5 9 8 9C9.5 9 17.5 9 17.5 9C17.5 9 17.5 7.5 16 7.5C14.5 7.5 8 7.5 8 7.5C8 7.5 8 6 9.5 6C11 6 14.5 6 14.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.5 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.5 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5 9.5V18.5H5.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: 'Pagamento seguro e rápido via PayPal',
    },
    {
      id: 'pix',
      name: 'Pix',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L15.5 7.5L14 9L12 7L10 9L8.5 7.5L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 20L8.5 16.5L10 15L12 17L14 15L15.5 16.5L12 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12L16.5 8.5L15 10L17 12L15 14L16.5 15.5L20 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12L7.5 15.5L9 14L7 12L9 10L7.5 8.5L4 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: 'Transferência instantânea via Pix',
    },
  ];

  const handleCreditCardPayment = () => {
    // Aqui estará a integração com o processador de cartão
    toast({
      title: 'Em desenvolvimento',
      description: 'A integração com cartão de crédito está sendo implementada.',
    });
  };

  const handlePixPayment = () => {
    // Aqui estará a integração com o Pix
    toast({
      title: 'Em desenvolvimento',
      description: 'A integração com Pix está sendo implementada.',
    });
  };

  const renderPaymentMethod = () => {
    switch (selectedPayment) {
      case 'credit-card':
        return (
          <div className="credit-card-form space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Número do Cartão</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nome no Cartão</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Ex: JOSE SILVA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Validade</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="MM/AA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código de Segurança</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="CVV"
                />
              </div>
            </div>
            <button
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-md transition-colors"
              onClick={handleCreditCardPayment}
            >
              Pagar {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
            </button>
          </div>
        );
      case 'paypal':
        return (
          <CheckoutPaypal
            amount={amount}
            onSuccess={onPaymentComplete}
            onError={onPaymentError}
          />
        );
      case 'pix':
        return (
          <div className="pix-payment space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L15.5 7.5L14 9L12 7L10 9L8.5 7.5L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 20L8.5 16.5L10 15L12 17L14 15L15.5 16.5L12 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 12L16.5 8.5L15 10L17 12L15 14L16.5 15.5L20 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 12L7.5 15.5L9 14L7 12L9 10L7.5 8.5L4 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-800">Pague com PIX</h3>
                <p className="text-sm text-green-700">Você pode pagar via QR Code ou cópigo PIX a seguir.</p>
              </div>
            </div>

            <div className="border rounded-lg p-4 flex flex-col items-center">
              <div className="bg-gray-100 p-4 mb-4 rounded-md">
                <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="#FFFFFF" />
                  <path d="M10 10H20V20H10V10ZM30 10H40V20H30V10ZM50 10H60V20H50V10ZM70 10H80V20H70V10ZM10 30H20V40H10V30ZM30 30H40V40H30V30ZM50 30H60V40H50V30ZM70 30H80V40H70V30ZM10 50H20V60H10V50ZM30 50H40V60H30V50ZM50 50H60V60H50V50ZM70 50H80V60H70V50ZM10 70H20V80H10V70ZM30 70H40V80H30V70ZM50 70H60V80H50V70ZM70 70H80V80H70V70Z" fill="#000000" />
                </svg>
              </div>

              <div className="text-center w-full">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors w-full mb-2"
                  onClick={handlePixPayment}
                >
                  Copiar código PIX
                </button>
                <p className="text-sm text-gray-500">
                  Após o pagamento, o pedido será processado automaticamente.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`payment-section ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>

      <div className="payment-options mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {paymentOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedPayment === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPayment(option.id)}
            >
              <div className="flex items-center mb-2">
                <div className="mr-3">{option.icon}</div>
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="payment-form">{renderPaymentMethod()}</div>
    </div>
  );
}
