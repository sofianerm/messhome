import { useState } from 'react';
import { Baby, Plus, Calendar, MapPin, Clock, X } from 'lucide-react';

export default function Enfants() {
  const [activites, setActivites] = useState([
    { id: 1, child: 'Emma', activity: 'Cours de danse', date: '2025-09-03', time: '16:00', location: 'École de danse', type: 'activite' },
    { id: 2, child: 'Lucas', activity: 'Football', date: '2025-09-04', time: '17:30', location: 'Stade municipal', type: 'sport' },
    { id: 3, child: 'Emma', activity: 'Réunion parents-professeurs', date: '2025-09-06', time: '18:00', location: 'École Sainte-Marie', type: 'ecole' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    child: 'Emma',
    activity: '',
    date: '',
    time: '',
    location: '',
    type: 'activite'
  });

  const children = ['Emma', 'Lucas'];
  const types = [
    { value: 'activite', label: 'Activité', color: 'bg-[#2563FF]' },
    { value: 'sport', label: 'Sport', color: 'bg-[#10B981]' },
    { value: 'ecole', label: 'École', color: 'bg-[#F59E0B]' },
    { value: 'sortie', label: 'Sortie', color: 'bg-[#8B5CF6]' }
  ];

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (newActivity.child && newActivity.activity && newActivity.date) {
      setActivites([...activites, {
        id: Date.now(),
        ...newActivity
      }]);
      setNewActivity({
        child: 'Emma',
        activity: '',
        date: '',
        time: '',
        location: '',
        type: 'activite'
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteActivity = (id) => {
    setActivites(activites.filter(activity => activity.id !== id));
  };

  const getTypeConfig = (type) => {
    return types.find(t => t.value === type) || types[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const groupedActivities = children.map(child => ({
    child,
    activities: activites.filter(activity => activity.child === child)
  })).filter(group => group.activities.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Baby size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Enfants</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus size={16} />
          Ajouter une activité
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <h3 className="text-[16px] font-semibold mb-4">Nouvelle activité</h3>
          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Enfant *
                </label>
                <select
                  value={newActivity.child}
                  onChange={(e) => setNewActivity({...newActivity, child: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                >
                  {children.map(child => (
                    <option key={child} value={child}>{child}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Type
                </label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Activité *
                </label>
                <input
                  type="text"
                  value={newActivity.activity}
                  onChange={(e) => setNewActivity({...newActivity, activity: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: Cours de danse"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: École de danse"
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

      {/* Activités par enfant */}
      <div className="space-y-6">
        {groupedActivities.length === 0 ? (
          <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
            <Baby size={48} className="text-[#C3C3C3] mx-auto mb-4" />
            <p className="text-[#9B9B9B]">Aucune activité planifiée</p>
          </div>
        ) : (
          groupedActivities.map(group => (
            <div key={group.child} className="bg-white border border-[#F1F1F1] rounded-xl p-6">
              <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
                <Baby size={20} className="text-[#2563FF]" />
                {group.child}
              </h3>
              
              <div className="space-y-4">
                {group.activities
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(activity => {
                    const typeConfig = getTypeConfig(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-4 group">
                        <div className={`w-3 h-3 ${typeConfig.color} rounded-full mt-2 flex-shrink-0`}></div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-[15px] font-semibold text-[#2B2B2B] mb-2">
                                {activity.activity}
                              </h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A]">
                                  <Calendar size={14} />
                                  <span>{formatDate(activity.date)}</span>
                                </div>
                                {activity.time && (
                                  <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A]">
                                    <Clock size={14} />
                                    <span>{activity.time}</span>
                                  </div>
                                )}
                                {activity.location && (
                                  <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A]">
                                    <MapPin size={14} />
                                    <span>{activity.location}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2">
                                <span className={`px-2 py-1 ${typeConfig.color} text-white text-[11px] rounded-xl`}>
                                  {typeConfig.label}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="opacity-0 group-hover:opacity-100 text-[#FF6A6A] hover:bg-red-50 p-1 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}