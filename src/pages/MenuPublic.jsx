import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';

export default function MenuPublic() {
  const { menu, loading, CATEGORIES } = useMenu();
  const [activeCategory, setActiveCategory] = useState('');
  
  const categories = CATEGORIES || ['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'vini'];
  
  const categoryRefs = useRef({});

  // Scorre alla categoria
  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const element = categoryRefs.current[cat];
    if (element) {
      // Calcola l'offset per l'header + sticky nav (circa 130px)
      const headerOffset = 130; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // IntersectionObserver per aggiornare la categoria attiva durante lo scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // Trova le entry visibili
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Prendi quella più in alto
        const topEntry = visibleEntries.reduce((prev, current) => 
          (prev.boundingClientRect.top < current.boundingClientRect.top) ? prev : current
        );
        if (topEntry && topEntry.target.dataset.category) {
          setActiveCategory(topEntry.target.dataset.category);
        }
      }
    }, {
      rootMargin: '-130px 0px -70% 0px', // Trigger quando l'elemento è nella parte alta
      threshold: 0
    });

    Object.values(categoryRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading, menu]);

  // Imposta categoria iniziale se vuota
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Raggruppa i piatti
  const groupedMenu = {};
  if (Array.isArray(menu)) {
    categories.forEach(cat => {
      groupedMenu[cat] = menu.filter(m => m.category === cat && m.active !== false);
    });
  } else {
    categories.forEach(cat => {
      groupedMenu[cat] = (menu[cat] || []).filter(m => m.active !== false);
    });
  }

  return (
    <main className="menu-page" style={{ backgroundColor: 'var(--c-crema)', minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* Intestazione Semplificata */}
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px 30px',
        backgroundColor: 'var(--c-crema-dark)'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          color: 'var(--c-forest)', 
          margin: 0
        }}>
          Il Menù
        </h1>
      </div>

      {/* Sticky Navigation */}
      <div style={{
        position: 'sticky',
        top: '60px', // Header di base circa 60-70px
        zIndex: 100,
        backgroundColor: 'rgba(244, 241, 236, 0.95)', // var(--c-crema) con trasparenza
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(26,36,33,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            overflowX: 'auto', 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <style>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => scrollToCategory(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.1rem',
                  fontWeight: activeCategory === cat ? 600 : 400,
                  color: activeCategory === cat ? 'var(--c-forest)' : 'var(--c-forest-light)',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '4px 0',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat}
                {activeCategory === cat && (
                  <span style={{ 
                    position: 'absolute', 
                    bottom: '-8px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%',
                    backgroundColor: 'var(--c-terra)' 
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Menù Fisso */}
        <div style={{ 
          backgroundColor: 'var(--c-crema-dark)', 
          padding: '32px', 
          borderRadius: '8px',
          marginBottom: '60px',
          borderLeft: '4px solid var(--c-terra)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <h3 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.8rem', 
              color: 'var(--c-forest)', 
              margin: 0 
            }}>
              Menù Fisso Feriale
            </h3>
            <span style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '1.4rem', 
              color: 'var(--c-terra)', 
              fontWeight: 600 
            }}>
              €15.00
            </span>
          </div>
          <p style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '1rem', 
            color: 'var(--c-text-muted)', 
            margin: 0,
            lineHeight: 1.5
          }}>
            Disponibile a pranzo dal lunedì al venerdì. Include primo, secondo con contorno, acqua, quarto di vino e caffè.
          </p>
        </div>

        {/* Categories and Dishes */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--c-forest-light)' }}>
              Caricamento del menù...
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            {categories.map((cat) => {
              const dishes = groupedMenu[cat] || [];
              
              // Nascondi categorie vuote
              if (dishes.length === 0) return null;

              return (
                <section 
                  key={cat} 
                  ref={el => categoryRefs.current[cat] = el}
                  data-category={cat}
                  style={{ scrollMarginTop: '150px' }} // Fallback per lo scroll nativo se si usa #hash
                >
                  <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2.5rem',
                    color: 'var(--c-forest)',
                    textTransform: 'capitalize',
                    borderBottom: '2px solid var(--c-crema-dark)',
                    paddingBottom: '16px',
                    marginBottom: '32px',
                    marginTop: 0
                  }}>
                    {cat}
                  </h2>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '24px' 
                  }}>
                    {dishes.map((dish, i) => (
                      <div 
                        key={dish.id || i} 
                        className="dish-card" // Added a class just in case we want to target it with CSS later
                        style={{ 
                          opacity: dish.soldOut ? 0.7 : 1,
                          backgroundColor: '#ffffff',
                          borderRadius: '16px',
                          padding: '28px',
                          boxShadow: '0 8px 30px rgba(26,36,33,0.06)',
                          border: '1px solid rgba(26,36,33,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* A subtle colored line on top for extra beauty */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          backgroundColor: 'var(--c-terra)',
                          opacity: 0.8
                        }} />

                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          gap: '16px',
                          marginBottom: '16px'
                        }}>
                          <h4 style={{ 
                            fontFamily: 'var(--font-serif)', 
                            fontSize: '1.4rem', 
                            fontWeight: 600,
                            color: 'var(--c-forest)', 
                            margin: 0,
                            lineHeight: 1.2
                          }}>
                            {dish.name}
                          </h4>
                          
                          {dish.price && (
                            <span style={{ 
                              fontFamily: 'var(--font-sans)', 
                              fontSize: '1.25rem', 
                              color: 'var(--c-terra)', 
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              backgroundColor: 'var(--c-crema)',
                              padding: '6px 14px',
                              borderRadius: '24px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}>
                              € {Number(dish.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {(dish.desc || dish.description) && (
                          <p style={{ 
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1rem', 
                            color: 'var(--c-text-muted)', 
                            margin: 0, 
                            lineHeight: '1.6',
                            flexGrow: 1
                          }}>
                            {dish.desc || dish.description}
                          </p>
                        )}

                        {dish.soldOut && (
                          <div style={{ marginTop: '20px' }}>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.1em', 
                              color: 'var(--c-terra)', 
                              backgroundColor: 'rgba(217, 72, 15, 0.1)',
                              padding: '6px 12px', 
                              borderRadius: '4px',
                              display: 'inline-block'
                            }}>
                              Esaurito
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
        
        <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(26,36,33,0.1)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--c-text-muted)', fontStyle: 'italic', marginBottom: '32px' }}>
            Coperto e pane €2.00.<br/>
            In caso di allergie o intolleranze alimentari, vi invitiamo a informare il nostro personale.
          </p>
          
          {/* CTA Prenota posizionata in fondo per invogliare dopo la lettura */}
          <Link to="/prenota" className="btn" style={{ 
            display: 'inline-block',
            backgroundColor: 'var(--c-terra)',
            color: '#fff',
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '1.1rem',
            fontWeight: 500,
            padding: '16px 40px',
            borderRadius: '4px',
            transition: 'opacity 0.3s ease'
          }}>
            Prenota un tavolo
          </Link>
        </div>
      </div>
    </main>
  );
}
