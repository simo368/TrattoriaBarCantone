import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';

export default function MenuPublic() {
  const { menu, loading, CATEGORIES } = useMenu();
  const [activeTab, setActiveTab] = useState('primi');

  const categories = CATEGORIES || ['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'vini'];

  const currentDishes = Array.isArray(menu) 
    ? menu.filter(m => m.category === activeTab && m.active !== false)
    : (menu[activeTab] || []).filter(m => m.active !== false);

  return (
    <main className="menu-page" style={{ backgroundColor: 'var(--c-crema)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* LAYOUT A DUE COLONNE SU DESKTOP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '60px',
          paddingTop: '60px',
          paddingBottom: '120px',
          alignItems: 'start'
        }}>
          
          {/* COLONNA SINISTRA: INTRODUZIONE E FOTOGRAFIA (Sticky su Desktop) */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <span style={{ 
              display: 'block', 
              fontSize: '0.85rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              color: 'var(--c-terra)', 
              marginBottom: '16px' 
            }}>
              La nostra proposta
            </span>
            <h1 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              color: 'var(--c-forest)', 
              lineHeight: 1.1, 
              marginBottom: '24px',
              marginTop: 0
            }}>
              Il nostro menù
            </h1>
            <p style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '1.1rem', 
              color: 'var(--c-text-muted)', 
              lineHeight: 1.6, 
              marginBottom: '40px',
              maxWidth: '90%'
            }}>
              I piatti della tradizione emiliana, preparati ogni giorno con materie prime del territorio. Ricette tramandate con cura, per farti ritrovare il vero sapore di casa.
            </p>
            
            <div style={{ 
              width: '100%', 
              aspectRatio: '3/4', 
              overflow: 'hidden', 
              borderRadius: '4px',
              backgroundColor: 'var(--c-crema-dark)'
            }}>
              <img 
                src="/img/gallery-tortelli.jpg" 
                alt="I nostri tortelli fatti in casa" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* COLONNA DESTRA: CATEGORIE, MENU FISSO, PIATTI */}
          <div style={{ paddingTop: '16px' }}>
            
            {/* NAVIGAZIONE CATEGORIE */}
            <div style={{ 
              display: 'flex', 
              gap: '24px', 
              overflowX: 'auto', 
              paddingBottom: '24px',
              marginBottom: '40px',
              borderBottom: '1px solid rgba(26,36,33,0.1)',
              scrollbarWidth: 'none', // Nasconde scrollbar su Firefox
              msOverflowStyle: 'none' // Nasconde scrollbar su IE
            }}>
              <style>{`
                /* Nasconde scrollbar su Chrome/Safari/Edge */
                div::-webkit-scrollbar { display: none; }
              `}</style>
              {categories.map((cat, index) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveTab(cat)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.1rem',
                    fontWeight: activeTab === cat ? 600 : 400,
                    color: activeTab === cat ? 'var(--c-forest)' : 'var(--c-forest-light)',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '4px 0',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {cat}
                  {activeTab === cat && (
                    <span style={{ 
                      position: 'absolute', 
                      bottom: '-25px', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      width: '4px', 
                      height: '4px', 
                      borderRadius: '50%',
                      backgroundColor: 'var(--c-terra)' 
                    }} />
                  )}
                </button>
              ))}
            </div>

            {/* MENU FISSO (Sezione speciale, visibile solo nella categoria appropriata o sempre in cima, decidiamo di mostrarlo sempre sopra ai primi/antipasti o come categoria dedicata. Lo lasciamo fisso sopra l'elenco) */}
            <div style={{ 
              backgroundColor: 'var(--c-crema-dark)', 
              padding: '32px', 
              borderRadius: '4px',
              marginBottom: '48px',
              borderLeft: '3px solid var(--c-terra)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
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

            {/* LISTA PIATTI */}
            {loading ? (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', color: 'var(--c-forest-light)' }}>
                Preparazione del menù in corso...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {currentDishes.length === 0 ? (
                  <div style={{ fontStyle: 'italic', color: 'var(--c-text-muted)' }}>
                    Nessun piatto disponibile in questa categoria al momento.
                  </div>
                ) : (
                  currentDishes.map((dish, i) => (
                    <div key={dish.id || i} style={{ 
                      opacity: dish.soldOut ? 0.6 : 1,
                      transition: 'opacity 0.2s ease'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'baseline',
                        gap: '16px',
                        marginBottom: '6px'
                      }}>
                        <h4 style={{ 
                          fontFamily: 'var(--font-sans)', 
                          fontSize: '1.25rem', 
                          fontWeight: 600,
                          color: 'var(--c-forest)', 
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          {dish.name}
                          {dish.soldOut && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 700, 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.05em', 
                              color: 'var(--c-terra)', 
                              border: '1px solid var(--c-terra)',
                              padding: '2px 6px', 
                              borderRadius: '2px' 
                            }}>
                              Esaurito
                            </span>
                          )}
                        </h4>
                        
                        {/* Puntinatura o spaziatore */}
                        <div style={{
                          flexGrow: 1,
                          borderBottom: '1px dotted rgba(26,36,33,0.2)',
                          position: 'relative',
                          top: '-6px'
                        }} />

                        {dish.price && (
                          <span style={{ 
                            fontFamily: 'var(--font-sans)', 
                            fontSize: '1.25rem', 
                            color: 'var(--c-forest)', 
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}>
                            € {Number(dish.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Descrizione (gestisce sia desc che description per retrocompatibilità) */}
                      {(dish.desc || dish.description) && (
                        <p style={{ 
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.95rem', 
                          color: 'var(--c-text-muted)', 
                          margin: 0, 
                          lineHeight: '1.6',
                          maxWidth: '85%'
                        }}>
                          {dish.desc || dish.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            
            <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid rgba(26,36,33,0.1)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
                Coperto e pane €2.00. In caso di allergie o intolleranze alimentari, vi invitiamo a informare il nostro personale.
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* CTA PRENOTAZIONE */}
      <section style={{ backgroundColor: 'var(--c-crema-dark)', padding: '100px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            color: 'var(--c-forest)', 
            marginBottom: '32px',
            marginTop: 0
          }}>
            Vieni a trovarci
          </h2>
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
      </section>
    </main>
  );
}
