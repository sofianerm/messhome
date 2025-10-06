import React, { useState } from 'react';
import { useMeals } from '../../hooks/useMeals';
import { useFavoriteMeals } from '../../hooks/useFavoriteMeals';
import { format, addDays, startOfWeek, isToday as isTodayFn } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UtensilsCrossed } from 'lucide-react';

type MealType = 'lunch' | 'dinner';

export default function RepasMenus() {
  const { meals, loading, error, addMeal, deleteMeal } = useMeals();
  const { favorites, loading: favLoading, addFavorite, deleteFavorite } = useFavoriteMeals();

  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: MealType } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newFavoriteName, setNewFavoriteName] = useState('');
  const [newFavoriteCategory, setNewFavoriteCategory] = useState('');
  const [customMealName, setCustomMealName] = useState('');

  // Générer 14 jours à partir de lundi de cette semaine
  const generateDays = () => {
    const start = startOfWeek(new Date(), { locale: fr, weekStartsOn: 1 });
    return Array.from({ length: 14 }, (_, i) => addDays(start, i));
  };

  const days = generateDays();

  const getMealForSlot = (date: Date, mealType: MealType) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return meals.find(m => m.date === dateStr && m.meal_type === mealType);
  };

  const handleSlotClick = (date: Date, mealType: MealType) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = getMealForSlot(date, mealType);

    if (existing) {
      // Cliquer sur un slot rempli = supprimer
      deleteMeal(existing.id);
    } else {
      // Cliquer sur un slot vide = sélectionner pour ajouter
      setSelectedSlot({ date: dateStr, mealType });
    }
  };

  const handleSelectFavorite = async (favoriteName: string) => {
    if (selectedSlot) {
      await addMeal({
        title: favoriteName,
        date: selectedSlot.date,
        meal_type: selectedSlot.mealType,
      });
      setSelectedSlot(null);
    }
  };

  const handleAddCustomMeal = async () => {
    if (selectedSlot && customMealName.trim()) {
      await addMeal({
        title: customMealName,
        date: selectedSlot.date,
        meal_type: selectedSlot.mealType,
      });
      setCustomMealName('');
      setSelectedSlot(null);
    }
  };

  const handleAddFavorite = async () => {
    if (newFavoriteName.trim()) {
      await addFavorite(newFavoriteName, newFavoriteCategory || undefined);
      setNewFavoriteName('');
      setNewFavoriteCategory('');
    }
  };

  if (loading || favLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={24} className="text-[#2563FF]" />
            <h2 className="text-[20px] font-semibold">Repas & menus</h2>
            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              🔥 LIVE Supabase
            </span>
          </div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={24} className="text-[#2563FF]" />
            <h2 className="text-[20px] font-semibold">Repas & menus</h2>
            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              🔥 LIVE Supabase
            </span>
          </div>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <p className="text-[13px] text-red-600 mb-2">❌ {error}</p>
          <p className="text-[12px] text-[#7A7A7A]">Une erreur est survenue lors du chargement des repas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <UtensilsCrossed size={24} className="text-[#2563FF]" />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-semibold">Repas & menus</h2>
            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              🔥 LIVE Supabase
            </span>
          </div>
          <p className="text-[13px] text-[#7A7A7A]">
            Planifiez vos repas sur 2 semaines
          </p>
        </div>
      </div>

      {/* Panneau de configuration des favoris */}
      {showSettings && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <h3 className="text-[16px] font-semibold mb-4">Gérer les repas favoris</h3>

          {/* Ajouter un favori */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newFavoriteName}
              onChange={(e) => setNewFavoriteName(e.target.value)}
              placeholder="Nom du repas"
              className="flex-1 h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
            />
            <input
              type="text"
              value={newFavoriteCategory}
              onChange={(e) => setNewFavoriteCategory(e.target.value)}
              placeholder="Catégorie (optionnel)"
              className="w-40 h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
            />
            <button
              onClick={handleAddFavorite}
              className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              + Ajouter
            </button>
          </div>

          {/* Liste des favoris */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {favorites.map(fav => (
              <div
                key={fav.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-[#E5E5E5]"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13px] text-[#2B2B2B] truncate">{fav.name}</div>
                  {fav.category && (
                    <div className="text-[11px] text-[#7A7A7A]">{fav.category}</div>
                  )}
                </div>
                <button
                  onClick={() => deleteFavorite(fav.id)}
                  className="ml-2 text-[#FF6A6A] hover:bg-red-50 p-1 rounded text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grille 14 jours - 2 semaines */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">Planning des repas</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1.5 bg-[#2563FF] text-white text-[12px] font-medium rounded-lg flex items-center gap-1.5 hover:bg-blue-600 transition-colors"
          >
            ⚙️ Gérer les favoris
          </button>
        </div>

        <div className="space-y-6">
          {[0, 1].map(weekOffset => (
            <div key={weekOffset}>
              <div className="text-[13px] font-semibold text-[#7A7A7A] mb-3">
                Semaine {weekOffset + 1}
              </div>
              <div className="grid grid-cols-7 gap-2">
              {days.slice(weekOffset * 7, (weekOffset + 1) * 7).map(day => {
                const isToday = isTodayFn(day);
                const dateStr = format(day, 'yyyy-MM-dd');

                return (
                  <div
                    key={dateStr}
                    className={`border rounded-lg overflow-hidden ${
                      isToday ? 'border-[#2563FF] border-2' : 'border-gray-200'
                    }`}
                  >
                    {/* Jour */}
                    <div className={`text-center py-2 text-xs font-semibold ${
                      isToday ? 'bg-[#2563FF] text-white' : 'bg-gray-50 text-gray-700'
                    }`}>
                      <div>{format(day, 'EEE', { locale: fr })}</div>
                      <div className="text-lg">{format(day, 'd')}</div>
                    </div>

                    {/* Déjeuner */}
                    <button
                      onClick={() => handleSlotClick(day, 'lunch')}
                      className={`w-full p-2 text-left text-xs transition-colors ${
                        getMealForSlot(day, 'lunch')
                          ? 'bg-green-50 hover:bg-green-100 border-b border-green-200'
                          : selectedSlot?.date === dateStr && selectedSlot?.mealType === 'lunch'
                          ? 'bg-blue-100 border-b border-blue-300'
                          : 'bg-white hover:bg-gray-50 border-b border-gray-100'
                      }`}
                    >
                      <div className="font-medium text-gray-500 mb-1">🌞 Déj</div>
                      <div className="text-gray-800 font-medium truncate">
                        {getMealForSlot(day, 'lunch')?.title || '−'}
                      </div>
                    </button>

                    {/* Dîner */}
                    <button
                      onClick={() => handleSlotClick(day, 'dinner')}
                      className={`w-full p-2 text-left text-xs transition-colors ${
                        getMealForSlot(day, 'dinner')
                          ? 'bg-orange-50 hover:bg-orange-100'
                          : selectedSlot?.date === dateStr && selectedSlot?.mealType === 'dinner'
                          ? 'bg-blue-100'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-500 mb-1">🌙 Dîn</div>
                      <div className="text-gray-800 font-medium truncate">
                        {getMealForSlot(day, 'dinner')?.title || '−'}
                      </div>
                    </button>
                  </div>
                );
              })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sélecteur de repas */}
      {selectedSlot && (
        <div className="bg-white border-2 border-[#2563FF] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#2B2B2B]">
              Choisir un repas - {format(new Date(selectedSlot.date), 'EEEE d MMMM', { locale: fr })}
              {' '}{selectedSlot.mealType === 'lunch' ? '🌞 Déjeuner' : '🌙 Dîner'}
            </h3>
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-[#7A7A7A] hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <span className="text-[16px]">✕</span>
            </button>
          </div>

          {/* Favoris */}
          <div className="mb-4">
            <div className="text-[13px] font-medium text-[#7A7A7A] mb-3">Repas favoris :</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {favorites.map(fav => (
                <button
                  key={fav.id}
                  onClick={() => handleSelectFavorite(fav.name)}
                  className="px-3 py-2 bg-gray-50 border border-[#E5E5E5] rounded-lg hover:border-[#2563FF] hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="font-medium text-[13px] text-[#2B2B2B]">{fav.name}</div>
                  {fav.category && (
                    <div className="text-[11px] text-[#7A7A7A]">{fav.category}</div>
                  )}
                </button>
              ))}
            </div>
            {favorites.length === 0 && (
              <p className="text-[13px] text-[#9B9B9B] italic">
                Aucun favori. Ajoutez-en via le bouton "⚙️ Gérer les favoris"
              </p>
            )}
          </div>

          {/* Entrée manuelle */}
          <div className="border-t border-[#E5E5E5] pt-4">
            <div className="text-[13px] font-medium text-[#7A7A7A] mb-3">Ou saisir manuellement :</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customMealName}
                onChange={(e) => setCustomMealName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomMeal()}
                placeholder="Nom du repas..."
                className="flex-1 h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
              />
              <button
                onClick={handleAddCustomMeal}
                className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
