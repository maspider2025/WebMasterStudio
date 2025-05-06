import React from 'react';
import { Link } from 'wouter';

interface FooterLink {
  id: string;
  label: string;
  href: string;
}

interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logoUrl?: string;
  companyName: string;
  tagline?: string;
  columns: FooterColumn[];
  showSocial?: boolean;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  };
  copyrightText?: string;
  editable?: boolean;
  onEdit?: () => void;
}

export function StoreFooter({
  logoUrl,
  companyName,
  tagline,
  columns = [],
  showSocial = true,
  socialLinks = {},
  copyrightText,
  editable = false,
  onEdit,
}: FooterProps) {
  const year = new Date().getFullYear();
  const copyright = copyrightText || `© ${year} ${companyName}. Todos os direitos reservados.`;

  return (
    <footer className="bg-secondary/10 pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Botão de edição */}
        {editable && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onEdit}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Editar rodapé"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Informações da empresa */}
          <div>
            <div className="flex items-center mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-10 mr-3" />
              ) : (
                <div className="h-10 w-10 bg-primary text-white rounded-md flex items-center justify-center mr-3">
                  <span className="font-bold">{companyName.charAt(0)}</span>
                </div>
              )}
              <h3 className="text-xl font-bold">{companyName}</h3>
            </div>
            
            {tagline && <p className="text-foreground/70 mb-4">{tagline}</p>}
            
            {/* Links sociais */}
            {showSocial && (
              <div className="flex space-x-4 mt-4">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-foreground/70 hover:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.5H14.5V5.6c0-.9.6-1.1 1-1.1h3V.54L14.17.53C10.24.54 9.5 3.48 9.5 5.37V7.5h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-foreground/70 hover:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 2.019c-5.495 0-9.991 4.496-9.991 9.991 0 5.494 4.496 9.99 9.991 9.99 5.494 0 9.99-4.496 9.99-9.99 0-5.495-4.496-9.991-9.99-9.991zm0 1.5c4.68 0 8.49 3.81 8.49 8.491 0 4.68-3.81 8.49-8.49 8.49s-8.491-3.81-8.491-8.49c0-4.681 3.811-8.491 8.491-8.491zm4.303 10.219c-.164.22-.454.59-.931.92-.477.33-.999.507-1.564.53-1.482.06-3-.243-4.353-.727-1.26-.454-2.233-1.06-2.793-1.757-.36-.45-.483-.689-.483-.798 0-.146.092-.242.276-.287.184-.045.395-.06.632-.045.179.015.33.044.453.09.122.044.226.134.313.27.963 1.482 2.513 2.397 5.254 2.607.86.063 1.538-.06 2.133-.452.255-.18.42-.374.495-.583.075-.21.09-.454.045-.733-.12-1.39-1.7-2.396-4.743-2.396-.119 0-.223-.089-.223-.194s.104-.194.223-.194c3.164 0 5.05 1.17 5.17 2.838.045.374 0 .703-.15.992-.149.29-.383.519-.704.689zm1.437-2.47c-.226.09-.436.139-.63.149-.195.015-.375-.015-.54-.075-.33-.149-.42-.419-.27-.823l.095-.24c.225-.569.345-1.124.36-1.663.016-.54-.074-1.035-.27-1.484-.389-.944-1.065-1.694-2.038-2.243-.974-.55-2.103-.763-3.388-.644-1.3.12-2.539.539-3.723 1.259-.104.064-.225.044-.285-.044-.059-.09-.044-.21.045-.27C8.486 3.54 9.83 3.09 11.222 2.96c1.455-.135 2.719.09 3.798.689 1.08.6 1.857 1.424 2.33 2.473.225.524.324 1.078.295 1.663-.031.584-.164 1.185-.404 1.799l-.09.225c-.046.119-.031.21.03.254.059.046.09.046.135 0 .09-.09.18-.134.27-.134.09 0 .165.044.24.134.074.89.074.179 0 .269-.077.089-.121.134-.136.134z"/></svg>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-foreground/70 hover:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.126 1.195 4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"/></svg>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-foreground/70 hover:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-foreground/70 hover:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-foreground/70 hover:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* Colunas de links */}
          {columns.map((column) => (
            <div key={column.id}>
              <h3 className="font-bold mb-4 text-foreground">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="text-foreground/70 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Linha divisória */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/70 text-sm mb-4 md:mb-0">{copyright}</p>
            
            <div className="flex space-x-4">
              <Link href="/termos-de-servico" className="text-foreground/70 hover:text-primary text-sm transition-colors">
                Termos de Serviço
              </Link>
              <Link href="/politica-de-privacidade" className="text-foreground/70 hover:text-primary text-sm transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
