import { useState, memo } from 'react';
import { Plane, Plus, Calendar, Check, X, ChevronDown, ChevronUp, Tag, SquareX, GripVertical } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { usePackingItems } from '@/hooks/usePackingItems';
import { useCategoryOrder } from '@/hooks/useCategoryOrder';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Composant pour une catégorie draggable
function SortableCategory({ category, items, isExpanded, onToggle, onAddItem, isAddingItem, newItemText, onNewItemChange, selectedCategory, onSelectCategory, onToggleItem, onDeleteItem }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryChecked = items.filter((i: any) => i.checked).length;
  const categoryTotal = items.length;

  return (
    <div ref={setNodeRef} style={style} className="border border-[#F1F1F1] rounded-lg overflow-hidden">
      {/* En-tête catégorie */}
      <div className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#9B9B9B] hover:text-[#2563FF]">
            <GripVertical size={18} />
          </button>
          <button onClick={onToggle} className="flex items-center gap-3 flex-1">
            <span className="text-[15px] font-semibold text-[#2B2B2B]">{category}</span>
            <span className="text-[11px] text-[#7A7A7A] bg-white px-2 py-0.5 rounded-full">
              {categoryChecked}/{categoryTotal}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectCategory(isAddingItem ? '' : category)}
            className="p-1.5 text-[#2563FF] hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Formulaire ajout item dans catégorie */}
      {isAddingItem && (
        <div className="p-3 bg-blue-50 border-t border-blue-100">
          <form onSubmit={onAddItem} className="flex gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={onNewItemChange}
              className="flex-1 h-9 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
              placeholder={`Ajouter dans ${category}...`}
              autoFocus
            />
            <button type="submit" className="h-9 px-3 bg-[#2563FF] text-white rounded-lg hover:bg-blue-600">
              <Plus size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Items de la catégorie */}
      {isExpanded && (
        <CategoryItems
          items={items}
          onToggle={onToggleItem}
          onDelete={onDeleteItem}
        />
      )}
    </div>
  );
}

