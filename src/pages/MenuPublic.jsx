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
      const headerOffset = 150; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // IntersectionObserver per aggiornare la categoria attiva
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.reduce((prev, current) => 
          (prev.boundingClientRect.top < current.boundingClientRect.top) ? prev : current
        );
        if (topEntry && topEntry.target.dataset.category) {
          setActiveCategory(topEntry.target.dataset.category);
        }
      }
    }, {
      rootMargin: '-150px 0px -70% 0px',
      threshold: 0
    });

    Object.values(categoryRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading, menu]);

  // Imposta categoria iniziale
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
    <main className="menu-page-new bg-crema min-h-screen">
      <div className="container py-xl">
        <div className="menu-layout">
          
          {/* SINISTRA: Sticky Sidebar */}
          <div className="menu-sidebar">
            <div className="sticky-inner">
              <h1 className="title-xl mb-4">Il nostro menù.</h1>
              <p className="text-lead text-forest-dark mb-5 font-sans">
                {settings?.description || "Ricette tramandate di generazione in generazione. Pasta fresca tirata a mano ogni mattina."}
              </p>
              <img 
                src="./img/hero.jpg" 
                alt="I nostri piatti" 
                loading="lazy" 
                className="menu-sidebar-img" 
                onError={(e) => e.target.src='./img/hero.jpg'} 
              />
            </div>
          </div>

          {/* DESTRA: Contenuto */}
          <div className="menu-content">
            
            {/* Categorie orizzontali nativo */}
            <div className="menu-categories-scroll mb-5">
              {categories.map((cat) => {
                const hasDishes = (groupedMenu[cat] || []).length > 0;
                if (!hasDishes) return null;
                
                return (
                  <button 
                    key={cat} 
                    onClick={() => scrollToCategory(cat)}
                    className={`menu-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Menu Fisso */}
            <div className="menu-fisso-editorial mb-xl">
              <div className="flex-between items-baseline mb-2">
                <h3 className="title-md m-0">Menù Fisso Feriale</h3>
                <span className="font-sans fw-600 text-lg">€ {Number(prezzoMenu).toFixed(2)}</span>
              </div>
              <p className="text-muted m-0 font-sans">
                Primo, secondo con contorno, acqua, quarto di vino e caffè. Servito a pranzo.
              </p>
            </div>

            {/* Piatti */}
            {loading ? (
              <div className="center p-10 text-muted font-sans text-lg">
                Caricamento del menù...
              </div>
            ) : !categories.some(cat => (groupedMenu[cat] || []).length > 0) ? (
              <div className="center p-10 text-forest font-sans text-lg">
                Il menù è in fase di aggiornamento.
              </div>
            ) : (
              <div className="menu-list flex-col gap-xl">
                {categories.map((cat) => {
                  const dishes = groupedMenu[cat] || [];
                  if (dishes.length === 0) return null;

                  return (
                    <section 
                      key={cat} 
                      ref={el => categoryRefs.current[cat] = el}
                      data-category={cat}
                      className="menu-category-section-editorial"
                    >
                      <h2 className="category-title-editorial">{cat}</h2>
                      
                      <div className="dish-editorial-list">
                        {dishes.map((dish, i) => (
                          <div key={dish.id || i} className={`dish-editorial-row ${dish.soldOut ? 'sold-out' : ''}`}>
                            <div className="dish-editorial-header">
                              <h4 className="dish-editorial-name">
                                {dish.name} 
                                {dish.soldOut && <span className="sold-out-text">ESAURITO</span>}
                              </h4>
                              {dish.price && (
                                <span className="dish-editorial-price">€ {Number(dish.price).toFixed(2)}</span>
                              )}
                            </div>
                            
                            {(dish.desc || dish.description) && (
                              <p className="dish-editorial-desc">{dish.desc || dish.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
            
            {/* CTA e Info finali */}
            <div className="menu-footer-editorial center mt-xl pt-5 border-t">
              <p className="text-muted font-sans text-sm italic mb-5">
                Coperto e pane €{Number(prezzoCoperto).toFixed(2)}.<br/>
                In caso di allergie o intolleranze alimentari, vi invitiamo a informare il nostro personale.
              </p>
              
              <Link to="/prenota" className="btn btn-primary btn-xl">
                Prenota un tavolo
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
