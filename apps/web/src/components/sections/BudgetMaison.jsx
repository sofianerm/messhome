import { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function BudgetMaison() {
  const [revenus, setRevenus] = useState([
    { id: 1, name: 'Salaire Papa', amount: 3200, type: 'revenu' },
    { id: 2, name: 'Salaire Maman', amount: 2800, type: 'revenu' },
    { id: 3, name: 'Allocations', amount: 250, type: 'revenu' }
  ]);

  const [depenses, setDepenses] = useState([
    { id: 1, name: 'Loyer', amount: 1200, type: 'depense', category: 'Logement' },
    { id: 2, name: 'Électricité/Gaz', amount: 150, type: 'depense', category: 'Logement' },
    { id: 3, name: 'Courses alimentaires', amount: 600, type: 'depense', category: 'Alimentation' },
    { id: 4, name: 'Assurance auto', amount: 80, type: 'depense', category: 'Transport' },
    { id: 5, name: 'Essence', amount: 200, type: 'depense', category: 'Transport' },
    { id: 6, name: 'Internet/Téléphone', amount: 60, type: 'depense', category: 'Communication' }
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    type: 'depense',
    category: 'Logement'
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const categories = ['Logement', 'Alimentation', 'Transport', 'Communication', 'Santé', 'Loisirs', 'Autres'];

  const totalRevenus = revenus.reduce((sum, item) => sum + item.amount, 0);
  const totalDepenses = depenses.reduce((sum, item) => sum + item.amount, 0);
  const resteDispo = totalRevenus - totalDepenses;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.amount) {
      const item = {
        id: Date.now(),
        name: newItem.name,
        amount: parseFloat(newItem.amount),
        type: newItem.type,
        category: newItem.type === 'depense' ? newItem.category : undefined
      };

      if (newItem.type === 'revenu') {
        setRevenus([...revenus, item]);
      } else {
        setDepenses([...depenses, item]);
      }

      setNewItem({ name: '', amount: '', type: 'depense', category: 'Logement' });
      setShowAddForm(false);
    }
  };

  const handleDeleteItem = (id, type) => {
    if (type === 'revenu') {
      setRevenus(revenus.filter(item => item.id !== id));
    } else {
      setDepenses(depenses.filter(item => item.id !== id));
    }
  };

  const groupedDepenses = categories.map(category => ({
    category,
    items: depenses.filter(item => item.category === category),
    total: depenses.filter(item => item.category === category).reduce((sum, item) => sum + item.amount, 0)
  })).filter(group => group.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Budget Maison</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-[#10B981]" />
            <span className="text-[14px] font-medium text-[#5C5C5C]">Revenus</span>
          </div>
          <div className="text-[24px] font-bold text-[#10B981]">
            {totalRevenus.toLocaleString('fr-FR')} €
          </div>
        </div>

        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown size={20} className="text-[#FF6A6A]" />
            <span className="text-[14px] font-medium text-[#5C5C5C]">Dépenses</span>
          </div>
          <div className="text-[24px] font-bold text-[#FF6A6A]">
            {totalDepenses.toLocaleString('fr-FR')} €
          </div>
        </div>

        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={20} className={resteDispo >= 0 ? 'text-[#2563FF]' : 'text-[#FF6A6A]'} />
            <span className="text-[14px] font-medium text-[#5C5C5C]">Reste disponible</span>
          </div>
          <div className={`text-[24px] font-bold ${resteDispo >= 0 ? 'text-[#2563FF]' : 'text-[#FF6A6A]'}`}>
            {resteDispo.toLocaleString('fr-FR')} €
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <h3 className="text-[16px] font-semibold mb-4">Ajouter un élément</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Type *
                </label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                >
                  <option value="revenu">Revenu</option>
                  <option value="depense">Dépense</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: Salaire, Loyer..."
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Montant *
                </label>
                <input
                  type="number"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {newItem.type === 'depense' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                    Catégorie
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg hover:bg-blue-600"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 text-[#7A7A7A] text-[13px] font-medium hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Revenus */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={20} className="text-[#10B981]" />
          <h3 className="text-[16px] font-semibold">Revenus mensuels</h3>
        </div>
        <div className="space-y-3">
          {revenus.map(item => (
            <div key={item.id} className="flex items-center justify-between group">
              <span className="text-[14px] text-[#2B2B2B]">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-semibold text-[#10B981]">
                  +{item.amount.toLocaleString('fr-FR')} €
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id, 'revenu')}
                  className="opacity-0 group-hover:opacity-100 text-[#FF6A6A] hover:bg-red-50 p-1 rounded"
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dépenses par catégorie */}
      <div className="space-y-4">
        <h3 className="text-[16px] font-semibold flex items-center gap-2">
          <TrendingDown size={20} className="text-[#FF6A6A]" />
          Dépenses mensuelles
        </h3>
        
        {groupedDepenses.map(group => (
          <div key={group.category} className="bg-white border border-[#F1F1F1] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[15px] font-semibold">{group.category}</h4>
              <span className="text-[14px] font-semibold text-[#FF6A6A]">
                -{group.total.toLocaleString('fr-FR')} €
              </span>
            </div>
            
            <div className="space-y-3">
              {group.items.map(item => (
                <div key={item.id} className="flex items-center justify-between group">
                  <span className="text-[13px] text-[#7A7A7A]">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-[#2B2B2B]">
                      {item.amount.toLocaleString('fr-FR')} €
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id, 'depense')}
                      className="opacity-0 group-hover:opacity-100 text-[#FF6A6A] hover:bg-red-50 p-1 rounded"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}