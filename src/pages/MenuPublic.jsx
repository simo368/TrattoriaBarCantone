import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { useSettings } from '../hooks/useSettings';

export default function MenuPublic() {
  const { menu, loading, CATEGORIES } = useMenu();
  const { settings } = useSettings();

  const categories = CATEGORIES || ['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'vini'];
  const [activeTab, setActiveTab] = useState('');

  const prezzoMenu = settings?.prices?.menuFisso || 15;
  const prezzoCoperto = settings?.prices?.coperto || 2;

  // Imposta prima categoria attiva disponibile
  useEffect(() => {
    if (!activeTab && categories.length > 0) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  // Filtra piatti per categoria attiva
  const currentDishes = Array.isArray(menu) 
    ? menu.filter(m => m.category === activeTab && m.active !== false)
    : (menu[activeTab] || []).filter(m => m.active !== false);

  return (
    <main className="menu-page bg-crema min-h-screen py-xl">
      <div className="container">
        
        {/* INTESTAZIONE */}
        <div className="center mb-xl">
          <span className="eyebrow">Trattoria Bar Cantone</span>
          <h1 className="title-xl mb-4">Il Nostro Menù</h1>
          <p className="section-lead mx-auto">
            {settings?.description || "Ricette tradizionali emiliane tramandate di generazione in generazione. Pasta fresca tirata a mano ogni giorno."}
          </p>
        </div>

        {/* MENU FISSO (Riquadro evidenziato) */}
        <div className="menu-fixed-box mb-xl">
          <div>
            <span className="menu-fixed-label">Disponibile a Pranzo Feriale</span>
            <div className="menu-fixed-name">Menù Fisso Completo</div>
            <p className="text-muted m-0 text-sm mt-1">
              Include primo, secondo con contorno, acqua, quarto di vino e caffè.
            </p>
          </div>
          <div className="menu-fixed-price">
            € {Number(prezzoMenu).toFixed(2)}
          </div>
        </div>

        {/* SELEZIONE CATEGORIE (TABS "primi, secondi", ecc.) */}
        <div className="menu-tabs mb-5">
          {categories.map((cat) => {
            const count = Array.isArray(menu) 
              ? menu.filter(m => m.category === cat && m.active !== false).length
              : (menu[cat] || []).filter(m => m.active !== false).length;

            if (count === 0 && !loading) return null;

            return (
              <button 
                key={cat} 
                onClick={() => setActiveTab(cat)}
                className={`menu-tab ${activeTab === cat ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* LISTA PIATTI IN RIQUADRI (CARDS) */}
        {loading ? (
          <div className="center p-10 text-muted font-sans text-lg">
            Caricamento del menù...
          </div>
        ) : currentDishes.length === 0 ? (
          <div className="center p-10 text-forest font-sans text-lg">
            Nessun piatto disponibile in questa categoria al momento.
          </div>
        ) : (
          <div className="dishes-grid mb-xl">
            {currentDishes.map((dish, i) => (
              <div 
                key={dish.id || i} 
                className="dish-card-box"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '28px',
                  boxShadow: 'var(--shadow-soft)',
                  border: '1px solid var(--c-line)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: dish.soldOut ? 0.6 : 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Dettagli Piatto */}
                <div>
                  <div className="flex-between items-start gap-3 mb-3">
                    <h3 className="title-md m-0" style={{ fontSize: '1.35rem', lineHeight: 1.25 }}>
                      {dish.name}
                    </h3>
                    {dish.price && (
                      <span className="font-sans fw-600 text-terra text-lg flex-shrink-0" style={{ whiteSpace: 'nowrap' }}>
                        € {Number(dish.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {(dish.desc || dish.description) && (
                    <p className="text-muted font-sans text-sm m-0" style={{ lineHeight: 1.6 }}>
                      {dish.desc || dish.description}
                    </p>
                  )}
                </div>

                {/* Badge Sold Out */}
                {dish.soldOut && (
                  <div style={{ marginTop: '20px' }}>
                    <span className="sold-out-text">
                      ESAURITO
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* NOTE E PRENOTAZIONE */}
        <div className="center pt-5 border-t">
          <p className="text-muted font-sans text-sm italic mb-5">
            Coperto e pane €{Number(prezzoCoperto).toFixed(2)}.<br/>
            In caso di allergie o intolleranze alimentari, vi invitiamo a informare il nostro personale.
          </p>
          
          <Link to="/prenota" className="btn btn-primary btn-xl">
            Prenota un tavolo
          </Link>
        </div>

      </div>
    </main>
  );
}
