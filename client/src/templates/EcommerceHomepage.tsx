import React from 'react';
import {
  ProductCarousel,
  PromotionalBanner,
  FeaturedCategories,
  TestimonialSection,
  NewsletterSection,
  StoreFooter,
  FeatureGrid
} from '@/components/ecommerce';
import { FeatureIcons } from '@/components/ecommerce/FeatureGrid';

interface EcommerceHomepageProps {
  projectId: number;
  editable?: boolean;
  onEditSection?: (sectionId: string) => void;
}

export function EcommerceHomepage({
  projectId,
  editable = false,
  onEditSection,
}: EcommerceHomepageProps) {
  // Exemplo de testemunhos
  const testimonials = [
    {
      id: 1,
      author: 'Ana Silva',
      role: 'Cliente Fidelizada',
      rating: 5,
      content: 'Produtos incríveis e atendimento excepcional! Compro nesta loja há anos e nunca me decepcionei. Recomendo a todos meus amigos e familiares.',
    },
    {
      id: 2,
      author: 'Rafael Souza',
      role: 'Cliente Novo',
      rating: 4,
      content: 'Primeira compra e já posso dizer que superou minhas expectativas. Entrega rápida e produto conforme descrito no site. Certamente voltarei a comprar.',
    },
    {
      id: 3,
      author: 'Carla Mendes',
      role: 'Cliente Frequente',
      rating: 5,
      content: 'Preços competitivos e variedade de produtos incomparável. O serviço de atendimento ao cliente responde rápido e resolve qualquer problema eficientemente.',
    },
  ];

  // Exemplo de colunas do rodapé
  const footerColumns = [
    {
      id: 'info',
      title: 'Informações',
      links: [
        { id: 'about', label: 'Sobre Nós', href: '/sobre' },
        { id: 'contact', label: 'Contato', href: '/contato' },
        { id: 'faq', label: 'Perguntas Frequentes', href: '/faq' },
        { id: 'blog', label: 'Blog', href: '/blog' },
      ],
    },
    {
      id: 'customer',
      title: 'Atendimento',
      links: [
        { id: 'orders', label: 'Meus Pedidos', href: '/minha-conta/pedidos' },
        { id: 'shipping', label: 'Entrega e Frete', href: '/entrega' },
        { id: 'returns', label: 'Trocas e Devoluções', href: '/devolucoes' },
        { id: 'warranty', label: 'Garantia', href: '/garantia' },
      ],
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { id: 'terms', label: 'Termos de Serviço', href: '/termos-de-servico' },
        { id: 'privacy', label: 'Política de Privacidade', href: '/politica-de-privacidade' },
        { id: 'cookies', label: 'Política de Cookies', href: '/politica-de-cookies' },
      ],
    },
  ];

  // Handler para edição de seção
  const handleEdit = (sectionId: string) => {
    if (onEditSection) {
      onEditSection(sectionId);
    }
  };

  return (
    <div className="w-full">
      {/* Banner Principal */}
      <PromotionalBanner
        title="Nova Coleção de Verão"
        subtitle="Chegou agora"
        description="Descubra nossas peças exclusivas com 20% de desconto por tempo limitado. Estilo, qualidade e conforto para você aproveitar a estação."
        buttonText="Comprar Agora"
        buttonLink="/produtos?colecao=verao"
        imageSrc="https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?q=80&w=2069"
        layout="left"
        height="h-[600px]"
        editable={editable}
        onEdit={() => handleEdit('mainBanner')}
      />

      {/* Grade de Características */}
      <FeatureGrid
        features={[
          {
            id: '1',
            icon: FeatureIcons.truck,
            title: 'Entrega Rápida',
            description: 'Enviamos seus pedidos em até 24 horas após a confirmação do pagamento.',
          },
          {
            id: '2',
            icon: FeatureIcons.shield,
            title: 'Compra Segura',
            description: 'Seus dados estão protegidos com a mais alta tecnologia de criptografia.',
          },
          {
            id: '3',
            icon: FeatureIcons.headphones,
            title: 'Suporte 24/7',
            description: 'Nossa equipe está disponível para ajudar você a qualquer momento.',
          },
          {
            id: '4',
            icon: FeatureIcons.refresh,
            title: 'Troca Fácil',
            description: 'Política de devolução simplificada para sua conveniência.',
          },
        ]}
        editable={editable}
        onEdit={() => handleEdit('features')}
      />

      {/* Produtos Mais Vendidos */}
      <ProductCarousel
        title="Mais Vendidos"
        subtitle="Nossos produtos mais populares"
        projectId={projectId}
        featured={true}
        limit={8}
        editable={editable}
        onEdit={() => handleEdit('bestSellers')}
      />

      {/* Banner Promocional Secundário */}
      <PromotionalBanner
        title="Oferta Especial"
        subtitle="Tempo Limitado"
        description="Até 50% de desconto em produtos selecionados. Aproveite enquanto dura!"
        buttonText="Ver Ofertas"
        buttonLink="/produtos?promocao=true"
        imageSrc="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070"
        layout="right"
        height="h-[400px]"
        editable={editable}
        onEdit={() => handleEdit('specialOffer')}
      />

      {/* Categorias em Destaque */}
      <FeaturedCategories
        title="Explore Nossas Categorias"
        subtitle="Encontre o que você procura"
        projectId={projectId}
        editable={editable}
        onEdit={() => handleEdit('categories')}
      />

      {/* Novos Produtos */}
      <ProductCarousel
        title="Novidades"
        subtitle="Acabaram de chegar"
        projectId={projectId}
        limit={8}
        editable={editable}
        onEdit={() => handleEdit('newArrivals')}
      />

      {/* Testemunhos */}
      <TestimonialSection
        title="O Que Nossos Clientes Dizem"
        subtitle="Opiniões de quem já comprou conosco"
        testimonials={testimonials}
        editable={editable}
        onEdit={() => handleEdit('testimonials')}
      />

      {/* Newsletter */}
      <NewsletterSection
        projectId={projectId}
        editable={editable}
        onEdit={() => handleEdit('newsletter')}
      />

      {/* Rodapé */}
      <StoreFooter
        companyName="NextGen Shop"
        tagline="Sua loja online para produtos de qualidade."
        columns={footerColumns}
        socialLinks={{
          facebook: "https://facebook.com",
          instagram: "https://instagram.com",
          twitter: "https://twitter.com",
        }}
        editable={editable}
        onEdit={() => handleEdit('footer')}
      />
    </div>
  );
}
