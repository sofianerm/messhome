import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer les tokens depuis l'URL (hash fragment)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (!accessToken) {
          throw new Error('Pas de token d\'accès reçu');
        }

        // Définir la session avec les tokens reçus
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) {
          throw sessionError;
        }

        if (!data.session) {
          throw new Error('Session non créée');
        }

        console.log('✅ Session établie avec succès');

        // Attendre un peu que Supabase finisse de stabiliser la session
        await new Promise(resolve => setTimeout(resolve, 500));

        // Rediriger vers la page d'accueil
        navigate('/', { replace: true });
      } catch (err) {
        console.error('❌ Erreur callback auth:', err);
        setError(err?.message || 'Erreur inconnue');

        // Rediriger vers l'accueil après 3 secondes
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">❌ Erreur d'authentification</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirection vers l'accueil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF] mx-auto mb-4"></div>
        <p className="text-[14px] text-[#7A7A7A]">Finalisation de la connexion...</p>
      </div>
    </div>
  );
}
