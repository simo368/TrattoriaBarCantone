import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';

export default function MenuPublic() {
  const { menu, loading, CATEGORIES } = useMenu();
  const [activeTab, setActiveTab] = useState('primi');

  const categories = CATEGORIES || ['antipasti', 'primi', 'secondi', 'dolci', 'vini'];

  const currentDishes = Array.isArray(menu) 
    ? menu.filter(m => m.category === activeTab && m.active !== false)
    : (menu[activeTab] || []).filter(m => m.active !== false);

  return (
    <main className="menu-page" style={{ paddingBottom: 0 }}>
      {/* HEADER VISIVO */}
      <section className="section" style={{ padding: '120px 0 60px', backgroundColor: 'var(--c-crema)' }}>
        <div className="container center">
          <h1 style={{ fontSize: 'clamp(2.5rem, 10vw, 5.5rem)', lineHeight: 1, marginBottom: '24px' }}>
            La Carta.
          </h1>
          <p className="section-lead" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            I piatti della tradizione emiliana, scelti e preparati con cura ogni giorno.
          </p>
        </div>
      </section>

      {/* MENU FISSO (Evidenza) */}
      <section className="section" style={{ padding: '0 0 60px' }}>
        <div className="container">
          <div style={{ backgroundColor: 'var(--c-forest)', color: '#fff', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <span className="eyebrow" style={{ color: 'var(--c-gold)', marginBottom: '16px' }}>Pranzo Feriale</span>
            <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '8px' }}>Menù Fisso Completo</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '24px' }}>Primo, secondo, contorno, acqua, vino e caffè.</p>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--c-crema)', lineHeight: 1 }}>15€</div>
          </div>
        </div>
      </section>

      {/* MENU DINAMICO */}
      <section className="section" style={{ backgroundColor: 'var(--c-crema-dark)', minHeight: '60vh', padding: '80px 0' }}>
        <div className="container">
          
          {/* TABS ELEGANTI */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '80px', borderBottom: '1px solid rgba(26,36,33,0.1)', paddingBottom: '24px' }}>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveTab(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.2rem',
                  fontWeight: activeTab === cat ? 600 : 400,
                  color: activeTab === cat ? 'var(--c-terra)' : 'var(--c-forest-light)',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '8px 16px',
                  minHeight: '44px',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat}
                {activeTab === cat && (
                  <span style={{ position: 'absolute', bottom: '-25px', left: 0, width: '100%', height: '2px', backgroundColor: 'var(--c-terra)' }} />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="center py-4" style={{ fontSize: '1.2rem', color: 'var(--c-forest-light)' }}>
              Apertura del menù in corso...
            </div>
          ) : (
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {currentDishes.length === 0 ? (
                <div className="center text-muted">Nessun piatto disponibile in questa categoria al momento.</div>
              ) : (
                currentDishes.map((dish, i) => (
                  <div key={dish.id || i} style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'space-between', 
                    alignItems: 'baseline', 
                    gap: '12px',
                    borderBottom: '1px solid rgba(26,36,33,0.05)', 
                    paddingBottom: '24px',
                    opacity: dish.soldOut ? 0.5 : 1
                  }}>
                    <div style={{ paddingRight: '20px', flex: '1 1 200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--c-forest)', margin: 0 }}>
                          {dish.name}
                        </h3>
                        {dish.soldOut && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-terra)', backgroundColor: 'rgba(166, 75, 42, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                            Esaurito
                          </span>
                        )}
                      </div>
                      {/* Supportiamo sia desc che description per retrocompatibilità */}
                      {(dish.desc || dish.description) && (
                        <p style={{ fontSize: '1.05rem', color: 'var(--c-text-muted)', marginTop: '8px', lineHeight: '1.6' }}>
                          {dish.desc || dish.description}
                        </p>
                      )}
                    </div>
                    {dish.price && (
                      <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-sans)', color: 'var(--c-terra)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        € {Number(dish.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <div className="center" style={{ marginTop: '80px' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--c-text-muted)', fontSize: '0.95rem' }}>
              Il menù può subire variazioni in base alla reperibilità e freschezza degli ingredienti stagionali.
            </p>
          </div>
        </div>
      </section>

      {/* CTA PRENOTAZIONE FINALE COERENTE CON LA HOME */}
      <section className="section" style={{ backgroundColor: 'var(--c-terra)', color: '#fff', textAlign: 'center', padding: '160px 0' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1, marginBottom: '48px' }}>
            Hai scelto <br/><em>cosa mangiare?</em>
          </h2>
          <Link to="/prenota" className="btn btn-ghost" style={{ fontSize: '1.2rem', padding: '20px 48px', borderWidth: '2px' }}>
            Prenota un tavolo
          </Link>
        </div>
      </section>
    </main>
  );
}
