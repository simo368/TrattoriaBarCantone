import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { menuStore } from '../../utils/localStore';

const CATEGORIES = ['antipasti', 'primi', 'secondi', 'dolci', 'vini'];

export default function GestisciMenu() {
  const [menu, setMenu] = useState([]);
  const [activeCat, setActiveCat] = useState('primi');
  const [isEditing, setIsEditing] = useState(null); // id of dish being edited or 'new'
  const [editForm, setEditForm] = useState({ name: '', desc: '', price: '', category: '' });

  useEffect(() => {
    setMenu(menuStore.getAll());
  }, []);

  const refreshMenu = () => setMenu(menuStore.getAll());

  const handleEdit = (dish) => {
    setIsEditing(dish.id);
    setEditForm({ ...dish });
  };

  const handleNew = () => {
    setIsEditing('new');
    setEditForm({ name: '', desc: '', price: '', category: activeCat });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditing === 'new') {
      menuStore.add(editForm);
      toast.success('Piatto aggiunto');
    } else {
      menuStore.update(isEditing, editForm);
      toast.success('Piatto aggiornato');
    }
    setIsEditing(null);
    refreshMenu();
  };

  const handleDelete = (id) => {
    if (window.confirm('Sicuro di voler eliminare questo piatto?')) {
      menuStore.delete(id);
      toast.success('Piatto eliminato');
      refreshMenu();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{margin: 0}}>Gestione Menù</h1>
        <button className="btn btn-primary" onClick={handleNew}>+ Aggiungi Piatto</button>
      </div>

      <div className="toolbar">
        {CATEGORIES.map(cat => (
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
            {menu.filter(m => m.category === activeCat).sort((a,b) => a.order - b.order).map(dish => (
              <tr key={dish.id}>
                <td><strong>{dish.name}</strong></td>
                <td>{dish.desc}</td>
                <td>{dish.price ? `${dish.price} €` : '-'}</td>
                <td style={{textAlign: 'right'}}>
                  <button className="btn btn-outline btn-sm" style={{marginRight: 8}} onClick={() => handleEdit(dish)}>Modifica</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dish.id)}>Elimina</button>
                </td>
              </tr>
            ))}
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
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                <button type="submit" className="btn btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
