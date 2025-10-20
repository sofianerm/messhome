import { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText !== 'SUPPRIMER') return;

    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const isValid = confirmText === 'SUPPRIMER';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={28} />
            <h2 className="text-xl font-bold">Supprimer votre compte</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="hover:bg-red-700 p-1 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-800 font-semibold mb-2">
              ⚠️ Cette action est irréversible !
            </p>
            <p className="text-red-700 text-sm">
              Toutes vos données seront définitivement supprimées et ne pourront pas être récupérées.
            </p>
          </div>

          <div className="space-y-2 text-gray-700">
            <p className="font-medium">Les données suivantes seront supprimées :</p>
            <ul className="space-y-1 text-sm ml-4">
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Paramètres famille et membres</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Événements et agenda</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Tâches et listes de courses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Repas et planification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Voyages et packing lists</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Toutes les autres données</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pour confirmer, tapez <span className="font-mono bg-gray-100 px-2 py-1 rounded">SUPPRIMER</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || loading}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isValid && !loading
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Supprimer définitivement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
