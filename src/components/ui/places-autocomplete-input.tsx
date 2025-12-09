"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { loadMapsAPI } from '@/lib/maps-loader';

interface PlacesAutocompleteInputProps {
  value: string;
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PlacesAutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
  disabled
}: PlacesAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAutocomplete = async () => {
      try {
        await loadMapsAPI();
        
        if (!isMounted) return;
        
        setIsLoaded(true);

        if (inputRef.current && !autocompleteRef.current && isMounted) {
          // Initialize autocomplete
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['establishment', 'geocode'],
            fields: ['place_id', 'formatted_address', 'name', 'geometry'],
          });

          // Add place changed listener
          autocompleteRef.current.addListener('place_changed', () => {
            if (!isMounted) return;
            
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
              onChange(place.formatted_address, place);
            }
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading Maps Places API:', error);
        }
      }
    };

    if (!isLoaded) {
      initializeAutocomplete();
    }

    return () => {
      isMounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled || !isLoaded}
    />
  );
}