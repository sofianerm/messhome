import { useState, useEffect, memo } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Snowflake, CloudLightning } from 'lucide-react';

// Composant graphique météo interactif
function WeatherChart({ hourlyData }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Responsive chart dimensions - takes full width
  const chartWidth = 1200;
  const chartHeight = 400;
  const padding = 80;
  const innerWidth = chartWidth - 2 * padding;
  const innerHeight = chartHeight - 2 * padding;
  
  // Calcul des échelles
  const temperatures = hourlyData.map(h => h.temperature);
  const precipitations = hourlyData.map(h => h.precipitationProbability);
  const rainAmounts = hourlyData.map(h => h.rain);
  
  const minTemp = Math.min(...temperatures) - 2;
  const maxTemp = Math.max(...temperatures) + 2;
  const maxRain = Math.max(...rainAmounts, 1);
  
  // Fonctions de conversion coordonnées
  const getX = (index) => padding + (index * innerWidth) / (hourlyData.length - 1);
  const getTempY = (temp) => padding + innerHeight - ((temp - minTemp) / (maxTemp - minTemp)) * innerHeight;
  const getRainHeight = (rain) => (rain / maxRain) * innerHeight;
  const getPrecipY = (precip) => padding + innerHeight - (precip / 100) * innerHeight;
  
  // Génération des points pour les courbes
  const temperaturePath = hourlyData
    .map((data, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getTempY(data.temperature)}`)
    .join(' ');
    
  const precipitationPath = hourlyData
    .map((data, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getPrecipY(data.precipitationProbability)}`)
    .join(' ');

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculer la position relative dans le SVG en tenant compte du scaling
    const scaleX = rect.width / chartWidth;
    const actualX = x / scaleX;
    
    // Trouver le point le plus proche
    const closestIndex = Math.round((actualX - padding) * (hourlyData.length - 1) / innerWidth);
    if (closestIndex >= 0 && closestIndex < hourlyData.length) {
      setHoveredPoint(closestIndex);
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Format current time and next 24h time for display with better context
  const currentTime = new Date();
  const firstHour = hourlyData[0]?.time || currentTime;
  const lastHour = hourlyData[hourlyData.length - 1]?.time || new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
  
  const formatDateTime = (date) => {
    return `${date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })} ${date.getHours().toString().padStart(2, '0')}h${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-[#F1F1F1] rounded-xl p-0 w-full shadow-sm">
      {/* Header avec contexte temporel amélioré */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <h3 className="text-[20px] font-bold mb-3 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Droplets size={24} className="text-[#3B82F6]" />
          </div>
          Évolution météo - Prochaines 24 heures
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Maintenant:</span>
            <span>{formatDateTime(firstHour)}</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-medium">Dans 24h:</span>
            <span>{formatDateTime(lastHour)}</span>
          </div>
        </div>
      </div>
      
      <div className="relative w-full p-6 pt-4">
        <svg 
          width={chartWidth} 
          height={chartHeight}
          className="w-full h-auto rounded-lg bg-gradient-to-b from-blue-50 via-white to-blue-50 shadow-inner border border-blue-100"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ maxWidth: '100%', height: 'auto', minHeight: '400px' }}
        >
          {/* Grille horizontale */}
          {[0, 25, 50, 75, 100].map(value => (
            <g key={value}>
              <line
                x1={padding}
                y1={padding + innerHeight - (value / 100) * innerHeight}
                x2={chartWidth - padding}
                y2={padding + innerHeight - (value / 100) * innerHeight}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={padding + innerHeight - (value / 100) * innerHeight + 5}
                className="text-xs fill-gray-500"
                textAnchor="end"
              >
                {value}%
              </text>
            </g>
          ))}
          
          {/* Échelle température (droite) */}
          {[minTemp, Math.round((minTemp + maxTemp) / 2), maxTemp].map(temp => (
            <text
              key={temp}
              x={chartWidth - padding + 10}
              y={getTempY(temp) + 5}
              className="text-xs fill-gray-500"
            >
              {temp}°C
            </text>
          ))}
          
          {/* Barres de pluie */}
          {hourlyData.map((data, index) => (
            data.rain > 0 && (
              <rect
                key={`rain-${index}`}
                x={getX(index) - 8}
                y={padding + innerHeight - getRainHeight(data.rain)}
                width="16"
                height={getRainHeight(data.rain)}
                fill="#3B82F6"
                opacity="0.6"
              />
            )
          ))}
          
          {/* Courbe probabilité précipitations */}
          <path
            d={precipitationPath}
            stroke="#10B981"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Courbe température */}
          <path
            d={temperaturePath}
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Points température */}
          {hourlyData.map((data, index) => (
            <circle
              key={`temp-${index}`}
              cx={getX(index)}
              cy={getTempY(data.temperature)}
              r={hoveredPoint === index ? "6" : "4"}
              fill="#3B82F6"
              className="cursor-pointer"
            />
          ))}
          
          {/* Points précipitations */}
          {hourlyData.map((data, index) => (
            <circle
              key={`precip-${index}`}
              cx={getX(index)}
              cy={getPrecipY(data.precipitationProbability)}
              r="3"
              fill="#10B981"
            />
          ))}
          
          {/* Labels heures avec dates */}
          {hourlyData.map((data, index) => {
            const showLabel = index % 4 === 0; // Moins d'étiquettes pour éviter l'encombrement
            const isNewDay = index > 0 && data.day !== hourlyData[index - 1].day;
            
            return showLabel && (
              <g key={`hour-${index}`}>
                <text
                  x={getX(index)}
                  y={chartHeight - 25}
                  className="text-xs fill-gray-700 font-medium"
                  textAnchor="middle"
                >
                  {data.hour.toString().padStart(2, '0')}h
                </text>
                {isNewDay && (
                  <text
                    x={getX(index)}
                    y={chartHeight - 10}
                    className="text-xs fill-gray-500"
                    textAnchor="middle"
                  >
                    {data.time.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Tooltip amélioré */}
        {hoveredPoint !== null && (
          <div 
            className="fixed bg-gray-900 text-white p-4 rounded-xl shadow-xl text-sm z-50 pointer-events-none border border-gray-700"
            style={{
              left: mousePosition.x + 15,
              top: mousePosition.y - 15,
              transform: 'translateY(-100%)',
              minWidth: '160px'
            }}
          >
            <div className="font-semibold text-blue-200 mb-2">
              {hourlyData[hoveredPoint].time.toLocaleDateString('fr-FR', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })} {hourlyData[hoveredPoint].hour.toString().padStart(2, '0')}h
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-orange-400">🌡️</span>
                <span>{hourlyData[hoveredPoint].temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">💧</span>
                <span>{hourlyData[hoveredPoint].precipitationProbability}% de pluie</span>
              </div>
              {hourlyData[hoveredPoint].rain > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">🌧️</span>
                  <span>{hourlyData[hoveredPoint].rain}mm</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Légende moderne avec bordure supérieure */}
      <div className="border-t border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border">
            <div className="w-8 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Température (°C)</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border">
            <div className="w-8 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Probabilité pluie (%)</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border">
            <div className="w-8 h-3 bg-blue-500 opacity-60 rounded-sm"></div>
            <span className="text-sm font-medium text-gray-700">Intensité pluie (mm)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meteo() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Open-Meteo API (gratuit, sans clé)
  const GENEVA_COORDS = { lat: 46.2044, lon: 6.1432 };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Fonction pour convertir les codes météo WMO en descriptions françaises
  const getWeatherDescription = (wmoCode) => {
    const codes = {
      0: 'ensoleillé',
      1: 'principalement ensoleillé', 
      2: 'partiellement nuageux',
      3: 'nuageux',
      45: 'brouillard',
      48: 'brouillard givrant',
      51: 'bruine légère',
      53: 'bruine modérée',
      55: 'bruine dense',
      56: 'bruine verglaçante légère',
      57: 'bruine verglaçante dense',
      61: 'pluie légère',
      63: 'pluie modérée', 
      65: 'forte pluie',
      66: 'pluie verglaçante légère',
      67: 'pluie verglaçante forte',
      71: 'neige légère',
      73: 'neige modérée',
      75: 'forte neige',
      77: 'grains de neige',
      80: 'averses légères',
      81: 'averses modérées',
      82: 'fortes averses',
      85: 'averses de neige légères',
      86: 'fortes averses de neige',
      95: 'orage',
      96: 'orage avec grêle légère',
      99: 'orage avec forte grêle'
    };
    return codes[wmoCode] || 'conditions variables';
  };

  // Fonction pour convertir les codes WMO en codes simples
  const getSimpleWeatherCode = (wmoCode) => {
    if (wmoCode === 0 || wmoCode === 1) return 'Clear';
    if (wmoCode >= 2 && wmoCode <= 3) return 'Clouds';
    if (wmoCode >= 45 && wmoCode <= 48) return 'Fog';
    if (wmoCode >= 51 && wmoCode <= 67) return 'Rain';
    if (wmoCode >= 71 && wmoCode <= 86) return 'Snow';
    if (wmoCode >= 95 && wmoCode <= 99) return 'Thunderstorm';
    return 'Clouds';
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // API Open-Meteo pour Genève (données actuelles + journalières + horaires)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${GENEVA_COORDS.lat}&longitude=${GENEVA_COORDS.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,rain,precipitation_probability&timezone=Europe/Zurich&forecast_days=7`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();

      setCurrentWeather({
        city: 'Genève, Suisse',
        temperature: Math.round(data.current.temperature_2m),
        condition: getWeatherDescription(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        visibility: 10, // Open-Meteo ne fournit pas la visibilité
        feelsLike: Math.round(data.current.temperature_2m), // Approximation
        weatherCode: getSimpleWeatherCode(data.current.weather_code)
      });

      // Traitement des prévisions 7 jours
      const dailyForecast = data.daily.time.map((date, index) => {
        const dateObj = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        let dayName;
        if (dateObj.toDateString() === today.toDateString()) {
          dayName = 'Aujourd\'hui';
        } else if (dateObj.toDateString() === tomorrow.toDateString()) {
          dayName = 'Demain';
        } else {
          dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
        }
        
        return {
          day: dayName,
          temp: Math.round(data.daily.temperature_2m_max[index]),
          condition: getWeatherDescription(data.daily.weather_code[index]),
          weatherCode: getSimpleWeatherCode(data.daily.weather_code[index])
        };
      });

      setForecast(dailyForecast);

      // Traitement des données horaires (prochaines 24h à partir de maintenant)
      const now = new Date();
      const currentHour = now.getHours();
      
      const next24HoursData = data.hourly.time
        .map((time, index) => ({
          time: new Date(time),
          hour: new Date(time).getHours(),
          day: new Date(time).getDate(),
          temperature: Math.round(data.hourly.temperature_2m[index]),
          rain: data.hourly.rain[index],
          precipitationProbability: data.hourly.precipitation_probability[index]
        }))
        .filter(item => item.time >= now)
        .slice(0, 24); // Prendre les 24 prochaines heures

      setHourlyData(next24HoursData);
      setError(null);
    } catch (err) {
      console.error('Erreur météo:', err);
      setError(`Erreur lors du chargement des données météo: ${err.message}`);
      
      // Données de fallback pour Genève
      setCurrentWeather({
        city: 'Genève, Suisse (données de fallback)',
        temperature: 8,
        condition: 'nuageux',
        humidity: 72,
        wind: 15,
        visibility: 10,
        feelsLike: 6,
        weatherCode: 'Clouds'
      });

      setForecast([
        { day: 'Aujourd\'hui', temp: 8, condition: 'nuageux', weatherCode: 'Clouds' },
        { day: 'Demain', temp: 10, condition: 'partiellement nuageux', weatherCode: 'Clouds' },
        { day: 'Mercredi', temp: 12, condition: 'ensoleillé', weatherCode: 'Clear' },
        { day: 'Jeudi', temp: 9, condition: 'pluie légère', weatherCode: 'Rain' },
        { day: 'Vendredi', temp: 11, condition: 'nuageux', weatherCode: 'Clouds' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherCode, size = 24) => {
    switch (weatherCode) {
      case 'Clear':
        return <Sun size={size} className="text-[#F59E0B]" />;
      case 'Clouds':
        return <Cloud size={size} className="text-[#6B7280]" />;
      case 'Rain':
      case 'Drizzle':
        return <CloudRain size={size} className="text-[#3B82F6]" />;
      case 'Thunderstorm':
        return <CloudLightning size={size} className="text-[#7C3AED]" />;
      case 'Snow':
        return <Snowflake size={size} className="text-[#60A5FA]" />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <Cloud size={size} className="text-[#9CA3AF]" />;
      default:
        return <Sun size={size} className="text-[#F59E0B]" />;
    }
  };

  const getBackgroundGradient = (weatherCode) => {
    switch (weatherCode) {
      case 'Clear':
        return 'from-orange-400 to-yellow-400';
      case 'Rain':
      case 'Drizzle':
      case 'Thunderstorm':
        return 'from-blue-400 to-blue-600';
      case 'Snow':
        return 'from-blue-200 to-blue-400';
      case 'Clouds':
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  // Fonction pour créer les tranches horaires (4 tranches de 6h)
  const getHourlySlices = () => {
    if (!hourlyData.length) return [];
    
    const slices = [
      { label: '00h - 06h', hours: [0, 1, 2, 3, 4, 5], icon: '🌙' },
      { label: '06h - 12h', hours: [6, 7, 8, 9, 10, 11], icon: '🌅' },
      { label: '12h - 18h', hours: [12, 13, 14, 15, 16, 17], icon: '☀️' },
      { label: '18h - 00h', hours: [18, 19, 20, 21, 22, 23], icon: '🌇' }
    ];

    return slices.map(slice => {
      const sliceData = hourlyData.filter(h => slice.hours.includes(h.hour));
      
      if (!sliceData.length) return null;
      
      const avgTemp = Math.round(sliceData.reduce((sum, h) => sum + h.temperature, 0) / sliceData.length);
      const maxRain = Math.max(...sliceData.map(h => h.rain));
      const avgPrecipProb = Math.round(sliceData.reduce((sum, h) => sum + h.precipitationProbability, 0) / sliceData.length);
      
      return {
        ...slice,
        avgTemp,
        maxRain,
        avgPrecipProb,
        data: sliceData
      };
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Cloud size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Météo</h2>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF] mx-auto mb-4"></div>
          <p className="text-[14px] text-[#7A7A7A]">Chargement des données météo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Cloud size={24} className="text-[#2563FF]" />
          <h2 className="text-[20px] font-semibold">Météo</h2>
        </div>
        <div className="bg-white border border-[#F1F1F1] rounded-xl p-6 text-center">
          <p className="text-[14px] text-[#DC2626] mb-4">{error}</p>
          <button 
            onClick={fetchWeatherData}
            className="px-4 py-2 bg-[#2563FF] text-white text-[14px] rounded-lg hover:bg-[#1D4ED8]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!currentWeather) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Cloud size={24} className="text-[#2563FF]" />
        <h2 className="text-[20px] font-semibold">Météo</h2>
      </div>

      {/* Météo actuelle */}
      <div className={`bg-gradient-to-r ${getBackgroundGradient(currentWeather.weatherCode)} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[18px] font-semibold">{currentWeather.city}</h3>
            <p className="text-[14px] opacity-90">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {getWeatherIcon(currentWeather.weatherCode, 48)}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[36px] font-bold">{currentWeather.temperature}°C</div>
            <div className="text-[14px] opacity-90 capitalize">{currentWeather.condition}</div>
            <div className="text-[12px] opacity-80">Ressenti {currentWeather.feelsLike}°C</div>
          </div>
          
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 text-[13px]">
              <Droplets size={16} />
              <span>{currentWeather.humidity}% humidité</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <Wind size={16} />
              <span>{currentWeather.wind} km/h</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <Eye size={16} />
              <span>{currentWeather.visibility} km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prévisions 7 jours */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <h3 className="text-[16px] font-semibold mb-4">Prévisions 7 jours</h3>
        
        <div className="space-y-3">
          {forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {getWeatherIcon(day.weatherCode, 20)}
                <span className="text-[14px] font-medium text-[#2B2B2B] min-w-[80px]">
                  {day.day}
                </span>
                <span className="text-[13px] text-[#7A7A7A] flex-1 capitalize">
                  {day.condition}
                </span>
              </div>
              <div className="text-[16px] font-semibold text-[#2B2B2B]">
                {day.temp}°C
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique météo interactif */}
      {hourlyData.length > 0 && (
        <WeatherChart hourlyData={hourlyData} />
      )}

      {/* Conseils du jour */}
      <div className="bg-white border border-[#F1F1F1] rounded-xl p-6">
        <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
          <Thermometer size={16} className="text-[#F59E0B]" />
          Conseils du jour
        </h3>
        
        <div className="space-y-2 text-[13px]">
          {currentWeather.temperature > 25 && (
            <div className="flex items-center gap-2 text-[#F59E0B]">
              <Sun size={14} />
              <span>Il fait chaud ! Pensez à vous hydrater et à porter des vêtements légers.</span>
            </div>
          )}
          
          {currentWeather.temperature < 0 && (
            <div className="flex items-center gap-2 text-[#60A5FA]">
              <Snowflake size={14} />
              <span>Attention au gel ! Couvrez-vous bien et attention aux routes glissantes.</span>
            </div>
          )}
          
          {(currentWeather.weatherCode === 'Rain' || currentWeather.weatherCode === 'Drizzle') && (
            <div className="flex items-center gap-2 text-[#3B82F6]">
              <CloudRain size={14} />
              <span>N'oubliez pas votre parapluie ! Il va pleuvoir aujourd'hui.</span>
            </div>
          )}
          
          {currentWeather.weatherCode === 'Thunderstorm' && (
            <div className="flex items-center gap-2 text-[#7C3AED]">
              <CloudLightning size={14} />
              <span>Orages prévus ! Restez à l'abri et évitez les espaces ouverts.</span>
            </div>
          )}
          
          {currentWeather.weatherCode === 'Snow' && (
            <div className="flex items-center gap-2 text-[#60A5FA]">
              <Snowflake size={14} />
              <span>Chutes de neige prévues ! Attention aux routes et pensez aux vêtements chauds.</span>
            </div>
          )}
          
          {currentWeather.wind > 15 && (
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Wind size={14} />
              <span>Vent fort aujourd'hui, attention aux objets légers !</span>
            </div>
          )}
          
          {currentWeather.weatherCode === 'Clear' && currentWeather.temperature <= 25 && currentWeather.temperature > 0 && currentWeather.wind <= 15 && (
            <div className="flex items-center gap-2 text-[#10B981]">
              <Sun size={14} />
              <span>Parfait pour une promenade ! Le temps est idéal aujourd'hui.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Meteo);