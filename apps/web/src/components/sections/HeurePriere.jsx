import { useState, useEffect } from 'react';
import { Star, Sun, Sunset, Moon, Clock } from 'lucide-react';

export default function HeurePriere() {
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate] = useState(new Date());

  // API MasjidBox
  const API_KEY = import.meta.env.VITE_MASJIDBOX_API_KEY || '';
  const MASJID_SLUG = 'fondation-culturelle-islamique-de-geneve';

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      
      // Générer la date de début (aujourd'hui)  
      const today = new Date();
      const begin = encodeURIComponent(today.toISOString().split('T')[0] + 'T00:00:00.000+02:00');
      
      const response = await fetch(
        `https://api.masjidbox.com/1.0/masjidbox/landing/athany/${MASJID_SLUG}?get=at&days=7&begin=${begin}`,
        {
          headers: {
            'ApiKey': API_KEY
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Prayer API data:', data);
      setPrayerData(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des horaires de prière');
      console.error('Erreur API MasjidBox:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater l'heure (retirer les secondes et le timezone)
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '--:--';
    
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '--:--';
      
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Zurich' 
      });
    } catch (error) {
      console.error('Erreur formatage heure:', error, dateTimeString);
      return '--:--';
    }
  };

  // Obtenir les données du jour actuel
  const getTodayPrayerTimes = () => {
    if (!prayerData?.timetable || prayerData.timetable.length === 0) {
      return null;
    }
    
    const today = new Date().toISOString().split('T')[0];
    return prayerData.timetable.find(day => 
      day.date.split('T')[0] === today
    ) || prayerData.timetable[0];
  };

  const todayPrayers = getTodayPrayerTimes();
  console.log('Today prayers:', todayPrayers);

  const prayers = todayPrayers ? [
    { name: 'Fajr', nameAr: 'الفجر', time: formatTime(todayPrayers.fajr), iqamah: formatTime(todayPrayers.iqamah?.fajr), icon: Star, color: 'text-[#6366F1]' },
    { name: 'Lever du soleil', nameAr: 'الشروق', time: formatTime(todayPrayers.sunrise), icon: Sun, color: 'text-[#F59E0B]', isInfo: true },
    { name: 'Dhuhr', nameAr: 'الظهر', time: formatTime(todayPrayers.dhuhr), iqamah: formatTime(todayPrayers.iqamah?.dhuhr), icon: Sun, color: 'text-[#F59E0B]' },
    { name: 'Asr', nameAr: 'العصر', time: formatTime(todayPrayers.asr), iqamah: formatTime(todayPrayers.iqamah?.asr), icon: Sun, color: 'text-[#EA580C]' },
    { name: 'Maghrib', nameAr: 'المغرب', time: formatTime(todayPrayers.maghrib), iqamah: formatTime(todayPrayers.iqamah?.maghrib), icon: Sunset, color: 'text-[#DC2626]' },
    { name: 'Isha', nameAr: 'العشاء', time: formatTime(todayPrayers.isha), iqamah: formatTime(todayPrayers.iqamah?.isha), icon: Moon, color: 'text-[#1E40AF]' }
  ] : [];

  const getCurrentPrayer = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const prayerList = prayers.filter(p => !p.isInfo);
    
    for (let i = 0; i < prayerList.length; i++) {
      if (currentTime < prayerList[i].time) {
        return { 
          current: i > 0 ? prayerList[i - 1] : null,
          next: prayerList[i] 
        };
      }
    }
    
    return { 
      current: prayerList[prayerList.length - 1], 
      next: prayerList[0] 
    };
  };

  const getTimeUntilNext = (nextPrayerTime) => {
    const now = new Date();
    const [hours, minutes] = nextPrayerTime.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const diffMs = targetTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}min`;
    }
    return `${diffMins}min`;
  };

  const { current, next } = getCurrentPrayer();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Star size={24} className="text-[#2563FF]" />
        <h2 className="text-[20px] font-semibold">Heures de prière</h2>
      </div>


      {/* Prochaine prière - version compacte */}
      {next && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <next.icon size={20} className="text-white" />
              <div>
                <div className="text-[16px] font-bold">{next.name}</div>
                <div className="text-[12px] opacity-80">Dans {getTimeUntilNext(next.time)}</div>
              </div>
            </div>
            <div className="text-[24px] font-bold">{next.time}</div>
          </div>
        </div>
      )}

      {/* Toutes les heures de prière */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <h3 className="text-[16px] font-semibold mb-4">Heures du jour</h3>
        
        <div className="space-y-3">
          {prayers.map((prayer, index) => {
            const Icon = prayer.icon;
            const isCurrent = current && current.name === prayer.name;
            const isNext = next && next.name === prayer.name;
            
            return (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isNext 
                    ? 'border-[#2563FF] bg-blue-50' 
                    : isCurrent 
                      ? 'border-[#10B981] bg-green-50'
                      : 'border-[#E5E5E5] hover:bg-gray-50'
                } ${prayer.isInfo ? 'opacity-75' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={prayer.color} />
                  <div>
                    <div className={`text-[14px] font-medium ${
                      isNext ? 'text-[#2563FF]' : isCurrent ? 'text-[#10B981]' : 'text-[#2B2B2B]'
                    }`}>
                      {prayer.name}
                    </div>
                    <div className="text-[12px] text-[#7A7A7A]">{prayer.nameAr}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-[16px] font-semibold ${
                    isNext ? 'text-[#2563FF]' : isCurrent ? 'text-[#10B981]' : 'text-[#2B2B2B]'
                  }`}>
                    {prayer.time}
                  </div>
                  {prayer.iqamah && prayer.iqamah !== '--:--' && !prayer.isInfo && (
                    <div className="text-[11px] text-[#7A7A7A]">
                      Iqamah: {prayer.iqamah}
                    </div>
                  )}
                  {isNext && (
                    <div className="text-[11px] text-[#2563FF]">
                      Prochaine
                    </div>
                  )}
                  {isCurrent && !prayer.isInfo && (
                    <div className="text-[11px] text-[#10B981]">
                      En cours
                    </div>
                  )}
                  {prayer.isInfo && (
                    <div className="text-[11px] text-[#7A7A7A]">
                      Info
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}