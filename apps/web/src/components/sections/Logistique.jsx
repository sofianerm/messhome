import { useState } from 'react';
import { Car, Plus, Calendar, AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function Logistique() {
  const [rappels, setRappels] = useState([
    { id: 1, title: 'Contrôle technique', vehicle: 'Peugeot 308', date: '2025-10-15', status: 'pending', type: 'controle' },
    { id: 2, title: 'Assurance auto', vehicle: 'Peugeot 308', date: '2025-09-30', status: 'urgent', type: 'assurance' },
    { id: 3, title: 'Vidange', vehicle: 'Renault Clio', date: '2025-09-10', status: 'done', type: 'entretien' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRappel, setNewRappel] = useState({
    title: '',
    vehicle: '',
    date: '',
    type: 'entretien'
  });

  const types = [
    { value: 'controle', label: 'Contrôle technique', color: 'bg-[#F59E0B]' },
    { value: 'assurance', label: 'Assurance', color: 'bg-[#2563FF]' },
    { value: 'entretien', label: 'Entretien', color: 'bg-[#10B981]' },
    { value: 'revision', label: 'Révision', color: 'bg-[#8B5CF6]' }
  ];

  const handleAddRappel = (e) => {
    e.preventDefault();
    if (newRappel.title && newRappel.vehicle && newRappel.date) {
      const today = new Date();
      const rappelDate = new Date(newRappel.date);
      const daysDiff = Math.ceil((rappelDate - today) / (1000 * 60 * 60 * 24));
      
      let status = 'pending';
      if (daysDiff < 0) status = 'overdue';
      else if (daysDiff <= 30) status = 'urgent';

      setRappels([...rappels, {
        id: Date.now(),
        ...newRappel,
        status
      }]);
      setNewRappel({ title: '', vehicle: '', date: '', type: 'entretien' });
      setShowAddForm(false);
    }
  };

  const handleToggleStatus = (id) => {
    setRappels(rappels.map(rappel => 
      rappel.id === id 
        ? { ...rappel, status: rappel.status === 'done' ? 'pending' : 'done' }
        : rappel
    ));
  };

  const handleDeleteRappel = (id) => {
    setRappels(rappels.filter(rappel => rappel.id !== id));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'done': return { color: 'text-[#10B981]', bg: 'bg-green-50', label: 'Fait', icon: CheckCircle };
      case 'urgent': return { color: 'text-[#FF6A6A]', bg: 'bg-red-50', label: 'Urgent', icon: AlertTriangle };
      case 'overdue': return { color: 'text-[#DC2626]', bg: 'bg-red-100', label: 'En retard', icon: AlertTriangle };
      default: return { color: 'text-[#9B9B9B]', bg: 'bg-gray-50', label: 'À faire', icon: Calendar };
    }
  };

  const getTypeConfig = (type) => {
    return types.find(t => t.value === type) || types[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const sortedRappels = [...rappels].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Logistique</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="h-10 px-4 bg-[#2563FF] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus size={16} />
          Ajouter un rappel
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
          <h3 className="text-[16px] font-semibold mb-4">Nouveau rappel</h3>
          <form onSubmit={handleAddRappel} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Type</label>
                <select
                  value={newRappel.type}
                  onChange={(e) => setNewRappel({...newRappel, type: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Titre *</label>
                <input
                  type="text"
                  value={newRappel.title}
                  onChange={(e) => setNewRappel({...newRappel, title: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: Contrôle technique"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Véhicule *</label>
                <input
                  type="text"
                  value={newRappel.vehicle}
                  onChange={(e) => setNewRappel({...newRappel, vehicle: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  placeholder="Ex: Peugeot 308"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">Date d'échéance *</label>
                <input
                  type="date"
                  value={newRappel.date}
                  onChange={(e) => setNewRappel({...newRappel, date: e.target.value})}
                  className="w-full h-10 px-3 border border-[#E5E5E5] rounded-lg text-[13px] outline-none focus:border-[#2563FF]"
                  required
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

      <div className="space-y-4">
        {sortedRappels.length === 0 ? (
          <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
            <Car size={48} className="text-[#C3C3C3] mx-auto mb-4" />
            <p className="text-[#9B9B9B]">Aucun rappel logistique</p>
          </div>
        ) : (
          sortedRappels.map(rappel => {
            const statusConfig = getStatusConfig(rappel.status);
            const typeConfig = getTypeConfig(rappel.type);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={rappel.id} className="bg-white border border-[#F1F1F1] rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 ${typeConfig.color} rounded-full mt-2 flex-shrink-0`}></div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#2B2B2B] mb-1">
                          {rappel.title}
                        </h3>
                        <p className="text-[13px] text-[#7A7A7A] mb-2">{rappel.vehicle}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2 text-[13px] text-[#7A7A7A]">
                            <Calendar size={14} />
                            <span>{formatDate(rappel.date)}</span>
                          </div>
                          <div className={`flex items-center gap-2 px-2 py-1 ${statusConfig.bg} rounded-xl`}>
                            <StatusIcon size={12} className={statusConfig.color} />
                            <span className={`text-[11px] font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(rappel.id)}
                            className={`px-3 py-1 text-[12px] font-medium rounded-lg ${
                              rappel.status === 'done' 
                                ? 'bg-gray-100 text-[#7A7A7A]' 
                                : 'bg-[#2563FF] text-white hover:bg-blue-600'
                            }`}
                          >
                            {rappel.status === 'done' ? 'Marquer à faire' : 'Marquer fait'}
                          </button>
                          <span className={`px-2 py-1 ${typeConfig.color} text-white text-[11px] rounded-xl`}>
                            {typeConfig.label}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteRappel(rappel.id)}
                        className="text-[#FF6A6A] hover:bg-red-50 p-2 rounded"
                      >
                        <X size={16} />
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