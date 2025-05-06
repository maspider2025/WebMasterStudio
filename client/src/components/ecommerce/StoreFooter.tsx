import React from 'react';
import { Link } from 'wouter';

interface StoreFooterProps {
  storeName?: string;
  links?: Array<{section: string, items: Array<{label: string, href: string}>}>
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks?: Array<{platform: string, url: string, icon: React.ReactNode}>;
  paymentMethods?: Array<{name: string, icon: React.ReactNode}>;
}

export default function StoreFooter({
  storeName = 'Loja Virtual',
  links,
  contactInfo = {
    email: 'contato@exemplo.com',
    phone: '(11) 99999-9999',
    address: 'Av. Exemplo, 123 - Exemplo, São Paulo - SP',
  },
  socialLinks,
  paymentMethods,
}: StoreFooterProps) {
  // Links padrão caso não sejam fornecidos
  const defaultLinks = [
    {
      section: 'Institucional',
      items: [
        { label: 'Sobre nós', href: '/sobre' },
        { label: 'Política de Privacidade', href: '/privacidade' },
        { label: 'Termos de Uso', href: '/termos' },
        { label: 'Perguntas Frequentes', href: '/faq' },
      ],
    },
    {
      section: 'Compras',
      items: [
        { label: 'Como Comprar', href: '/como-comprar' },
        { label: 'Formas de Pagamento', href: '/pagamento' },
        { label: 'Entrega', href: '/entrega' },
        { label: 'Trocas e Devoluções', href: '/trocas' },
      ],
    },
    {
      section: 'Minha Conta',
      items: [
        { label: 'Meus Pedidos', href: '/minha-conta/pedidos' },
        { label: 'Meus Endereços', href: '/minha-conta/enderecos' },
        { label: 'Meus Dados', href: '/minha-conta/dados' },
        { label: 'Fale Conosco', href: '/contato' },
      ],
    },
  ];

  // Ícones de redes sociais padrão
  const defaultSocialLinks = [
    {
      platform: 'Instagram',
      url: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      platform: 'Facebook',
      url: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      platform: 'YouTube',
      url: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  // Métodos de pagamento padrão
  const defaultPaymentMethods = [
    {
      name: 'Cartão de Crédito',
      icon: (
        <svg className="w-8 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: 'PayPal',
      icon: (
        <svg className="w-8 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5 10.5C6.5 10.5 6.5 9 8 9C9.5 9 17.5 9 17.5 9C17.5 9 17.5 7.5 16 7.5C14.5 7.5 8 7.5 8 7.5C8 7.5 8 6 9.5 6C11 6 14.5 6 14.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.5 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.5 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5 9.5V18.5H5.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: 'Pix',
      icon: (
        <svg className="w-8 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L15.5 7.5L14 9L12 7L10 9L8.5 7.5L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 20L8.5 16.5L10 15L12 17L14 15L15.5 16.5L12 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12L16.5 8.5L15 10L17 12L15 14L16.5 15.5L20 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12L7.5 15.5L9 14L7 12L9 10L7.5 8.5L4 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  // Usar props ou valores padrão
  const footerLinks = links || defaultLinks;
  const footerSocialLinks = socialLinks || defaultSocialLinks;
  const footerPaymentMethods = paymentMethods || defaultPaymentMethods;

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Informações da loja */}
          <div>
            <h3 className="text-xl font-bold mb-4">{storeName}</h3>
            <p className="text-gray-600 mb-4">
              Seu e-commerce completo para compras online com segurança e qualidade.
            </p>
            {contactInfo && (
              <div className="space-y-2">
                {contactInfo.email && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{contactInfo.email}</span>
                  </div>
                )}
                {contactInfo.phone && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-600">{contactInfo.phone}</span>
                  </div>
                )}
                {contactInfo.address && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600">{contactInfo.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Links do footer */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.section}</h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link href={item.href} className="text-gray-600 hover:text-primary hover:underline transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Redes sociais e pagamentos */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold mb-2">Siga-nos</h4>
              <div className="flex space-x-4">
                {footerSocialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-primary transition-colors"
                    aria-label={social.platform}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Formas de Pagamento</h4>
              <div className="flex space-x-3">
                {footerPaymentMethods.map((payment, index) => (
                  <div key={index} className="text-gray-400" title={payment.name}>
                    {payment.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
          <p className="mt-1">Desenvolvido com NextGen Site Builder</p>
        </div>
      </div>
    </footer>
  );
}