// Composant pour afficher les items d'une catégorie
function CategoryItems({ items, onToggle, onDelete }: any) {
  return (
    <div className="p-4 space-y-2">
      {items.length === 0 ? (
        <p className="text-[#9B9B9B] text-[13px] text-center py-2">Aucun élément</p>
      ) : (
        items.map((item: any) => (
          <CategoryItem
            key={item.id}
            item={item}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

// Composant pour un item individuel
function CategoryItem({ item, onToggle, onDelete }: any) {
  const handleToggle = async () => {
    try {
      await onToggle(item.id, !item.checked);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(item.id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="flex items-center gap-3 group">
      <button
        onClick={handleToggle}
        className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 ${
          item.checked
            ? 'bg-[#2563FF] border-[#2563FF] text-white'
            : 'border-[#E5E5E5] hover:border-[#2563FF]'
        }`}
      >
        {item.checked && <Check size={12} />}
      </button>
      <span className={`flex-1 text-[13px] ${
        item.checked ? 'line-through text-[#9B9B9B]' : 'text-[#2B2B2B]'
      }`}>
        {item.item}
      </span>
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 text-[#FF6A6A] hover:bg-red-50 p-1 rounded transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function Voyages() {
  const { trips, loading: tripsLoading, addTrip, deleteTrip } = useTrips();
  const { packingItems, loading: itemsLoading, addPackingItem, togglePackingItem, deletePackingItem, refetch } = usePackingItems();
  const { reorderCategories } = useCategoryOrder();

  const [showAddTripForm, setShowAddTripForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    type: 'voyage' as 'voyage' | 'weekend'
  });

  const [newCategory, setNewCategory] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const types = [
    { value: 'voyage', label: 'Voyage', color: 'bg-[#2563FF]' },
    { value: 'weekend', label: 'Week-end', color: 'bg-[#10B981]' }
  ];

  const statuses = [
    { value: 'idea', label: 'Idée', color: 'bg-[#9B9B9B]' },
    { value: 'planned', label: 'Planifié', color: 'bg-[#F59E0B]' },
    { value: 'booked', label: 'Réservé', color: 'bg-[#2563FF]' },
    { value: 'done', label: 'Terminé', color: 'bg-[#10B981]' }
  ];

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrip.destination && newTrip.start_date) {
      try {
        await addTrip({
          destination: newTrip.destination,
          start_date: newTrip.start_date,
          end_date: newTrip.end_date || null,
          type: newTrip.type,
          status: 'planned'
        });
        setNewTrip({ destination: '', start_date: '', end_date: '', type: 'voyage' });
        setShowAddTripForm(false);
      } catch (error) {
        console.error('Error adding trip:', error);
      }
    }
  };

  const handleDeleteTrip = async (id: string) => {
    try {
      await deleteTrip(id);
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      try {
        // Trouver le prochain category_order (max + 1)
        const maxOrder = Math.max(...sortedCategories.map(c => c.order), -1);
        const newOrder = maxOrder + 1;

        // Créer un item "placeholder" pour initialiser la catégorie
        await addPackingItem({
          item: `_placeholder_${newCategory.trim()}`,
          category: newCategory.trim(),
          category_order: newOrder,
          checked: false
        });

        setNewCategory('');
        setShowAddCategoryForm(false);
        setExpandedCategories(prev => new Set([...prev, newCategory.trim()]));
        setSelectedCategory(newCategory.trim());
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };

  const handleAddItemToCategory = async (category: string) => {
    if (newItemText.trim() && selectedCategory === category) {
      try {
        // Trouver le category_order de cette catégorie
        const categoryData = sortedCategories.find(c => c.category === category);
        const categoryOrder = categoryData?.order || 0;

        await addPackingItem({
          item: newItemText.trim(),
          category: category,
          category_order: categoryOrder,
          checked: false
        });
        setNewItemText('');
        setSelectedCategory('');
      } catch (error) {
        console.error('Error adding item:', error);
      }
    }
  };

  const handleToggleChecklistItem = async (id: string, currentChecked: boolean) => {
    try {
      await togglePackingItem(id, !currentChecked);
    } catch (error) {
      console.error('Error toggling packing item:', error);
    }
  };

  const handleDeleteChecklistItem = async (id: string) => {
    try {
      await deletePackingItem(id);
    } catch (error) {
      console.error('Error deleting packing item:', error);
    }
  };

  const handleUncheckAll = async () => {
    try {
      const checkedItems = packingItems.filter(item => item.checked);
      await Promise.all(
        checkedItems.map(item => togglePackingItem(item.id, false))
      );
    } catch (error) {
      console.error('Error unchecking all items:', error);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Extraire les catégories et grouper les items, puis trier par category_order
  const categories = new Map<string, typeof packingItems>();

  packingItems.forEach(item => {
    if (item.category) {
      if (!categories.has(item.category)) {
        categories.set(item.category, []);
      }
      categories.get(item.category)!.push(item);
    }
  });

  // Créer un array de catégories triées par order
  const sortedCategories = Array.from(categories.entries())
    .map(([category, items]) => ({
      category,
      items,
      order: items[0]?.category_order || 0
    }))
    .sort((a, b) => a.order - b.order);

  const categoryNames = sortedCategories.map(c => c.category);

  // Handler pour le drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categoryNames.indexOf(active.id as string);
      const newIndex = categoryNames.indexOf(over.id as string);

      const newOrder = arrayMove(categoryNames, oldIndex, newIndex);

      try {
        await reorderCategories(newOrder);
        // Les mises à jour en temps réel vont automatiquement mettre à jour l'UI
      } catch (error) {
        console.error('Error reordering categories:', error);
      }
    }
  };

  const getTypeConfig = (type: string) => types.find(t => t.value === type) || types[0];
  const getStatusConfig = (status: string) => statuses.find(s => s.value === status) || statuses[0];

  const totalItems = Array.from(categories.values()).reduce((sum, items) => sum + items.length, 0);
  const checkedItems = Array.from(categories.values()).reduce(
    (sum, items) => sum + items.filter(i => i.checked).length,
    0
  );

  if (tripsLoading || itemsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Plane size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Voyages & Week-ends</h2>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF] mx-auto mb-4"></div>
          <p className="text-[14px] text-[#7A7A7A]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Plane size={24} className="text-[#2563FF]" />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-semibold">Voyages & Week-ends</h2>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
              🔥 LIVE
            </span>
          </div>
          <p className="text-[13px] text-[#7A7A7A]">
            {trips.length} voyage(s) • {checkedItems}/{totalItems} éléments cochés
          </p>
        </div>
      </div>

      {/* Formulaire ajout voyage */}
      {showAddTripForm && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <h3 className="text-[16px] font-semibold mb-4">Nouveau voyage</h3>
          <form onSubmit={handleAddTrip} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Destination *</label>
                <input
                  type="text"
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: Londres"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Type</label>
                <select
                  value={newTrip.type}
                  onChange={(e) => setNewTrip({...newTrip, type: e.target.value as 'voyage' | 'weekend'})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                >
                  {types.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Départ *</label>
                <input
                  type="date"
                  value={newTrip.start_date}
                  onChange={(e) => setNewTrip({...newTrip, start_date: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Retour</label>
                <input
                  type="date"
                  value={newTrip.end_date}
                  onChange={(e) => setNewTrip({...newTrip, end_date: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg hover:bg-blue-600">
                Ajouter
              </button>
              <button type="button" onClick={() => setShowAddTripForm(false)} className="px-6 py-2 text-[#7A7A7A] text-[13px] font-medium hover:bg-gray-100 rounded-lg">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des voyages */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">Mes voyages</h3>
          <button
            onClick={() => setShowAddTripForm(true)}
            className="px-3 py-1.5 bg-[#2563FF] text-white text-[12px] font-medium rounded-lg flex items-center gap-1.5 hover:bg-blue-600"
          >
            <Plus size={14} />
            Nouveau voyage
          </button>
        </div>
        <div className="space-y-3">
          {trips.length === 0 ? (
            <div className="text-center py-8">
              <Plane size={48} className="text-[#C3C3C3] mx-auto mb-4" />
              <p className="text-[#9B9B9B] text-[14px]">Aucun voyage planifié</p>
            </div>
          ) : (
            trips.map(trip => {
              const typeConfig = getTypeConfig(trip.type);

              // Calculer le temps restant avant le départ
              const startDate = new Date(trip.start_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              startDate.setHours(0, 0, 0, 0);
              const daysRemaining = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              let timeRemainingText = '';
              let timeRemainingColor = '';
              if (daysRemaining < 0) {
                timeRemainingText = 'Passé';
                timeRemainingColor = 'text-gray-400';
              } else if (daysRemaining === 0) {
                timeRemainingText = "Aujourd'hui !";
                timeRemainingColor = 'text-green-600 font-semibold';
              } else if (daysRemaining === 1) {
                timeRemainingText = 'Demain !';
                timeRemainingColor = 'text-orange-600 font-semibold';
              } else if (daysRemaining <= 7) {
                timeRemainingText = `Dans ${daysRemaining} jours`;
                timeRemainingColor = 'text-orange-600 font-semibold';
              } else if (daysRemaining <= 30) {
                timeRemainingText = `Dans ${daysRemaining} jours`;
                timeRemainingColor = 'text-blue-600';
              } else {
                timeRemainingText = `Dans ${daysRemaining} jours`;
                timeRemainingColor = 'text-[#7A7A7A]';
              }

              return (
                <div key={trip.id} className="border border-[#F1F1F1] rounded-lg p-4 hover:border-[#2563FF] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-[15px] font-semibold text-[#2B2B2B] mb-2">{trip.destination}</h4>
                      <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A] mb-2">
                        <Calendar size={14} />
                        <span>
                          {new Date(trip.start_date).toLocaleDateString('fr-FR')}
                          {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString('fr-FR')}`}
                        </span>
                      </div>
                      {daysRemaining >= 0 && (
                        <div className={`text-[12px] mb-3 ${timeRemainingColor}`}>
                          ⏱️ {timeRemainingText}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 ${typeConfig.color} text-white text-[11px] rounded-lg`}>
                          {typeConfig.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="text-[#FF6A6A] hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Checklist avec catégories */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">Checklist valise</h3>
          <div className="flex items-center gap-2">
            {checkedItems > 0 && (
              <button
                onClick={handleUncheckAll}
                className="px-3 py-1.5 text-[#7A7A7A] border border-[#E5E5E5] text-[12px] font-medium rounded-lg flex items-center gap-1.5 hover:bg-gray-50"
                title="Tout décocher"
              >
                <SquareX size={14} />
                Tout décocher
              </button>
            )}
            <button
              onClick={() => setShowAddCategoryForm(true)}
              className="px-3 py-1.5 bg-[#2563FF] text-white text-[12px] font-medium rounded-lg flex items-center gap-1.5 hover:bg-blue-600"
            >
              <Tag size={14} />
              Nouvelle catégorie
            </button>
          </div>
        </div>

        {/* Formulaire nouvelle catégorie */}
        {showAddCategoryForm && (
          <form onSubmit={handleAddCategory} className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <label className="block text-[12px] font-medium text-[#2563FF] mb-2">Nom de la catégorie</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 h-9 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                placeholder="Ex: Documents, Toilette, Vêtements..."
                autoFocus
              />
              <button type="submit" className="h-9 px-4 bg-[#2563FF] text-white text-[12px] font-medium rounded-lg hover:bg-blue-600">
                Créer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryForm(false);
                  setNewCategory('');
                }}
                className="h-9 px-3 text-[#7A7A7A] text-[12px] font-medium hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste des catégories */}
        {categories.size === 0 ? (
          <div className="text-center py-8">
            <Tag size={48} className="text-[#C3C3C3] mx-auto mb-4" />
            <p className="text-[#9B9B9B] text-[14px] mb-2">Aucune catégorie créée</p>
            <p className="text-[#C3C3C3] text-[12px]">Créez des catégories pour organiser votre checklist</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categoryNames} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedCategories.map(({ category, items }) => {
                  const isExpanded = expandedCategories.has(category);
                  const isAddingItem = selectedCategory === category;

                  return (
                    <SortableCategory
                      key={category}
                      category={category}
                      items={items}
                      isExpanded={isExpanded}
                      onToggle={() => toggleCategory(category)}
                      onAddItem={(e: React.FormEvent) => {
                        e.preventDefault();
                        handleAddItemToCategory(category);
                      }}
                      isAddingItem={isAddingItem}
                      newItemText={newItemText}
                      onNewItemChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemText(e.target.value)}
                      selectedCategory={selectedCategory}
                      onSelectCategory={(cat: string) => {
                        setSelectedCategory(cat);
                        setNewItemText('');
                      }}
                      onToggleItem={togglePackingItem}
                      onDeleteItem={deletePackingItem}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

export default memo(Voyages);
