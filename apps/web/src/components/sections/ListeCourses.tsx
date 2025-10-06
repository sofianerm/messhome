import { useState } from "react";
import { ShoppingCart, Plus, Check, X } from "lucide-react";
import { useShoppingItems } from "@/hooks/useShoppingItems";

export default function ListeCourses() {
  const { items, loading, error, addItem, toggleItem, deleteItem, deleteChecked } = useShoppingItems();
  const [newItem, setNewItem] = useState("");

  const suggestions = [
    "Lait", "Pain", "Œufs", "Beurre", "Yaourts", "Fromage",
    "Pommes", "Bananes", "Tomates", "Carottes", "Salade",
    "Riz", "Pâtes", "Huile", "Sucre", "Farine",
    "Poulet", "Poisson", "Jambon", "Saucisses",
    "Shampoing", "Dentifrice", "Lessive", "Papier toilette"
  ];

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      try {
        await addItem(newItem.trim());
        setNewItem("");
      } catch (err) {
        console.error('Failed to add item:', err);
      }
    }
  };

  const handleAddSuggestion = async (suggestion: string) => {
    if (!items.some(item => item.name.toLowerCase() === suggestion.toLowerCase())) {
      try {
        await addItem(suggestion);
      } catch (err) {
        console.error('Failed to add suggestion:', err);
      }
    }
  };

  const handleToggleItem = async (id: string, checked: boolean) => {
    try {
      await toggleItem(id, !checked);
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleCheckAll = async () => {
    try {
      await Promise.all(
        items.filter(item => !item.checked).map(item => toggleItem(item.id, true))
      );
    } catch (err) {
      console.error('Failed to check all:', err);
    }
  };

  const handleUncheckAll = async () => {
    try {
      await Promise.all(
        items.filter(item => item.checked).map(item => toggleItem(item.id, false))
      );
    } catch (err) {
      console.error('Failed to uncheck all:', err);
    }
  };

  const handleDeleteChecked = async () => {
    try {
      await deleteChecked();
    } catch (err) {
      console.error('Failed to delete checked items:', err);
    }
  };

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;

  const availableSuggestions = suggestions.filter(
    suggestion => !items.some(item => item.name.toLowerCase() === suggestion.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShoppingCart size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Liste de courses</h2>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF] mx-auto mb-4"></div>
          <p className="text-[14px] text-[#7A7A7A]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShoppingCart size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Liste de courses</h2>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <p className="text-[13px] text-red-600">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={24} className="text-[#2563FF]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-semibold">Liste de courses</h2>
              <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                🔥 LIVE
              </span>
            </div>
            <p className="text-[13px] text-[#7A7A7A]">
              {checkedCount} sur {totalCount} articles cochés
            </p>
          </div>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-[#E5E5E5] flex items-center justify-center relative">
          <span className="text-[14px] font-semibold text-[#2563FF]">
            {totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <form onSubmit={handleAddItem} className="flex gap-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Ajouter un article..."
            className="flex-1 h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </form>
      </div>

      {/* Suggestions */}
      {availableSuggestions.length > 0 && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <h3 className="text-[14px] font-semibold mb-3">Suggestions rapides</h3>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 12).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleAddSuggestion(suggestion)}
                className="px-3 py-1 text-[12px] bg-gray-100 text-[#7A7A7A] rounded-full hover:bg-[#2563FF] hover:text-white transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart size={48} className="text-[#C3C3C3] mx-auto mb-4" />
            <p className="text-[#9B9B9B]">Votre liste de courses est vide</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => handleToggleItem(item.id, item.checked)}
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                    item.checked
                      ? "bg-[#2563FF] border-[#2563FF] text-white"
                      : "border-[#E5E5E5] hover:border-[#2563FF]"
                  }`}
                >
                  {item.checked && <Check size={12} />}
                </button>
                <span
                  className={`flex-1 text-[14px] ${
                    item.checked ? "line-through text-[#9B9B9B]" : "text-[#2B2B2B]"
                  }`}
                >
                  {item.name}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#FF6A6A] hover:bg-red-50 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {totalCount > 0 && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleCheckAll}
            className="px-4 py-2 text-[#2563FF] text-[13px] font-medium border border-[#2563FF] rounded-lg hover:bg-blue-50"
          >
            Tout cocher
          </button>
          <button
            onClick={handleUncheckAll}
            className="px-4 py-2 text-[#7A7A7A] text-[13px] font-medium border border-[#E5E5E5] rounded-lg hover:bg-gray-50"
          >
            Tout décocher
          </button>
          <button
            onClick={handleDeleteChecked}
            className="px-4 py-2 text-[#FF6A6A] text-[13px] font-medium border border-[#FF6A6A] rounded-lg hover:bg-red-50"
          >
            Supprimer cochés
          </button>
        </div>
      )}
    </div>
  );
}
