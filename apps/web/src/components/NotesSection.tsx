import { useState } from 'react';
import { Plus, X, Edit, Save, StickyNote } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';

export default function NotesSection() {
  const { notes, loading, error, addNote, updateNote, deleteNote } = useNotes();
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      try {
        await addNote(newNote.trim(), 'yellow');
        setNewNote('');
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

  const handleEditNote = (note: { id: string; text: string }) => {
    setEditingNote(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = async () => {
    if (editingNote && editText.trim()) {
      try {
        await updateNote(editingNote, { text: editText.trim() });
        setEditingNote(null);
        setEditText('');
      } catch (err) {
        console.error('Failed to update note:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditText('');
  };

  const getNoteColorClass = (color: string) => {
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-100 border-yellow-300',
      blue: 'bg-blue-100 border-blue-300',
      green: 'bg-green-100 border-green-300',
      pink: 'bg-pink-100 border-pink-300',
      purple: 'bg-purple-100 border-purple-300'
    };
    return colors[color] || colors.yellow;
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold flex items-center gap-2">
            <StickyNote size={16} className="text-[#F59E0B]" />
            Notes rapides
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563FF] mx-auto mb-2"></div>
          <p className="text-[12px] text-[#7A7A7A]">Chargement des notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold flex items-center gap-2">
            <StickyNote size={16} className="text-[#F59E0B]" />
            Notes rapides
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-[13px] text-red-600 mb-2">❌ {error}</p>
          <p className="text-[12px] text-[#7A7A7A]">
            Vérifiez que les migrations Supabase ont bien été exécutées
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-semibold flex items-center gap-2">
          <StickyNote size={16} className="text-[#F59E0B]" />
          Notes rapides
          <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            🔥 LIVE Supabase
          </span>
        </h3>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddNote} className="mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Ajouter une note rapide..."
            className="flex-1 h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </form>

      {/* Liste des notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {notes.map(note => (
          <div key={note.id} className={`p-4 border-2 border-dashed rounded-lg ${getNoteColorClass(note.color)} group`}>
            {editingNote === note.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full resize-none bg-transparent text-[13px] outline-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveEdit}
                    className="text-[#10B981] hover:bg-white hover:bg-opacity-50 p-1 rounded"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-[#7A7A7A] hover:bg-white hover:bg-opacity-50 p-1 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[13px] text-[#2B2B2B] mb-2 leading-relaxed">{note.text}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-[#2563FF] hover:bg-white hover:bg-opacity-50 p-1 rounded"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-[#FF6A6A] hover:bg-white hover:bg-opacity-50 p-1 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-8">
          <StickyNote size={48} className="text-[#C3C3C3] mx-auto mb-4" />
          <p className="text-[#9B9B9B]">Aucune note pour le moment</p>
          <p className="text-[11px] text-[#C3C3C3] mt-1">Ajoutez votre première note ci-dessus !</p>
        </div>
      )}
    </div>
  );
}
