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
    <main className="menu-page" style={{ 
      backgroundColor: 'var(--c-crema)', 
      minHeight: '100vh',
      color: 'var(--c-forest)'
    }}>
      <style>{`
        .editorial-layout {
          display: flex;
          flex-direction: column;
          gap: 60px;
          padding: 60px 0 120px;
        }
        .editorial-col-left {
          width: 100%;
        }
        .editorial-col-right {
          width: 100%;
        }
        
        @media (min-width: 1024px) {
          .editorial-layout {
            flex-direction: row;
            gap: 100px;
            padding: 100px 0 160px;
            align-items: flex-start;
          }
          .editorial-col-left {
            width: 40%;
            position: sticky;
            top: 100px;
          }
          .editorial-col-right {
            width: 60%;
          }
        }
        
        .cats-nav::-webkit-scrollbar { 
          display: none; 
        }
      `}</style>

      <div className="container" style={{ padding: '0 24px', maxWidth: '1280px', margin: '0 auto' }}>
        
        <div className="editorial-layout">
          
          {/* COLONNA SINISTRA: INTRODUZIONE E FOTOGRAFIA (Sticky su Desktop) */}
          <div className="editorial-col-left">
            <h1 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: 'clamp(3rem, 6vw, 4.5rem)', 
              color: 'var(--c-forest)', 
              lineHeight: 1.05, 
              marginBottom: '32px',
              marginTop: 0,
              fontWeight: 400,
              letterSpacing: '-0.02em'
            }}>
              Il nostro menù
            </h1>
            <p style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '1.25rem', 
              color: 'var(--c-forest)', 
              opacity: 0.85,
              lineHeight: 1.6, 
              marginBottom: '56px',
              maxWidth: '90%'
            }}>
              Un atto d'amore per il nostro territorio. Sfoglia ruvida tirata a mano, cotture lente e il calore della tradizione emiliana, per farti ritrovare il vero sapore di casa.
            </p>
            
            <div style={{ 
              width: '100%', 
              aspectRatio: '3/4', 
              overflow: 'hidden', 
              backgroundColor: 'var(--c-crema-dark)'
            }}>
              <img 
                src="/img/gallery-tortelli.jpg" 
                alt="Dettaglio dei nostri tortelli" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* COLONNA DESTRA: CATEGORIE, MENU FISSO, PIATTI */}
          <div className="editorial-col-right">
            
            {/* NAVIGAZIONE CATEGORIE */}
            <div className="cats-nav" style={{ 
              display: 'flex', 
              gap: '32px', 
              overflowX: 'auto', 
              paddingBottom: '8px',
              marginBottom: '64px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {categories.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveTab(cat)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.15rem',
                    fontWeight: activeTab === cat ? 500 : 400,
                    color: 'var(--c-forest)',
                    opacity: activeTab === cat ? 1 : 0.5,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0 0 8px 0',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {cat}
                  {activeTab === cat && (
                    <span style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: '0', 
                      width: '100%', 
                      height: '2px', 
                      backgroundColor: 'var(--c-terra)' 
                    }} />
                  )}
                </button>
              ))}
            </div>

            {/* MENU FISSO (Sezione Editoriale) */}
            <div style={{ 
              backgroundColor: 'rgba(244, 241, 236, 0.6)', /* crema-dark molto leggero */
              padding: '40px 32px', 
              marginBottom: '72px',
              borderTop: '2px solid var(--c-terra)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', gap: '16px' }}>
                <h3 style={{ 
                  fontFamily: 'var(--font-serif)', 
                  fontSize: '2rem', 
                  color: 'var(--c-forest)', 
                  margin: 0,
                  fontWeight: 400
                }}>
                  Menù Feriale
                </h3>
                <span style={{ 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: '1.25rem', 
                  color: 'var(--c-terra)', 
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}>
                  € 15
                </span>
              </div>
              <p style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '1.1rem', 
                color: 'var(--c-forest)', 
                opacity: 0.8,
                margin: 0,
                lineHeight: 1.6
              }}>
                Disponibile a pranzo dal lunedì al venerdì. Include primo, secondo con contorno, acqua, quarto di vino e caffè.
              </p>
            </div>

            {/* LISTA PIATTI (Composizione Editoriale) */}
            {loading ? (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--c-forest)', opacity: 0.6, textAlign: 'center', padding: '40px 0' }}>
                Lettura della carta in corso...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
                {currentDishes.length === 0 ? (
                  <div style={{ fontStyle: 'italic', color: 'var(--c-forest)', opacity: 0.6 }}>
                    Nessun piatto disponibile in questa selezione al momento.
                  </div>
                ) : (
                  currentDishes.map((dish, i) => (
                    <div key={dish.id || i} style={{ 
                      opacity: dish.soldOut ? 0.6 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'baseline',
                        gap: '24px'
                      }}>
                        <h4 style={{ 
                          fontFamily: 'var(--font-serif)', 
                          fontSize: '1.6rem', 
                          fontWeight: 400,
                          color: 'var(--c-forest)', 
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap',
                          lineHeight: 1.2
                        }}>
                          {dish.name}
                          {dish.soldOut && (
                            <span style={{ 
                              fontFamily: 'var(--font-sans)',
                              fontSize: '0.8rem', 
                              fontWeight: 600, 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.08em', 
                              color: 'var(--c-terra)'
                            }}>
                              Esaurito
                            </span>
                          )}
                        </h4>
                        
                        {dish.price && (
                          <span style={{ 
                            fontFamily: 'var(--font-sans)', 
                            fontSize: '1.3rem', 
                            color: 'var(--c-forest)', 
                            opacity: 0.9,
                            fontWeight: 400,
                            whiteSpace: 'nowrap'
                          }}>
                            € {Number(dish.price).toFixed(0)}
                          </span>
                        )}
                      </div>
                      
                      {(dish.desc || dish.description) && (
                        <p style={{ 
                          fontFamily: 'var(--font-sans)',
                          fontSize: '1.1rem', 
                          color: 'var(--c-forest)', 
                          opacity: 0.7,
                          margin: 0, 
                          lineHeight: 1.6,
                          maxWidth: '90%'
                        }}>
                          {dish.desc || dish.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            
            <div style={{ marginTop: '100px', paddingTop: '40px', borderTop: '1px solid rgba(26,36,33,0.1)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--c-forest)', opacity: 0.7, fontStyle: 'italic', lineHeight: 1.6 }}>
                Coperto e pane € 2.00.<br/>
                In caso di allergie o intolleranze alimentari, vi invitiamo a informare il nostro personale.
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* CTA PRENOTAZIONE (Pulita e Minimal) */}
      <section style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '1.1rem', 
            color: 'var(--c-forest)', 
            opacity: 0.7,
            marginBottom: '24px'
          }}>
            Vieni a provare la vera tradizione emiliana.
          </p>
          <Link to="/prenota" className="btn" style={{ 
            display: 'inline-block',
            backgroundColor: 'transparent',
            color: 'var(--c-forest)',
            border: '1px solid var(--c-forest)',
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '1.1rem',
            fontWeight: 500,
            padding: '16px 48px',
            transition: 'all 0.3s ease'
          }}>
            Prenota un tavolo
          </Link>
        </div>
      </section>
    </main>
  );
}
