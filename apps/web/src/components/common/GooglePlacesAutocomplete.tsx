import { useEffect, useRef } from 'react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder,
  className
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyD481IBGxhmehhiFcP5BuuTpyzo23ytoAc';

    if (!apiKey || !inputRef.current) return;

    // Charger l'API Google Maps si pas déjà chargée
    const loadGoogleMaps = () => {
      return new Promise<void>((resolve) => {
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadGoogleMaps().then(() => {
      if (!inputRef.current) return;

      // Initialiser l'autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
        types: ['address'],
        componentRestrictions: { country: ['ch', 'fr'] },
      });

      // Écouter les changements
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
}
