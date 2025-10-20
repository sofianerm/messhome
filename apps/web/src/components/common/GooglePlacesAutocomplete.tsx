import { useEffect, useRef, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function PlacesAutocompleteInput({ value, onChange, placeholder, className }: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    // Initialiser l'autocomplete
    const autocompleteInstance = new placesLib.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['address'], // Seulement des adresses complètes
      componentRestrictions: { country: ['ch', 'fr'] }, // Limiter à Suisse et France
    });

    // Écouter les changements de place
    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
    });

    setAutocomplete(autocompleteInstance);

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [placesLib, onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

export default function GooglePlacesAutocomplete(props: GooglePlacesAutocompleteProps) {
  const apiKey = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyD481IBGxhmehhiFcP5BuuTpyzo23ytoAc';

  if (!apiKey) {
    // Fallback : input normal si pas d'API key
    return (
      <input
        type="text"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className={props.className}
      />
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <PlacesAutocompleteInput {...props} />
    </APIProvider>
  );
}
