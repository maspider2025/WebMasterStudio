import React, { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  author: string;
  role?: string;
  avatar?: string;
  rating: number;
  content: string;
}

interface TestimonialSectionProps {
  title: string;
  subtitle?: string;
  testimonials: Testimonial[];
  backgroundClass?: string;
  autoplay?: boolean;
  autoplaySpeed?: number;
  editable?: boolean;
  onEdit?: () => void;
}

export function TestimonialSection({
  title,
  subtitle,
  testimonials,
  backgroundClass = 'bg-secondary/10',
  autoplay = true,
  autoplaySpeed = 5000,
  editable = false,
  onEdit,
}: TestimonialSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Autoplay
  useEffect(() => {
    if (!autoplay || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [autoplay, autoplaySpeed, testimonials.length]);

  // Navegar para o slide anterior
  const prevSlide = () => {
    if (testimonials.length <= 1) return;
    setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  // Navegar para o próximo slide
  const nextSlide = () => {
    if (testimonials.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  // Renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <svg
        key={index}
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={index < rating ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={index < rating ? 'text-yellow-500' : 'text-gray-300'}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  };

  return (
    <div className={`w-full py-16 ${backgroundClass}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between mb-10">
          <div className="text-center w-full">
            <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
            {subtitle && <p className="text-foreground/70 max-w-2xl mx-auto">{subtitle}</p>}
          </div>
          {editable && (
            <button
              onClick={onEdit}
              className="absolute top-4 right-4 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Editar testemunhos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
        </div>
        
        {testimonials.length > 0 && (
          <div className="relative mx-auto max-w-4xl">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-card p-8 rounded-xl shadow-sm text-center">
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-primary/20 flex items-center justify-center">
                          <span className="text-primary text-xl font-bold">
                            {testimonial.author.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-center mb-4">
                        {renderStars(testimonial.rating)}
                      </div>
                      
                      <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
                      
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.author}</p>
                        {testimonial.role && (
                          <p className="text-sm text-foreground/70">{testimonial.role}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {testimonials.length > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  aria-label="Testemunho anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"></path>
                  </svg>
                </button>
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-gray-300'}`}
                      aria-label={`Ver testemunho ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  aria-label="Próximo testemunho"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
