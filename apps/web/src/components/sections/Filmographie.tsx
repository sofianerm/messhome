import { useState, useEffect } from 'react';
import { Star, Search, Trash2, X, Film as FilmIcon } from 'lucide-react';
import { useFilms } from '@/hooks/useFilms';

export default function Filmographie() {
  const { films, loading, error, addFilm, updateFilm, deleteFilm } = useFilms();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'tous' | 'a-voir' | 'en-cours' | 'vu'>('tous');

  // Recherche TMDB - Films ET Séries
  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const TMDB_API_KEY = import.meta.env.NEXT_PUBLIC_TMDB_API_KEY || 'eeda9345e618f3c2d084c19a97de07c3';
      console.log('TMDB API Key disponible:', !!TMDB_API_KEY);

      // Recherche multi (films + séries)
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=fr-FR`;
      console.log('Recherche TMDB (films + séries):', query);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Résultats TMDB:', data);

      if (data.results) {
        // Filtrer pour ne garder que films (movie) et séries (tv)
        const moviesAndTv = data.results.filter((item: any) =>
          item.media_type === 'movie' || item.media_type === 'tv'
        );
        setSearchResults(moviesAndTv);
      } else {
        console.error('Erreur API TMDB:', data);
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Erreur recherche:', err);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => searchMovies(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const ajouterFilm = async (item: any) => {
    try {
      // Différencier film (movie) et série (tv)
      const isTV = item.media_type === 'tv';
      const titre = isTV ? item.name : item.title;
      const releaseDate = isTV ? item.first_air_date : item.release_date;

      await addFilm({
        titre: titre,
        genre: isTV ? 'Série' : 'Non spécifié',
        annee: releaseDate ? new Date(releaseDate).getFullYear() : null,
        duree: null,
        note: 0,
        statut: 'a-voir',
        date_vue: null,
        commentaire: null,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
        tmdb_id: item.id,
        overview: item.overview || null,
      });
      setSearchTerm('');
      setSearchResults([]);
    } catch (err) {
      console.error('Failed to add film:', err);
    }
  };

  const modifierStatut = async (id: string, nouveauStatut: 'a-voir' | 'en-cours' | 'vu') => {
    try {
      await updateFilm(id, {
        statut: nouveauStatut,
        date_vue: nouveauStatut === 'vu' ? new Date().toISOString().split('T')[0] : null,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const modifierNote = async (id: string, note: number) => {
    try {
      await updateFilm(id, { note });
    } catch (err) {
      console.error('Failed to update rating:', err);
    }
  };

  const supprimerFilm = async (id: string) => {
    if (confirm('Supprimer ce film ?')) {
      try {
        await deleteFilm(id);
      } catch (err) {
        console.error('Failed to delete film:', err);
      }
    }
  };

  const renderStars = (note: number | null, filmId: string) => {
    const rating = note || 0;
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 cursor-pointer ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        onClick={() => modifierNote(filmId, i + 1)}
      />
    ));
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'vu': return 'bg-green-100 text-green-800';
      case 'a-voir': return 'bg-blue-100 text-blue-800';
      case 'en-cours': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'vu': return 'Vu';
      case 'a-voir': return 'À voir';
      case 'en-cours': return 'En cours';
      default: return statut;
    }
  };

  // Filtrage
  const filmsAffiches = filterStatus === 'tous'
    ? films
    : films.filter(film => film.statut === filterStatus);

  const availableSuggestions = searchResults.filter(
    movie => !films.some(film => film.tmdb_id === movie.id)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilmIcon size={24} className="text-[#2563FF]" />
            <h2 className="text-[20px] font-semibold">Filmographie</h2>
            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              🔥 LIVE Supabase
            </span>
          </div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilmIcon size={24} className="text-[#2563FF]" />
            <h2 className="text-[20px] font-semibold">Filmographie</h2>
          </div>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center">
          <p className="text-[13px] text-red-600 mb-2">❌ {error}</p>
          <p className="text-[12px] text-[#7A7A7A]">Une erreur est survenue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilmIcon size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Filmographie</h2>
          <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            🔥 LIVE Supabase
          </span>
        </div>
        <div className="text-[13px] text-[#7A7A7A]">
          {films.length} film{films.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un film ou une série sur TMDB..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* Résultats de recherche */}
        {searchTerm && (
          <div className="mt-4 max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-4 text-gray-500">Recherche en cours...</div>
            ) : (
              <div className="space-y-2">
                {availableSuggestions.length > 0 ? (
                  availableSuggestions.slice(0, 5).map((item) => {
                    const isTV = item.media_type === 'tv';
                    const titre = isTV ? item.name : item.title;
                    const releaseDate = isTV ? item.first_air_date : item.release_date;

                    return (
                      <div
                        key={item.id}
                        onClick={() => ajouterFilm(item)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-100 group"
                      >
                        {item.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                            alt={titre}
                            className="w-12 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                            <FilmIcon size={20} />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{titre}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isTV ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {isTV ? 'SÉRIE' : 'FILM'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
                          </div>
                        </div>
                        <div className="text-blue-600 group-hover:text-blue-700">
                          + Ajouter
                        </div>
                      </div>
                    );
                  })
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Aucun résultat
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    Tous les résultats trouvés sont déjà dans votre liste
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtres par statut */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filtrer par:</span>
          <div className="flex gap-2">
            {(['tous', 'a-voir', 'en-cours', 'vu'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'tous' ? 'Tous' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des films */}
      <div className="flex flex-wrap gap-4 justify-center">
        {filmsAffiches.length === 0 ? (
          <div className="bg-white border border-[#F1F1F1] rounded-xl p-8 text-center w-full">
            <FilmIcon size={48} className="text-[#C3C3C3] mx-auto mb-4" />
            <p className="text-[#9B9B9B]">
              {filterStatus === 'tous'
                ? 'Aucun film dans votre liste'
                : `Aucun film avec le statut "${getStatusLabel(filterStatus)}"`}
            </p>
            <p className="text-[11px] text-[#C3C3C3] mt-1">
              Utilisez la recherche ci-dessus pour ajouter des films !
            </p>
          </div>
        ) : (
          filmsAffiches.map((film) => (
            <div
              key={film.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition w-52"
            >
              <div className="relative">
                {film.poster ? (
                  <img
                    src={film.poster}
                    alt={film.titre}
                    className="w-full h-72 object-cover"
                  />
                ) : (
                  <div className="w-full h-72 bg-gray-200 flex items-center justify-center">
                    <FilmIcon size={48} className="text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => supprimerFilm(film.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-3 space-y-3" style={{width: '208px'}}>
                <div>
                  <h3 className="font-semibold text-sm line-clamp-2">{film.titre}</h3>
                  <p className="text-xs text-gray-500">{film.annee || 'N/A'}</p>
                </div>

                <div className="flex items-center gap-1">
                  {renderStars(film.note, film.id)}
                </div>

                <div className="flex gap-1">
                  {(['a-voir', 'en-cours', 'vu'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => modifierStatut(film.id, status)}
                      className={`flex-1 text-xs px-2 py-1 rounded ${
                        film.statut === status
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>

                {film.date_vue && (
                  <div className="text-xs text-gray-500">
                    Vu le {new Date(film.date_vue).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
