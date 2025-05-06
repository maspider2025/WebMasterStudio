import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import PayPalButton from '../PayPalButton';

interface CheckoutPaypalProps {
  amount: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  buttonClassName?: string;
}

export default function CheckoutPaypal({
  amount,
  onSuccess,
  onError,
  buttonClassName = 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md w-full mb-4 flex items-center justify-center',
}: CheckoutPaypalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Convertendo o valor para string conforme esperado pelo componente PayPalButton
  const formattedAmount = amount.toFixed(2);
  
  const handlePaypalSuccess = (data: any) => {
    setIsLoading(false);
    toast({
      title: 'Pagamento realizado com sucesso!',
      description: 'Seu pagamento via PayPal foi processado.',
    });
    if (onSuccess) {
      onSuccess(data);
    }
  };
  
  const handlePaypalError = (error: any) => {
    setIsLoading(false);
    toast({
      title: 'Erro no pagamento',
      description: 'Houve um problema ao processar seu pagamento via PayPal.',
      variant: 'destructive',
    });
    if (onError) {
      onError(error);
    }
  };
  
  return (
    <div className="paypal-checkout-container">
      <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.25C17.3848 21.25 21.75 16.8848 21.75 11.5C21.75 6.11522 17.3848 1.75 12 1.75C6.61522 1.75 2.25 6.11522 2.25 11.5C2.25 16.8848 6.61522 21.25 12 21.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 7.5H12V14.5H11V7.5Z" fill="currentColor"/>
          <path d="M11.5 17.5C12.0523 17.5 12.5 17.0523 12.5 16.5C12.5 15.9477 12.0523 15.5 11.5 15.5C10.9477 15.5 10.5 15.9477 10.5 16.5C10.5 17.0523 10.9477 17.5 11.5 17.5Z" fill="currentColor"/>
        </svg>
        <span className="text-sm text-blue-700">Você será redirecionado para a página de pagamento do PayPal para finalizar sua compra com segurança.</span>
      </div>
      
      <div className="paypal-button-container mb-4">
        <button 
          className={buttonClassName}
          onClick={() => setIsLoading(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 10.5C6.5 10.5 6.5 9 8 9C9.5 9 17.5 9 17.5 9C17.5 9 17.5 7.5 16 7.5C14.5 7.5 8 7.5 8 7.5C8 7.5 8 6 9.5 6C11 6 14.5 6 14.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.5 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.5 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 9.5V18.5H5.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pagar com PayPal
            </>
          )}
        </button>
        
        {/* PayPal Button (invisível mas funcional) */}
        <div className="hidden">
          <PayPalButton 
            amount={formattedAmount}
            currency="BRL"
            intent="CAPTURE"
          />
        </div>
      </div>
    </div>
  );
}
