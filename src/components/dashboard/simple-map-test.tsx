"use client";

import { useEffect, useRef, useState } from 'react';
import { loadMapsAPI } from '@/lib/maps-loader';

export function SimpleMapTest() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const initMap = async () => {
      try {
        setStatus('Loading Google Maps API...');
        const google = await loadMapsAPI();
        setStatus('API loaded, creating map...');
        
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 40.7128, lng: -74.0060 }, // New York
            zoom: 10,
          });
          setStatus('Map created successfully!');
          
          // Add a simple marker
          new google.maps.Marker({
            position: { lat: 40.7128, lng: -74.0060 },
            map: map,
            title: 'Test Marker'
          });
        }
      } catch (error) {
        console.error('Map initialization failed:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    initMap();
  }, []);

  return (
    <div style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}>
      <div style={{ padding: '10px', background: '#f0f0f0' }}>
        Status: {status}
      </div>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: 'calc(100% - 40px)',
          background: '#e0e0e0'
        }} 
      />
    </div>
  );
}