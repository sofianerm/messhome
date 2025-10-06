import { useState, useEffect, memo } from 'react';
import { Calendar, Plus, Clock, MapPin, User, X, Edit } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

type EventFormData = {
  title: string;
  date: string;
  time: string;
  type: 'rdv' | 'anniversaire' | 'ecole' | 'sport' | 'vacances' | 'reunion' | 'sante' | 'autre';
  person: string; // Stocké comme string (liste séparée par virgules)
  location: string;
};

// Composant TimePicker simple avec input HTML natif
function TimePicker({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
    />
  );
}

function AgendaFamilial() {
  const { events, loading, error, addEvent, updateEvent, deleteEvent } = useEvents();
  const { members } = useFamilyMembers();

  const [newEvent, setNewEvent] = useState<EventFormData>({
    title: '',
    date: '',
    time: '',
    type: 'rdv',
    person: '',
    location: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EventFormData | null>(null);

  // State pour la sélection multiple des personnes
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
  const [editSelectedPersons, setEditSelectedPersons] = useState<string[]>([]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date) {
      try {
        await addEvent({
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time || null,
          type: newEvent.type,
          person: selectedPersons.join(', ') || null,
          location: newEvent.location || null,
        });
        setNewEvent({
          title: '',
          date: '',
          time: '',
          type: 'rdv',
          person: '',
          location: ''
        });
        setSelectedPersons([]);
        setShowAddForm(false);
      } catch (err) {
        console.error('Failed to add event:', err);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleEditEvent = (event: typeof events[0]) => {
    setEditingEvent(event.id);
    setEditFormData({
      title: event.title,
      date: event.date,
      time: event.time || '',
      type: event.type as 'rdv' | 'anniversaire' | 'ecole' | 'sport' | 'vacances' | 'reunion' | 'sante' | 'autre',
      person: event.person || '',
      location: event.location || ''
    });
    // Convertir la string en array pour l'édition
    setEditSelectedPersons(event.person ? event.person.split(', ').map(p => p.trim()) : []);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent && editFormData) {
      try {
        await updateEvent(editingEvent, {
          title: editFormData.title,
          date: editFormData.date,
          time: editFormData.time || null,
          type: editFormData.type,
          person: editSelectedPersons.join(', ') || null,
          location: editFormData.location || null,
        });
        setEditingEvent(null);
        setEditFormData(null);
        setEditSelectedPersons([]);
      } catch (err) {
        console.error('Failed to update event:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditFormData(null);
    setEditSelectedPersons([]);
  };

  // Toggle personne dans la sélection
  const togglePerson = (personName: string, isEditing: boolean = false) => {
    if (isEditing) {
      setEditSelectedPersons(prev =>
        prev.includes(personName)
          ? prev.filter(p => p !== personName)
          : [...prev, personName]
      );
    } else {
      setSelectedPersons(prev =>
        prev.includes(personName)
          ? prev.filter(p => p !== personName)
          : [...prev, personName]
      );
    }
  };

  // Liste des options de personnes
  const getPersonOptions = () => {
    const options = ['Toute la famille'];
    members.forEach(member => {
      options.push(`${member.first_name}`);
    });
    return options;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rdv': return 'bg-[#2563FF]';
      case 'anniversaire': return 'bg-[#FF6A6A]';
      case 'ecole': return 'bg-[#F59E0B]';
      case 'sport': return 'bg-[#10B981]';
      case 'vacances': return 'bg-[#8B5CF6]';
      case 'reunion': return 'bg-[#EC4899]';
      case 'sante': return 'bg-[#EF4444]';
      default: return 'bg-[#9B9B9B]';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rdv': return '📅 Rendez-vous';
      case 'anniversaire': return '🎂 Anniversaire';
      case 'ecole': return '🎒 École';
      case 'sport': return '⚽ Sport/Activité';
      case 'vacances': return '✈️ Vacances';
      case 'reunion': return '👥 Réunion';
      case 'sante': return '🩺 Santé';
      case 'autre': return '📌 Autre';
      default: return '📌 Autre';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={24} className="text-[#2563FF]" />
            <h2 className="text-[20px] font-semibold">Agenda Familial</h2>
          </div>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF] mx-auto mb-4"></div>
          <p className="text-[14px] text-[#7A7A7A]">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={24} className="text-[#2563FF]" />
            <h2 className="text-[20px] font-semibold">Agenda Familial</h2>
          </div>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <p className="text-[13px] text-red-600 mb-2">❌ {error}</p>
          <p className="text-[12px] text-[#7A7A7A]">
            Vérifiez que les migrations Supabase ont bien été exécutées
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Agenda Familial</h2>
          <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            🔥 LIVE Supabase
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Ajouter un événement
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold">Nouvel événement</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-[#7A7A7A] hover:bg-gray-100 p-1 rounded"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: RDV dentiste"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                >
                  <option value="rdv">📅 Rendez-vous</option>
                  <option value="anniversaire">🎂 Anniversaire</option>
                  <option value="ecole">🎒 École</option>
                  <option value="sport">⚽ Sport/Activité</option>
                  <option value="vacances">✈️ Vacances</option>
                  <option value="reunion">👥 Réunion</option>
                  <option value="sante">🩺 Santé</option>
                  <option value="autre">📌 Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Heure
                </label>
                <TimePicker
                  value={newEvent.time}
                  onChange={(time) => setNewEvent({ ...newEvent, time })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Personne(s)
                </label>
                <div className="flex flex-wrap gap-2">
                  {getPersonOptions().map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => togglePerson(option)}
                      className={`px-3 py-1 text-[12px] rounded-full transition-colors ${
                        selectedPersons.includes(option)
                          ? 'bg-[#2563FF] text-white'
                          : 'bg-gray-100 text-[#7A7A7A] hover:bg-gray-200'
                      }`}
                    >
                      {selectedPersons.includes(option) ? '✓ ' : ''}
                      {option}
                    </button>
                  ))}
                  {getPersonOptions().length === 0 && (
                    <p className="text-[12px] text-gray-400 italic">
                      Aucun membre. Ajoutez-en dans Paramètres.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: Cabinet médical, École"
                />
              </div>
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

      {/* Liste des événements */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
            <Calendar size={48} className="text-[#C3C3C3] mx-auto mb-4" />
            <p className="text-[#9B9B9B]">Aucun événement planifié</p>
            <p className="text-[11px] text-[#C3C3C3] mt-1">Ajoutez votre premier événement ci-dessus !</p>
          </div>
        ) : (
          events.map((event) => {
            const isEditing = editingEvent === event.id;

            if (isEditing && editFormData) {
              return (
                <div key={event.id} className="bg-white border-2 border-[#2563FF] rounded-xl p-6">
                  <h3 className="text-[16px] font-semibold mb-4">Modifier l'événement</h3>
                  <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                          Titre *
                        </label>
                        <input
                          type="text"
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                          Type
                        </label>
                        <select
                          value={editFormData.type}
                          onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as any })}
                          className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                        >
                          <option value="rdv">📅 Rendez-vous</option>
                          <option value="anniversaire">🎂 Anniversaire</option>
                          <option value="ecole">🎒 École</option>
                          <option value="sport">⚽ Sport/Activité</option>
                          <option value="vacances">✈️ Vacances</option>
                          <option value="reunion">👥 Réunion</option>
                          <option value="sante">🩺 Santé</option>
                          <option value="autre">📌 Autre</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                          Heure
                        </label>
                        <TimePicker
                          value={editFormData.time}
                          onChange={(time) => setEditFormData({ ...editFormData, time })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                          Personne(s)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {getPersonOptions().map(option => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => togglePerson(option, true)}
                              className={`px-3 py-1 text-[12px] rounded-full transition-colors ${
                                editSelectedPersons.includes(option)
                                  ? 'bg-[#2563FF] text-white'
                                  : 'bg-gray-100 text-[#7A7A7A] hover:bg-gray-200'
                              }`}
                            >
                              {editSelectedPersons.includes(option) ? '✓ ' : ''}
                              {option}
                            </button>
                          ))}
                          {getPersonOptions().length === 0 && (
                            <p className="text-[12px] text-gray-400 italic">
                              Aucun membre. Ajoutez-en dans Paramètres.
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                          Lieu
                        </label>
                        <input
                          type="text"
                          value={editFormData.location}
                          onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                          className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#10B981] text-white text-[13px] font-medium rounded-lg hover:bg-green-600"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-2 text-[#7A7A7A] text-[13px] font-medium hover:bg-gray-100 rounded-lg"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              );
            }

            return (
              <div key={event.id} className="bg-white border border-[#F1F1F1] rounded-xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className={`w-3 h-3 ${getTypeColor(event.type)} rounded-full mt-2 flex-shrink-0`}></div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-[15px] font-semibold text-[#2B2B2B]">
                          {event.title}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 ${getTypeColor(event.type)} text-white rounded-full font-medium`}>
                          {getTypeLabel(event.type)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A]">
                          <Calendar size={14} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A]">
                            <Clock size={14} />
                            <span>{event.time.substring(0, 5)}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A]">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.person && (
                          <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A]">
                            <User size={14} />
                            <span>{event.person}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-[#2563FF] text-[12px] font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-[#FF6A6A] text-[12px] font-medium hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default memo(AgendaFamilial);
