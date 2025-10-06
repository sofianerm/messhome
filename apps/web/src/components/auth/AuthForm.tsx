import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function AuthForm() {
  const { signIn, signUp, signInWithGoogle, resetPassword, loading, error } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (mode === 'reset') {
      const result = await resetPassword(formData.email);
      if (result.success) {
        setMessage({ type: 'success', text: 'Email de réinitialisation envoyé !' });
        setMode('signin');
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur' });
      }
      return;
    }

    if (mode === 'signup') {
      const result = await signUp(formData.email, formData.password, formData.fullName);
      if (result.success) {
        setMessage({ type: 'success', text: 'Compte créé ! Vérifiez votre email.' });
        setMode('signin');
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur' });
      }
    } else {
      const result = await signIn(formData.email, formData.password);
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Erreur' });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      setMessage({ type: 'error', text: result.error || 'Erreur' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2563FF] rounded-2xl mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#2B2B2B] mb-2">
            Dashboard Familial
          </h1>
          <p className="text-[14px] text-[#7A7A7A]">
            {mode === 'signin' && 'Connectez-vous à votre compte'}
            {mode === 'signup' && 'Créez votre compte famille'}
            {mode === 'reset' && 'Réinitialisez votre mot de passe'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#F1F1F1] rounded-2xl p-8 shadow-xl">
          {/* Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-[13px] ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg text-[13px] bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B9B9B]" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full h-12 pl-11 pr-4 border border-[#E5E5E5] rounded-lg text-[14px] outline-none focus:border-[#2563FF] transition-colors"
                    placeholder="Famille Dupont"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B9B9B]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-12 pl-11 pr-4 border border-[#E5E5E5] rounded-lg text-[14px] outline-none focus:border-[#2563FF] transition-colors"
                  placeholder="famille@example.com"
                  required
                />
              </div>
            </div>

            {/* Password (not for reset) */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-[13px] font-medium text-[#5C5C5C] mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B9B9B]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full h-12 pl-11 pr-12 border border-[#E5E5E5] rounded-lg text-[14px] outline-none focus:border-[#2563FF] transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9B9B9B] hover:text-[#2B2B2B] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#2563FF] text-white text-[14px] font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </div>
              ) : (
                <>
                  {mode === 'signin' && 'Se connecter'}
                  {mode === 'signup' && 'Créer mon compte'}
                  {mode === 'reset' && 'Envoyer le lien'}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#E5E5E5]"></div>
                <span className="text-[12px] text-[#9B9B9B]">ou</span>
                <div className="flex-1 h-px bg-[#E5E5E5]"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 border-2 border-[#E5E5E5] text-[#2B2B2B] text-[14px] font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
              >
                <Chrome size={20} className="text-[#4285F4]" />
                Continuer avec Google
              </button>
            </>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-[13px] text-[#2563FF] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
                <div className="text-[13px] text-[#7A7A7A]">
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-[#2563FF] font-medium hover:underline"
                  >
                    S'inscrire
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div className="text-[13px] text-[#7A7A7A]">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[#2563FF] font-medium hover:underline"
                >
                  Se connecter
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[13px] text-[#2563FF] hover:underline"
              >
                ← Retour à la connexion
              </button>
            )}
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-[11px] text-[#9B9B9B] mt-6">
          En vous connectant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
}
