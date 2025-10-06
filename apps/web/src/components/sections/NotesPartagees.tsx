import { useState, memo } from 'react';
import { Plus, X, Edit, Save, StickyNote, Pin, Search } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', label: 'Jaune' },
  { name: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', label: 'Bleu' },
  { name: 'green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', label: 'Vert' },
  { name: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', label: 'Rose' },
  { name: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', label: 'Violet' },
  { name: 'orange', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', label: 'Orange' },
];

function NotesPartagees() {
  const { notes, loading, error, addNote, updateNote, deleteNote } = useNotes();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState('yellow');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      try {
        await addNote(newNote.trim(), selectedColor);
        setNewNote('');
        setSelectedColor('yellow');
        setShowAddForm(false);
      } catch (err) {
        console.error('Failed to add note:', err);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleEditNote = (note: { id: string; text: string; color: string }) => {
    setEditingNote(note.id);
    setEditText(note.text);
    setEditColor(note.color);
  };

  const handleSaveEdit = async () => {
    if (editingNote && editText.trim()) {
      try {
        await updateNote(editingNote, { text: editText.trim(), color: editColor });
        setEditingNote(null);
        setEditText('');
        setEditColor('yellow');
      } catch (err) {
        console.error('Failed to update note:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditText('');
    setEditColor('yellow');
  };

  const handleTogglePin = async (note: any) => {
    try {
      await updateNote(note.id, { pinned: !note.pinned });
    } catch (err) {
      console.error('Failed to pin/unpin note:', err);
    }
  };

  const getColorClasses = (colorName: string) => {
    const color = COLORS.find(c => c.name === colorName) || COLORS[0];
    return {
      bg: color.bg,
      border: color.border,
      text: color.text
    };
  };

  // Filtrer et trier les notes
  const filteredNotes = notes
    .filter(note => note.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Notes épinglées en premier
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Puis par date (plus récent en premier)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const pinnedCount = notes.filter(n => n.pinned).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <StickyNote size={24} className="text-[#F59E0B]" />
          <h2 className="text-[20px] font-semibold">Notes partagées</h2>
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
          <StickyNote size={24} className="text-[#F59E0B]" />
          <h2 className="text-[20px] font-semibold">Notes partagées</h2>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <p className="text-[13px] text-red-600">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={24} className="text-[#F59E0B]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-semibold">Notes partagées</h2>
              <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                🔥 LIVE Supabase
              </span>
            </div>
            <p className="text-[13px] text-[#7A7A7A]">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
              {pinnedCount > 0 && ` • ${pinnedCount} épinglée${pinnedCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Ajouter une note
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold">Nouvelle note</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-[#7A7A7A] hover:bg-gray-100 p-1 rounded"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                Texte de la note *
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Écrivez votre note ici..."
                className="w-full h-32 px-4 py-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF] resize-none"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                Couleur
              </label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-lg ${color.bg} ${color.border} border-2 hover:scale-110 transition-smooth ${
                      selectedColor === color.name ? 'ring-2 ring-[#2563FF] ring-offset-2' : ''
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-[#E5E5E5] text-[#7A7A7A] text-[13px] font-medium rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="flex-1 px-6 py-2 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ajouter la note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C3C3C3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les notes..."
            className="w-full h-10 pl-10 pr-4 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
          />
        </div>
      </div>

      {/* Liste des notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => {
          const colors = getColorClasses(note.color);
          return (
            <div
              key={note.id}
              className={`relative p-4 border-2 rounded-lg ${colors.bg} ${colors.border} group transition-smooth hover:shadow-md animate-scale-in`}
            >
              {/* Pin badge */}
              {note.pinned && (
                <div className="absolute -top-2 -right-2 bg-[#2563FF] text-white rounded-full p-1.5 shadow-md">
                  <Pin size={12} className="fill-current" />
                </div>
              )}

              {editingNote === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`w-full resize-none bg-transparent text-[13px] outline-none ${colors.text}`}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {COLORS.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setEditColor(color.name)}
                          className={`w-6 h-6 rounded ${color.bg} ${color.border} border ${
                            editColor === color.name ? 'ring-2 ring-[#2563FF]' : ''
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                    <div className="flex-1"></div>
                    <button
                      onClick={handleSaveEdit}
                      className="text-[#10B981] hover:bg-white hover:bg-opacity-50 p-1.5 rounded transition-smooth"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-[#7A7A7A] hover:bg-white hover:bg-opacity-50 p-1.5 rounded transition-smooth"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className={`text-[13px] ${colors.text} mb-3 leading-relaxed whitespace-pre-wrap`}>{note.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9B9B9B]">
                      {new Date(note.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`${note.pinned ? 'text-[#2563FF]' : 'text-[#7A7A7A]'} hover:bg-white hover:bg-opacity-50 p-1 rounded transition-smooth`}
                        title={note.pinned ? 'Désépingler' : 'Épingler'}
                      >
                        <Pin size={14} className={note.pinned ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => handleEditNote(note)}
                        className="text-[#2563FF] hover:bg-white hover:bg-opacity-50 p-1 rounded transition-smooth"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-[#FF6A6A] hover:bg-white hover:bg-opacity-50 p-1 rounded transition-smooth"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-12 text-center">
          <StickyNote size={64} className="text-[#C3C3C3] mx-auto mb-4" />
          {searchQuery ? (
            <>
              <p className="text-[#9B9B9B] mb-2">Aucune note trouvée pour "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[13px] text-[#2563FF] hover:underline"
              >
                Effacer la recherche
              </button>
            </>
          ) : (
            <>
              <p className="text-[#9B9B9B] mb-2">Aucune note pour le moment</p>
              <p className="text-[12px] text-[#C3C3C3]">Créez votre première note en cliquant sur "Nouvelle note" !</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(NotesPartagees);
