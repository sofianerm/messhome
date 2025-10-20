import { useState } from 'react';
import { useFamilySettings } from '@/hooks/useFamilySettings';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import GooglePlacesAutocomplete from '@/components/common/GooglePlacesAutocomplete';

interface OnboardingStep {
  title: string;
  description: string;
  fields: string[];
}

const steps: OnboardingStep[] = [
  {
    title: "Bienvenue ! 👋",
    description: "Créons ensemble votre espace familial personnalisé",
    fields: []
  },
  {
    title: "Informations familiales",
    description: "Commençons par les informations de base",
    fields: ['family_name', 'home_address']
  },
  {
    title: "Contact d'urgence",
    description: "Pour votre sécurité et celle de votre famille",
    fields: ['emergency_contact_name', 'emergency_contact_phone']
  },
  {
    title: "Ajouter un membre",
    description: "Ajoutez un premier membre de la famille (optionnel)",
    fields: ['member_first_name', 'member_last_name', 'member_role', 'member_birth_date', 'member_email', 'member_phone']
  }
];

interface FamilyOnboardingProps {
  onComplete: () => void;
}

export default function FamilyOnboarding({ onComplete }: FamilyOnboardingProps) {
  const { updateSettings } = useFamilySettings();
  const { addMember } = useFamilyMembers();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    family_name: '',
    home_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [memberData, setMemberData] = useState({
    member_first_name: '',
    member_last_name: '',
    member_role: 'enfant' as 'papa' | 'maman' | 'enfant' | 'autre',
    member_birth_date: '',
    member_email: '',
    member_phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('member_')) {
      setMemberData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Dernière étape : sauvegarder et terminer
      setLoading(true);
      try {
        await updateSettings({
          ...formData,
          onboarding_completed: true
        });

        // Ajouter le membre si les champs sont remplis
        if (memberData.member_first_name.trim() && memberData.member_last_name.trim()) {
          await addMember({
            first_name: memberData.member_first_name,
            last_name: memberData.member_last_name,
            role: memberData.member_role,
            birth_date: memberData.member_birth_date || null,
            email: memberData.member_email || null,
            phone: memberData.member_phone || null,
            color: '#2563FF',
            allergies: null,
            dietary_preferences: null,
            whatsapp_notifications: false,
          });
        }

        // Recharger la page pour forcer la mise à jour du state
        window.location.reload();
      } catch (error) {
        console.error('Error saving settings:', error);
        setLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = async () => {
    // Marquer l'onboarding comme complété même si l'utilisateur passe
    try {
      await updateSettings({ onboarding_completed: true });
      // Recharger la page pour forcer la mise à jour du state
      window.location.reload();
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
    }
  };

  const step = steps[currentStep];
  const isWelcomeStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Vérifier si les champs requis sont remplis
  const canProceed = isWelcomeStep ||
    (currentStep === 1 && formData.family_name.trim() !== '') ||
    (currentStep === 2) || // Les contacts d'urgence sont optionnels
    (currentStep === 3); // Les membres sont optionnels

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{step.title}</h2>
          <p className="text-gray-600 mb-6">{step.description}</p>

          {isWelcomeStep ? (
            <div className="space-y-4 text-center py-8">
              <div className="text-6xl mb-4">🏡</div>
              <p className="text-lg text-gray-700">
                Votre tableau de bord familial centralisé pour :
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Gérer votre agenda familial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Organiser vos repas et courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Planifier vos voyages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Suivre vos films et loisirs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Et bien plus encore !</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              {step.fields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field === 'family_name' && 'Nom de votre famille *'}
                    {field === 'home_address' && 'Adresse du domicile'}
                    {field === 'emergency_contact_name' && 'Nom du contact d\'urgence'}
                    {field === 'emergency_contact_phone' && 'Téléphone du contact d\'urgence'}
                    {field === 'member_first_name' && 'Prénom'}
                    {field === 'member_last_name' && 'Nom de famille'}
                    {field === 'member_role' && 'Rôle'}
                    {field === 'member_birth_date' && 'Date de naissance'}
                    {field === 'member_email' && 'Email'}
                    {field === 'member_phone' && 'Téléphone'}
                  </label>
                  {field === 'home_address' ? (
                    <GooglePlacesAutocomplete
                      value={formData.home_address}
                      onChange={(value) => handleInputChange(field, value)}
                      placeholder="Ex: 123 Rue de la Paix, Paris"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  ) : field === 'member_role' ? (
                    <select
                      value={memberData.member_role}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      <option value="papa">👨 Papa</option>
                      <option value="maman">👩 Maman</option>
                      <option value="enfant">👶 Enfant</option>
                      <option value="autre">👤 Autre</option>
                    </select>
                  ) : (
                    <input
                      type={
                        field.includes('phone') ? 'tel' :
                        field === 'member_birth_date' ? 'date' :
                        field === 'member_email' ? 'email' :
                        'text'
                      }
                      value={
                        field.startsWith('member_')
                          ? memberData[field as keyof typeof memberData]
                          : formData[field as keyof typeof formData]
                      }
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder={
                        field === 'family_name' ? 'Ex: Famille Dupont' :
                        field === 'emergency_contact_name' ? 'Ex: Marie Dupont' :
                        field === 'emergency_contact_phone' ? 'Ex: +33 6 12 34 56 78' :
                        field === 'member_first_name' ? 'Ex: Jean' :
                        field === 'member_last_name' ? 'Ex: Dupont' :
                        field === 'member_email' ? 'Ex: jean@email.com' :
                        field === 'member_phone' ? 'Ex: +33 6 12 34 56 78' :
                        ''
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Retour
          </button>

          <button
            onClick={handleSkip}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
          >
            Passer
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className={`px-8 py-3 rounded-lg font-medium transition ${
              !canProceed || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Enregistrement...' : isLastStep ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
