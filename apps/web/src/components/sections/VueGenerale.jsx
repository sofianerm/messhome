import { useState, useEffect } from 'react';
import { LayoutGrid, Clock, Calendar, ShoppingCart, UtensilsCrossed, Star, Cloud, Car, Sun, Sunset, Moon, Train } from 'lucide-react';
import { useShoppingItems } from '@/hooks/useShoppingItems';
import { useMeals } from '@/hooks/useMeals';
import { useEvents } from '@/hooks/useEvents';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function VueGenerale() {
  // Hooks Supabase
  const { items: shoppingItems } = useShoppingItems();
  const { meals } = useMeals();
  const { events } = useEvents();

  // Données réelles des APIs
  const [weatherData, setWeatherData] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const [showEauxVives, setShowEauxVives] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);
  
  const fetchAllData = async () => {
    try {
      // Fetch weather, prayer times, and transport data in parallel
      // Note: Les APIs publiques (Open-Meteo, CFF) n'ont pas besoin de proxy
      // L'API MasjidBox utilise une clé, on pourrait aussi la sécuriser côté serveur
      const masjidBoxApiKey = import.meta.env.NEXT_PUBLIC_MASJIDBOX_API_KEY;

      const [weatherResponse, prayerResponse, transportResponse, transportEVResponse] = await Promise.all([
        // Weather API - Genève (API publique)
        fetch('https://api.open-meteo.com/v1/forecast?latitude=46.2044&longitude=6.1432&current=temperature_2m,weather_code&timezone=Europe/Zurich'),
        // Prayer times API - Genève (TODO: créer une route API proxy)
        fetch('https://api.masjidbox.com/1.0/masjidbox/landing/athany/fondation-culturelle-islamique-de-geneve?get=at&days=1&begin=' + encodeURIComponent(new Date().toISOString().split('T')[0] + 'T00:00:00.000+02:00'), {
          headers: { 'ApiKey': masjidBoxApiKey }
        }),
        // Transport API - Lancy-Bachet to Genève (API publique CFF)
        fetch('https://transport.opendata.ch/v1/connections?from=Lancy-Bachet&to=Genève&limit=1'),
        // Transport API - Lancy-Bachet to Genève-Eaux-Vives (API publique CFF)
        fetch('https://transport.opendata.ch/v1/connections?from=Lancy-Bachet&to=Genève-Eaux-Vives&limit=1')
      ]);
      
      // Process weather data
      if (weatherResponse.ok) {
        const weather = await weatherResponse.json();
        setWeatherData({
          temp: Math.round(weather.current.temperature_2m) + '°C',
          condition: getWeatherDescription(weather.current.weather_code),
          weatherCode: weather.current.weather_code
        });
      }
      
      // Process prayer data
      if (prayerResponse.ok) {
        const prayer = await prayerResponse.json();
        const today = prayer.timetable?.[0];
        if (today) {
          const nextPrayer = getNextPrayer(today);
          setPrayerData(nextPrayer);
        }
      }
      
      // Process transport data
      if (transportResponse.ok && transportEVResponse.ok) {
        const [transportGeneve, transportEV] = await Promise.all([
          transportResponse.json(),
          transportEVResponse.json()
        ]);
        
        setTransportData({
          geneve: transportGeneve.connections?.[0],
          eauxVives: transportEV.connections?.[0]
        });
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getWeatherDescription = (wmoCode) => {
    const codes = {
      0: 'ensoleillé', 1: 'principalement ensoleillé', 2: 'partiellement nuageux', 3: 'nuageux',
      45: 'brouillard', 48: 'brouillard givrant', 51: 'bruine légère', 53: 'bruine modérée',
      61: 'pluie légère', 63: 'pluie modérée', 65: 'forte pluie',
      71: 'neige légère', 73: 'neige modérée', 75: 'forte neige',
      80: 'averses légères', 81: 'averses modérées', 82: 'fortes averses',
      95: 'orage'
    };
    return codes[wmoCode] || 'conditions variables';
  };
  
  const getWeatherIcon = (weatherCode) => {
    if (!weatherCode) return Cloud;
    if (weatherCode <= 1) return Sun;
    if (weatherCode >= 61 && weatherCode <= 67) return Cloud;
    if (weatherCode >= 80 && weatherCode <= 82) return Cloud;
    return Cloud;
  };
  
  const getNextPrayer = (todayPrayers) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'Fajr', time: todayPrayers.fajr, icon: Star },
      { name: 'Dhuhr', time: todayPrayers.dhuhr, icon: Sun },
      { name: 'Asr', time: todayPrayers.asr, icon: Sun },
      { name: 'Maghrib', time: todayPrayers.maghrib, icon: Sunset },
      { name: 'Isha', time: todayPrayers.isha, icon: Moon }
    ];
    
    for (const prayer of prayers) {
      if (prayer.time) {
        const prayerDate = new Date(prayer.time);
        const prayerMinutes = prayerDate.getHours() * 60 + prayerDate.getMinutes();
        
        if (prayerMinutes > currentTime) {
          const diffMinutes = prayerMinutes - currentTime;
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          
          return {
            name: prayer.name,
            time: prayerDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            countdown: hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`,
            icon: prayer.icon
          };
        }
      }
    }
    
    // Si aucune prière restante aujourd'hui, retourner Fajr de demain
    return {
      name: 'Fajr',
      time: '05:30', // Approximation
      countdown: 'Demain',
      icon: Star
    };
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getTimeUntilDeparture = (departureTime) => {
    if (!departureTime) return '-- min';
    const now = new Date();
    const departure = new Date(departureTime);
    const diffMs = departure - now;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Maintenant';
    if (diffMins < 60) return `${diffMins} min`;
    return `${Math.floor(diffMins / 60)}h${diffMins % 60}`;
  };
  
  const handleTransportClick = () => {
    setShowEauxVives(!showEauxVives);
  };

  // Données par défaut si APIs ne répondent pas
  // Calculer les données dynamiques
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const todayMeals = meals.filter(m => m.date === todayStr);
  const tomorrowMeals = meals.filter(m => m.date === tomorrowStr);

  const todayLunch = todayMeals.find(m => m.meal_type === 'lunch')?.title || '';
  const todayDinner = todayMeals.find(m => m.meal_type === 'dinner')?.title || '';
  const tomorrowLunch = tomorrowMeals.find(m => m.meal_type === 'lunch')?.title || '';
  const tomorrowDinner = tomorrowMeals.find(m => m.meal_type === 'dinner')?.title || '';

  const todayMealDisplay = todayDinner || todayLunch || 'Aucun repas prévu';
  const tomorrowMealDisplay = tomorrowDinner || tomorrowLunch || 'Aucun repas prévu';

  // Trouver le prochain événement (aujourd'hui ou après)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(e => {
      const eventDate = parseISO(e.date);
      return eventDate >= todayStart;
    })
    .sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      // Si même date, trier par heure
      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });

  const nextEvent = upcomingEvents[0];
  const nextEventDisplay = nextEvent ? {
    title: nextEvent.title,
    time: nextEvent.time ? nextEvent.time.substring(0, 5) : 'Toute la journée', // Enlever les secondes
    date: isToday(parseISO(nextEvent.date)) ? "Aujourd'hui" :
          isTomorrow(parseISO(nextEvent.date)) ? 'Demain' :
          format(parseISO(nextEvent.date), 'EEEE d MMMM', { locale: fr })
  } : {
    title: 'Aucun événement à venir',
    time: '',
    date: ''
  };

  const widgetData = {
    weather: weatherData || { temp: '--°C', condition: 'Chargement...', weatherCode: null },
    courses: {
      total: shoppingItems.length,
      checked: shoppingItems.filter(i => i.checked).length
    },
    repas: {
      today: todayMealDisplay,
      tomorrow: tomorrowMealDisplay
    },
    nextPrayer: prayerData || { name: 'Chargement...', time: '--:--', countdown: '-- min', icon: Star },
    transport: {
      current: showEauxVives ? transportData?.eauxVives : transportData?.geneve,
      destination: showEauxVives ? 'Eaux-Vives' : 'Genève'
    },
    agenda: {
      nextEvent: nextEventDisplay.title,
      time: nextEventDisplay.time,
      date: nextEventDisplay.date
    },
    taches: { total: 6, completed: 2 } // Toujours statique (pas migré vers Supabase encore)
  };


  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header avec date et heure */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid size={24} className="text-[#2563FF]" />
          <div>
            <h2 className="text-[20px] font-semibold">Vue générale</h2>
            <p className="text-[13px] text-[#7A7A7A] capitalize">{getCurrentDate()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[24px] font-bold text-[#2563FF]">{getCurrentTime()}</div>
          <div className="text-[12px] text-[#7A7A7A]">Temps réel</div>
        </div>
      </div>

      {/* Widgets principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Widget Météo - données réelles */}
        <div className={`rounded-xl p-4 text-white ${
          widgetData.weather.weatherCode <= 1 
            ? 'bg-gradient-to-r from-orange-400 to-yellow-400' 
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            {widgetData.weather.weatherCode <= 1 ? <Sun size={20} /> : <Cloud size={20} />}
            <span className="text-[12px] opacity-90">Météo Genève</span>
          </div>
          <div className="text-[24px] font-bold">{widgetData.weather.temp}</div>
          <div className="text-[13px] opacity-90 capitalize">{widgetData.weather.condition}</div>
        </div>

        {/* Widget Courses */}
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart size={20} className="text-[#2563FF]" />
            <span className="text-[12px] text-[#7A7A7A]">Courses</span>
          </div>
          <div className="text-[20px] font-bold text-[#2B2B2B]">
            {widgetData.courses.checked}/{widgetData.courses.total}
          </div>
          <div className="text-[13px] text-[#7A7A7A]">Articles cochés</div>
        </div>

        {/* Widget Prochaine prière - données réelles */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Star size={20} />
            <span className="text-[12px] opacity-90">Prochaine prière</span>
          </div>
          <div className="text-[16px] font-bold">{widgetData.nextPrayer.name}</div>
          <div className="text-[14px] opacity-90">{widgetData.nextPrayer.time}</div>
          <div className="text-[11px] opacity-80">Dans {widgetData.nextPrayer.countdown}</div>
        </div>

        {/* Widget Repas */}
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <UtensilsCrossed size={20} className="text-[#F59E0B]" />
            <span className="text-[12px] text-[#7A7A7A]">Repas</span>
          </div>
          <div className="text-[14px] font-medium text-[#2B2B2B]">Ce soir</div>
          <div className="text-[13px] text-[#7A7A7A]">{widgetData.repas.today}</div>
        </div>

        {/* Widget Transport - données réelles, cliquable */}
        <div 
          className="bg-white border border-[#F1F1F1] rounded-xl p-4 cursor-pointer hover:border-[#2563FF] transition-colors" 
          onClick={handleTransportClick}
        >
          <div className="flex items-center justify-between mb-2">
            <Train size={20} className="text-[#10B981]" />
            <span className="text-[12px] text-[#7A7A7A]">Vers {widgetData.transport.destination}</span>
          </div>
          {widgetData.transport.current ? (
            <>
              <div className="text-[16px] font-bold text-[#2B2B2B]">
                {formatTime(widgetData.transport.current.from.departure)}
              </div>
              <div className="text-[13px] text-[#7A7A7A]">
                Lancy-Bachet → {widgetData.transport.destination}
              </div>
              <div className="text-[11px] text-[#10B981]">
                Dans {getTimeUntilDeparture(widgetData.transport.current.from.departure)}
              </div>
            </>
          ) : (
            <>
              <div className="text-[16px] font-bold text-[#2B2B2B]">--:--</div>
              <div className="text-[13px] text-[#7A7A7A]">Chargement...</div>
              <div className="text-[11px] text-[#7A7A7A]">-- min</div>
            </>
          )}
        </div>

        {/* Widget Agenda */}
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={20} className="text-[#8B5CF6]" />
            <span className="text-[12px] text-[#7A7A7A]">Agenda</span>
          </div>
          <div className="text-[14px] font-medium text-[#2B2B2B]">{widgetData.agenda.nextEvent}</div>
          <div className="text-[13px] text-[#7A7A7A]">{widgetData.agenda.date} à {widgetData.agenda.time}</div>
        </div>
      </div>
    </div>
  );
}