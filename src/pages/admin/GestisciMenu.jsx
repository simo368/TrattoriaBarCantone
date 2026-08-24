import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMenu } from '../../hooks/useMenu';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function GestisciMenu() {
  const { menu, loading, addDish, updateDish, deleteDish, CATEGORIES } = useMenu();
  const [activeCat, setActiveCat] = useState('primi');
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', desc: '', price: '', category: '' });

  const categories = CATEGORIES || ['antipasti', 'primi', 'secondi', 'dolci', 'vini'];

  const currentDishes = Array.isArray(menu) 
    ? menu.filter(m => m.category === activeCat)
    : (menu[activeCat] || []);

  const handleEdit = (dish) => {
    setIsEditing(dish.id);
    setEditForm({ ...dish });
  };

  const handleNew = () => {
    setIsEditing('new');
    setEditForm({ name: '', desc: '', price: '', category: activeCat });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing === 'new') {
        await addDish(editForm.category, editForm);
        toast.success('Piatto aggiunto a Firestore');
      } else {
        await updateDish(isEditing, editForm);
        toast.success('Piatto aggiornato su Firestore');
      }
      setIsEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Errore salvataggio menù");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sicuro di voler eliminare questo piatto dal database Cloud?')) {
      try {
        await deleteDish(id);
        toast.success('Piatto eliminato');
      } catch (err) {
        toast.error("Errore durante l'eliminazione");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{margin: 0}}>Gestione Menù (Cloud)</h1>
        <button className="btn btn-primary" onClick={handleNew}>
          <Plus size={18} /> Aggiungi Piatto
        </button>
      </div>

      <div className="toolbar" style={{ background: '#fff', padding: '12px 16px', borderRadius: 'var(--r)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <span className="text-muted" style={{ fontWeight: 'bold', fontSize: '0.85rem', marginRight: '8px' }}>Categorie:</span>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${activeCat === cat ? 'active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrizione</th>
              <th>Prezzo</th>
              <th style={{textAlign: 'right'}}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="center text-muted py-4">Caricamento piatti da Firestore...</td></tr>
            ) : currentDishes.length === 0 ? (
              <tr><td colSpan="4" className="center text-muted py-4">Nessun piatto presente in questa categoria.</td></tr>
            ) : (
              currentDishes.map((dish, i) => (
                <tr key={dish.id || i}>
                  <td><strong style={{ fontSize: '1.05rem' }}>{dish.name}</strong></td>
                  <td><div style={{ maxWidth: '400px', lineHeight: 1.5 }}>{dish.desc}</div></td>
                  <td><strong>{dish.price ? `${dish.price} €` : '-'}</strong></td>
                  <td style={{textAlign: 'right'}}>
                    {dish.id && (
                      <>
                        <button className="btn btn-outline btn-sm" style={{marginRight: 8}} onClick={() => handleEdit(dish)}>
                          <Edit2 size={14} /> Modifica
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dish.id)} title="Elimina piatto">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{isEditing === 'new' ? 'Nuovo Piatto' : 'Modifica Piatto'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group mb-4">
                <label className="form-label">Nome *</label>
                <input className="form-input" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Categoria *</label>
                <select className="form-select" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Descrizione / Ingredienti</label>
                <textarea className="form-textarea" value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})}></textarea>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Prezzo (€)</label>
                <input type="number" step="0.5" className="form-input" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(null)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Salva in Cloud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
