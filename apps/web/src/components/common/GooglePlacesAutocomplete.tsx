import { useEffect, useRef, useCallback } from 'react';

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

  // Initialiser la valeur au premier render
  useEffect(() => {
    if (inputRef.current && value) {
      inputRef.current.value = value;
    }
  }, []);

  // Mettre à jour la valeur quand elle change de l'extérieur (SANS Google)
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value && value !== '') {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    const apiKey = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

      // Écouter les sélections dans l'autocomplete
      const handlePlaceSelect = () => {
        const place = autocompleteRef.current?.getPlace();

        if (place?.formatted_address) {
          // Mettre à jour directement l'input
          if (inputRef.current) {
            inputRef.current.value = place.formatted_address;
          }

          // Appeler onChange pour mettre à jour le state parent
          onChange(place.formatted_address);
        } else if (place?.name) {
          // Fallback sur le name si pas de formatted_address
          if (inputRef.current) {
            inputRef.current.value = place.name;
          }
          onChange(place.name);
        }
      };

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;

    // Si la valeur dans l'input est différente du state, on met à jour
    // (utile si Google a rempli l'input sans déclencher place_changed)
    if (currentValue && currentValue !== value) {
      onChange(currentValue);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      onChange={handleManualInput}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
}
