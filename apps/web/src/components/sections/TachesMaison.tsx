import { useState } from 'react';
import { CheckSquare, Plus, Check, X, User, Calendar } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

export default function TachesMaison() {
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTache, setNewTache] = useState({
    title: '',
    assigned_to: '',
    due_date: '',
    description: ''
  });

  const handleAddTache = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTache.title) {
      try {
        await addTask({
          title: newTache.title,
          description: newTache.description || null,
          assigned_to: null,
          due_date: newTache.due_date || null,
          completed: false
        });
        setNewTache({ title: '', assigned_to: '', due_date: '', description: '' });
        setShowAddForm(false);
      } catch (err) {
        console.error('Failed to add task:', err);
      }
    }
  };

  const handleToggleTache = async (id: string, completed: boolean) => {
    try {
      await toggleTask(id, !completed);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTache = async (id: string) => {
    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleDeleteChecked = async () => {
    const checkedTasks = tasks.filter(task => task.completed);
    if (checkedTasks.length === 0) return;

    try {
      await Promise.all(checkedTasks.map(task => deleteTask(task.id)));
    } catch (err) {
      console.error('Failed to delete checked tasks:', err);
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <CheckSquare size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Tâches Maison</h2>
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
          <CheckSquare size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Tâches Maison</h2>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <p className="text-[13px] text-red-600">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare size={24} className="text-[#2563FF]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-semibold">Tâches Maison</h2>
              <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                🔥 LIVE
              </span>
            </div>
            <p className="text-[13px] text-[#7A7A7A]">
              {completedCount} sur {totalCount} tâches terminées
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {completedCount > 0 && (
            <button
              onClick={handleDeleteChecked}
              className="h-10 px-4 text-[#FF6A6A] text-[13px] font-medium border border-[#FF6A6A] rounded-lg hover:bg-red-50"
            >
              Supprimer cochés ({completedCount})
            </button>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={16} />
            Ajouter une tâche
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <h3 className="text-[16px] font-semibold mb-4">Nouvelle tâche</h3>
          <form onSubmit={handleAddTache} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Tâche *</label>
                <input
                  type="text"
                  value={newTache.title}
                  onChange={(e) => setNewTache({ ...newTache, title: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: Nettoyer les vitres"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Description</label>
                <input
                  type="text"
                  value={newTache.description}
                  onChange={(e) => setNewTache({ ...newTache, description: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Optionnel"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Date limite</label>
                <input
                  type="date"
                  value={newTache.due_date}
                  onChange={(e) => setNewTache({ ...newTache, due_date: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg hover:bg-blue-600">
                Ajouter
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 text-[#7A7A7A] text-[13px] font-medium hover:bg-gray-100 rounded-lg">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare size={48} className="text-[#C3C3C3] mx-auto mb-4" />
              <p className="text-[#9B9B9B]">Aucune tâche créée</p>
            </div>
          ) : (
            tasks.map(tache => (
              <div key={tache.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => handleToggleTache(tache.id, tache.completed)}
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                    tache.completed
                      ? 'bg-[#2563FF] border-[#2563FF] text-white'
                      : 'border-[#E5E5E5] hover:border-[#2563FF]'
                  }`}
                >
                  {tache.completed && <Check size={12} />}
                </button>

                <div className="flex-1">
                  <div className={`text-[14px] font-medium ${tache.completed ? 'line-through text-[#9B9B9B]' : 'text-[#2B2B2B]'}`}>
                    {tache.title}
                  </div>
                  {(tache.description || tache.due_date) && (
                    <div className="flex items-center gap-4 mt-1">
                      {tache.description && (
                        <span className="text-[12px] text-[#7A7A7A]">{tache.description}</span>
                      )}
                      {tache.due_date && (
                        <div className="flex items-center gap-1 text-[12px] text-[#7A7A7A]">
                          <Calendar size={12} />
                          <span>{new Date(tache.due_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteTache(tache.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#FF6A6A] hover:bg-red-50 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
