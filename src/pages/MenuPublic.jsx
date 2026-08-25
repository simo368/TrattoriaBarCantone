import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { useSettings } from '../hooks/useSettings';

export default function MenuPublic() {
  const { menu, loading, CATEGORIES } = useMenu();
  const { settings } = useSettings();
  const [activeCategory, setActiveCategory] = useState('');
  
  const categories = CATEGORIES || ['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'vini'];
  
  const prezzoMenu = settings?.prices?.menuFisso || 15;
  const prezzoCoperto = settings?.prices?.coperto || 2;
  
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
    <main className="menu-page bg-crema min-h-screen pb-100">
      
      {/* Intestazione Semplificata */}
      <div className="menu-header bg-crema-dark center px-3">
        <h1 className="title-xxl text-forest m-0">
          Il Menù
        </h1>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky-nav">
        <div className="container max-w-md mx-auto">
          <div className="category-scroll-container">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => scrollToCategory(cat)}
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
                {activeCategory === cat && <span className="category-btn-indicator" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto py-10 px-3">
        
        {/* Menù Fisso */}
        <div className="menu-fisso-card bg-crema-dark mb-xl">
          <div className="flex-between items-baseline mb-3">
            <h3 className="title-md text-forest m-0">
              Menù Fisso Feriale
            </h3>
            <span className="price-badge-lg text-terra fw-600">
              €{Number(prezzoMenu).toFixed(2)}
            </span>
          </div>
          <p className="text-muted m-0 lh-base font-sans">
            Disponibile a pranzo dal lunedì al venerdì. Include primo, secondo con contorno, acqua, quarto di vino e caffè.
          </p>
        </div>

        {/* Categories and Dishes */}
        {loading ? (
          <div className="center p-10">
            <span className="text-lg text-forest-light font-sans">
              Caricamento del menù...
            </span>
          </div>
        ) : !categories.some(cat => (groupedMenu[cat] || []).length > 0) ? (
          <div className="center p-10 bg-crema-dark" style={{ borderRadius: '16px' }}>
            <span className="text-lg text-forest font-sans">
              Il menù è in fase di aggiornamento. Torna a trovarci presto!
            </span>
          </div>
        ) : (
          <div className="flex-col gap-xl">
            {categories.map((cat) => {
              const dishes = groupedMenu[cat] || [];
              
              // Nascondi categorie vuote
              if (dishes.length === 0) return null;

              return (
                <section 
                  key={cat} 
                  ref={el => categoryRefs.current[cat] = el}
                  data-category={cat}
                  className="menu-category-section"
                >
                  <h2 className="category-title">
                    {cat}
                  </h2>
                  
                  <div className="dish-grid">
                    {dishes.map((dish, i) => (
                      <div 
                        key={dish.id || i} 
                        className={`dish-card-styled ${dish.soldOut ? 'sold-out' : ''}`}
                      >
                        {/* A subtle colored line on top for extra beauty */}
                        <div className="dish-card-accent" />

                        <div className="dish-card-header">
                          <h4 className="dish-title">
                            {dish.name}
                          </h4>
                          
                          {dish.price && (
                            <span className="dish-price-badge">
                              € {Number(dish.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {(dish.desc || dish.description) && (
                          <p className="dish-desc font-sans m-0 lh-base flex-grow">
                            {dish.desc || dish.description}
                          </p>
                        )}

                        {dish.soldOut && (
                          <div className="mt-4">
                            <span className="sold-out-badge">
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
        
        <div className="menu-footer text-center">
          <p className="text-muted font-sans text-sm italic mb-4">
            Coperto e pane €{Number(prezzoCoperto).toFixed(2)}.<br/>
            In caso di allergie o intolleranze alimentari, vi invitiamo a informare il nostro personale.
          </p>
          
          {/* CTA Prenota posizionata in fondo per invogliare dopo la lettura */}
          <Link to="/prenota" className="btn btn-primary btn-lg">
            Prenota un tavolo
          </Link>
        </div>
      </div>
    </main>
  );
}
