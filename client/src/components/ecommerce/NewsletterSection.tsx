import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  backgroundClass?: string;
  editable?: boolean;
  onEdit?: () => void;
  projectId: number;
}

export function NewsletterSection({
  title = 'Inscreva-se em nossa newsletter',
  subtitle = 'Fique por dentro das novidades, lançamentos e ofertas exclusivas.',
  buttonText = 'Inscrever-se',
  backgroundClass = 'bg-primary',
  editable = false,
  onEdit,
  projectId,
}: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, digite um e-mail válido.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Chamada de API para inscrição na newsletter
      const response = await fetch(`/api/projects/${projectId}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao se inscrever na newsletter');
      }
      
      toast({
        title: 'Inscrição realizada com sucesso!',
        description: 'Obrigado por se inscrever em nossa newsletter.',
      });
      
      setEmail('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Classes de texto para contraste com o fundo
  const textClass = backgroundClass.includes('primary') ? 'text-white' : 'text-foreground';
  const subtitleClass = backgroundClass.includes('primary') ? 'text-white/80' : 'text-foreground/70';
  const inputClass = backgroundClass.includes('primary') 
    ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white' 
    : 'bg-white border-gray-300 text-foreground focus:border-primary';
  const buttonClass = backgroundClass.includes('primary')
    ? 'bg-white text-primary hover:bg-white/90'
    : 'bg-primary text-white hover:bg-primary/90';

  return (
    <div className={`w-full py-12 ${backgroundClass}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto relative">
          {editable && (
            <button
              onClick={onEdit}
              className={`absolute top-0 right-0 p-2 ${backgroundClass.includes('primary') ? 'text-white hover:bg-white/10' : 'text-primary hover:bg-primary/10'} rounded-full transition-colors`}
              title="Editar newsletter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
          
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${textClass}`}>{title}</h2>
            <p className={`${subtitleClass}`}>{subtitle}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu endereço de e-mail"
              className={`flex-1 px-4 py-3 rounded-md border ${inputClass} focus:outline-none transition-colors`}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-md font-medium ${buttonClass} transition-colors flex items-center justify-center disabled:opacity-70`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Enviando...
                </>
              ) : buttonText}
            </button>
          </form>
          
          <p className={`text-xs mt-3 text-center ${subtitleClass}`}>
            Ao inscrever-se, você concorda com nossa política de privacidade e termos de uso.
          </p>
        </div>
      </div>
    </div>
  );
}
