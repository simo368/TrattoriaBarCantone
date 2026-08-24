import { useState } from 'react';
import { Link } from 'react-router-dom';
import { menuStore } from '../utils/localStore';

export default function MenuPublic() {
  const rawMenu = menuStore.getAll();
  const [activeTab, setActiveTab] = useState('antipasti');
  const categories = ['antipasti', 'primi', 'secondi', 'dolci', 'vini'];

  return (
    <main className="booking-page" style={{ paddingTop: '60px' }}>
      <section id="menu" className="section menu-section" style={{ background: 'transparent' }}>
        <div className="container">
          <div className="eyebrow center">La nostra cucina</div>
          <h2 className="center">Il menù della tradizione</h2>
          <p className="section-lead center">Pochi piatti, scelti con cura. Il meglio della cucina emiliana, in tavola ogni giorno.</p>
          
          <div className="menu-fixed-box">
            <div>
              <span className="menu-fixed-label">Pranzo · giorni feriali</span>
              <span className="menu-fixed-name">Menù fisso completo</span>
            </div>
            <div className="menu-fixed-price">15 €</div>
          </div>

          <div className="menu-tabs">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`menu-tab ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="dishes-grid">
            {rawMenu.filter(m => m.category === activeTab).sort((a,b) => a.order - b.order).map(dish => (
              <article key={dish.id} className="dish-card">
                <h3 className="dish-name">{dish.name}</h3>
                <p className="dish-desc">{dish.desc}</p>
                {dish.price && <div className="dish-price">{dish.price} €</div>}
              </article>
            ))}
          </div>
          
          <p className="menu-note">Il menù può variare in base alla disponibilità degli ingredienti stagionali.</p>
          <div className="center" style={{marginTop: 32}}>
            <Link to="/prenota" className="btn btn-primary">Prenota un tavolo</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
