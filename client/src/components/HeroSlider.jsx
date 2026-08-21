import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSlider({ banners, onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  const slides = banners && banners.length > 0 ? banners : [
    {
      id: 'default-1',
      title: 'Pasture-Raised Tender Goat Cuts',
      subtitle: '100% Grass-Fed, naturally grazed livestock with unmatched tenderness and rich flavor.',
      categoryFilter: 'goat',
      badge: 'Signature Grass-Fed',
      buttonText: 'Explore Goat Cuts',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80'
    }
  ];

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe Handlers for Mobile Browsers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      handleNext(); // swipe left -> next slide
    } else if (diff < -50) {
      handlePrev(); // swipe right -> prev slide
    }
    touchStartX.current = null;
  };

  const handleCtaClick = (slide) => {
    if (slide.categoryFilter && slide.categoryFilter !== 'all') {
      onSelectCategory(slide.categoryFilter);
    } else {
      onSelectCategory('all');
    }
    const productsElem = document.getElementById('products-section');
    if (productsElem) {
      productsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="ksf-hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="ksf-container">
        <div className="ksf-slider-container">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div key={slide.id || idx} className={`ksf-slide ${isActive ? 'active' : ''}`}>
                <picture className="ksf-slide-picture">
                  {slide.mobileImage && (
                    <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                  )}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="ksf-slide-bg"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
                <div className="ksf-slide-overlay">
                  <div className="ksf-slide-content">
                    {slide.badge && (
                      <span className="ksf-slide-badge">
                        <Sparkles size={11} />
                        {slide.badge}
                      </span>
                    )}
                    <h2 className="ksf-slide-title">{slide.title}</h2>
                    <p className="ksf-slide-sub">{slide.subtitle}</p>
                    <button
                      onClick={() => handleCtaClick(slide)}
                      className="btn-slider-cta"
                    >
                      <span>{slide.buttonText || 'Order Fresh Cuts'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Desktop Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="ksf-slider-arrow prev"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={handleNext}
                className="ksf-slider-arrow next"
                aria-label="Next Slide"
              >
                <ChevronRight size={22} />
              </button>

              {/* Dots */}
              <div className="ksf-slider-dots">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    className={`ksf-dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
