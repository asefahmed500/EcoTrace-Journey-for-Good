"use client";

import React, { useEffect, useRef, useState } from 'react';
import { loadMapsAPI } from '@/lib/maps-loader';

interface SimpleGoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
}

export function SimpleGoogleMap({ center, zoom }: SimpleGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading Google Maps API...');
        const google = await loadMapsAPI();
        
        if (!isMounted) return;
        
        console.log('Google Maps API loaded successfully');
        
        if (mapRef.current && !map && isMounted) {
          console.log('Creating map instance...');
          const newMap = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          });
          
          console.log('Map created successfully');
          if (isMounted) {
            setMap(newMap);
            
            // Add a simple marker to test
            new google.maps.Marker({
              position: center,
              map: newMap,
              title: 'Test Marker'
            });
            
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error initializing map:', error);
          setError(error instanceof Error ? error.message : 'Failed to load map');
          setLoading(false);
        }
      }
    };

    // Only initialize if we don't have a map yet
    if (!map) {
      initializeMap();
    }
    
    return () => {
      isMounted = false;
    };
  }, [center, zoom, map]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200 rounded-lg">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <div className="text-gray-700 font-semibold mb-2">Interactive Map</div>
          <div className="text-gray-500 text-sm mb-4">Google Maps is temporarily unavailable</div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">
              <div className="mb-2">📍 Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</div>
              <div>🔍 Zoom Level: {zoom}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Map functionality will be restored once API access is available
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200 rounded-lg">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-700 font-semibold mb-2">Loading Interactive Map</div>
          <div className="text-gray-500 text-sm">Initializing Google Maps API...</div>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg border border-gray-200"
      style={{ minHeight: '400px' }}
    />
  );
}