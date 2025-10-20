import React, { useState, memo } from 'react';
import { useFamilySettings } from '../../hooks/useFamilySettings';
import { useFamilyMembers } from '../../hooks/useFamilyMembers';
import { useAuthWithSettings } from '../../hooks/useAuthWithSettings';
import { differenceInYears } from 'date-fns';
import { Settings, Trash2 } from 'lucide-react';
import GooglePlacesAutocomplete from '../common/GooglePlacesAutocomplete';
import DeleteAccountModal from '../common/DeleteAccountModal';
import { supabase } from '../../lib/supabase';

const ROLE_LABELS = {
  papa: '👨 Papa',
  maman: '👩 Maman',
  enfant: '👶 Enfant',
  autre: '👤 Autre'
};

const COLORS = [
  '#2563FF', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

function FamilySettings() {
  const { user } = useAuthWithSettings();
  const { settings, loading: settingsLoading, updateSettings } = useFamilySettings();
  const { members, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembers();

  // États pour l'édition des paramètres famille
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    family_name: '',
    home_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  // États pour l'ajout/édition de membre
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberForm, setMemberForm] = useState({
    first_name: '',
    last_name: '',
    role: 'enfant' as 'papa' | 'maman' | 'enfant' | 'autre',
    birth_date: '',
    email: '',
    phone: '',
    color: COLORS[0],
    allergies: '',
    dietary_preferences: '',
    whatsapp_notifications: false,
  });

  const handleEditSettings = () => {
    setSettingsForm({
      family_name: settings?.family_name || '',
      home_address: settings?.home_address || '',
      emergency_contact_name: settings?.emergency_contact_name || '',
      emergency_contact_phone: settings?.emergency_contact_phone || '',
    });
    setEditingSettings(true);
  };

  const handleSaveSettings = async () => {
    await updateSettings(settingsForm);
    setEditingSettings(false);
  };

  const handleAddMember = () => {
    setMemberForm({
      first_name: '',
      last_name: settings?.family_name?.replace('Famille ', '') || '',
      role: 'enfant',
      birth_date: '',
      email: '',
      phone: '',
      color: COLORS[members.length % COLORS.length],
      allergies: '',
      dietary_preferences: '',
      whatsapp_notifications: false,
    });
    setEditingMemberId(null);
    setShowMemberForm(true);
  };

  const handleEditMember = (member: any) => {
    setMemberForm({
      first_name: member.first_name,
      last_name: member.last_name,
      role: member.role,
      birth_date: member.birth_date || '',
      email: member.email || '',
      phone: member.phone || '',
      color: member.color,
      allergies: member.allergies || '',
      dietary_preferences: member.dietary_preferences || '',
      whatsapp_notifications: member.whatsapp_notifications,
    });
    setEditingMemberId(member.id);
    setShowMemberForm(true);
  };

  const handleSaveMember = async () => {
    if (editingMemberId) {
      await updateMember(editingMemberId, memberForm);
    } else {
      await addMember(memberForm);
    }
    setShowMemberForm(false);
    setEditingMemberId(null);
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const handleDeleteAccount = async () => {
    try {
      // Supprimer le compte Supabase (supprime aussi toutes les données via cascade)
      const { error } = await supabase.rpc('delete_user_account');

      if (error) throw error;

      // Déconnecter l'utilisateur
      await supabase.auth.signOut();

      // Recharger la page
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      alert('Erreur lors de la suppression du compte. Veuillez réessayer.');
    }
  };

  if (settingsLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={24} className="text-[#2563FF]" />
            <h2 className="text-[20px] font-semibold">Paramètres</h2>
          </div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Paramètres</h2>
        </div>
      </div>

      {/* Informations de la famille */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-semibold text-[#2B2B2B]">Informations générales</h3>
            {!editingSettings && (
              <button
                onClick={handleEditSettings}
                className="px-4 py-2 bg-[#2563FF] text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✏️ Modifier
              </button>
            )}
          </div>

          {editingSettings ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de famille
                </label>
                <input
                  type="text"
                  value={settingsForm.family_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, family_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse du domicile
                </label>
                <GooglePlacesAutocomplete
                  value={settingsForm.home_address}
                  onChange={(value) => setSettingsForm({ ...settingsForm, home_address: value })}
                  placeholder="Ex: 123 Rue de la Paix, Paris"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact d'urgence
                  </label>
                  <input
                    type="text"
                    value={settingsForm.emergency_contact_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, emergency_contact_name: e.target.value })}
                    placeholder="Nom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone urgence
                  </label>
                  <input
                    type="tel"
                    value={settingsForm.emergency_contact_phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, emergency_contact_phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                  />
                </div>
              </div>


              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✓ Enregistrer
                </button>
                <button
                  onClick={() => setEditingSettings(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-gray-700">
              <div>
                <span className="font-medium">Email du compte :</span> {user?.email || 'Non défini'}
              </div>
              <div>
                <span className="font-medium">Famille :</span> {settings?.family_name || 'Non défini'}
              </div>
              <div>
                <span className="font-medium">Adresse :</span> {settings?.home_address || 'Non définie'}
              </div>
              <div>
                <span className="font-medium">Contact d'urgence :</span>{' '}
                {settings?.emergency_contact_name || 'Non défini'}
                {settings?.emergency_contact_phone && ` - ${settings.emergency_contact_phone}`}
              </div>
            </div>
          )}
        </div>

        {/* Membres de la famille */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-semibold text-[#2B2B2B]">Membres de la famille</h3>
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-[#2563FF] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Ajouter un membre
            </button>
          </div>

          {/* Liste des membres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => {
              const age = calculateAge(member.birth_date);
              return (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  style={{ borderLeftWidth: '4px', borderLeftColor: member.color }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {member.first_name} {member.last_name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS]}
                        </span>
                      </div>
                      {age !== null && (
                        <div className="text-sm text-gray-600 mb-1">{age} ans</div>
                      )}
                      {member.email && (
                        <div className="text-sm text-gray-600 mb-1">📧 {member.email}</div>
                      )}
                      {member.phone && (
                        <div className="text-sm text-gray-600 mb-1">📱 {member.phone}</div>
                      )}
                      {member.allergies && (
                        <div className="text-sm text-red-600 mb-1">⚠️ Allergies: {member.allergies}</div>
                      )}
                      {member.dietary_preferences && (
                        <div className="text-sm text-green-600 mb-1">🍽️ {member.dietary_preferences}</div>
                      )}
                      {member.whatsapp_notifications && (
                        <div className="text-sm text-green-600">✓ Notifications WhatsApp activées</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer ${member.first_name} ?`)) {
                            deleteMember(member.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {members.length === 0 && (
            <p className="text-gray-500 italic text-center py-8">
              Aucun membre ajouté. Cliquez sur "Ajouter un membre" pour commencer.
            </p>
          )}
        </div>

        {/* Formulaire d'ajout/édition de membre */}
        {showMemberForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {editingMemberId ? 'Modifier le membre' : 'Ajouter un membre'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      value={memberForm.first_name}
                      onChange={(e) => setMemberForm({ ...memberForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      value={memberForm.last_name}
                      onChange={(e) => setMemberForm({ ...memberForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                    <select
                      value={memberForm.role}
                      onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                    >
                      <option value="papa">👨 Papa</option>
                      <option value="maman">👩 Maman</option>
                      <option value="enfant">👶 Enfant</option>
                      <option value="autre">👤 Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                    <input
                      type="date"
                      value={memberForm.birth_date}
                      onChange={(e) => setMemberForm({ ...memberForm, birth_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563FF] focus:border-transparent"
                    />
                  </div>
                </div>


                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="whatsapp"
                    checked={memberForm.whatsapp_notifications}
                    onChange={(e) => setMemberForm({ ...memberForm, whatsapp_notifications: e.target.checked })}
                    className="w-4 h-4 text-[#2563FF] border-gray-300 rounded focus:ring-[#2563FF]"
                  />
                  <label htmlFor="whatsapp" className="ml-2 text-sm text-gray-700">
                    Activer les notifications WhatsApp
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveMember}
                  disabled={!memberForm.first_name || !memberForm.last_name}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ✓ Enregistrer
                </button>
                <button
                  onClick={() => {
                    setShowMemberForm(false);
                    setEditingMemberId(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Zone dangereuse */}
      <div className="bg-white border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={20} className="text-red-600" />
          <h3 className="text-[16px] font-semibold text-red-600">Zone dangereuse</h3>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            La suppression de votre compte est définitive et irréversible.
            Toutes vos données seront définitivement supprimées.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <Trash2 size={18} />
            Supprimer définitivement mon compte
          </button>
        </div>
      </div>

      {/* Modal de confirmation suppression compte */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

export default memo(FamilySettings);
