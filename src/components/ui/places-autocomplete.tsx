"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { loadMapsAPI } from '@/lib/maps-loader';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
  disabled
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAutocomplete = async () => {
      if (!inputRef.current || isLoaded || !isMounted) return;

      try {
        await loadMapsAPI();
        
        if (!isMounted) return;
        
        setIsLoaded(true);

        // Initialize autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['place_id', 'formatted_address', 'name', 'geometry'],
        });

        // Add place selection listener
        autocompleteRef.current.addListener('place_changed', () => {
          if (!isMounted) return;
          
          const place = autocompleteRef.current?.getPlace();
          if (place && place.formatted_address) {
            onChange(place.formatted_address);
            onPlaceSelect?.(place);
          }
        });

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
  }, [onChange, onPlaceSelect, isLoaded]);

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
      disabled={disabled}
      autoComplete="off"
    />
  );
}