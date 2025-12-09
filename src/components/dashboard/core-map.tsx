"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Route, Leaf, AlertCircle, RefreshCw } from 'lucide-react';
import type { Journey } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FallbackMap } from './fallback-map';

interface CoreMapProps {
  journeys: Journey[];
}

// Default map center (San Francisco)
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
const DEFAULT_ZOOM = 10;

export function CoreMap({ journeys }: CoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load Google Maps API and initialize map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !isClient) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if Google Maps is already loaded
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
        createMap();
        return;
      }

      // Use the centralized maps loader
      const { loadMapsAPI } = await import('@/lib/maps-loader');
      const google = await loadMapsAPI();
      
      // Ensure the API is fully loaded before creating the map
      if (google && google.maps && google.maps.Map) {
        createMap();
      } else {
        throw new Error('Google Maps API failed to load properly');
      }

    } catch (err) {
      console.error('Map initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize map. Please check your internet connection and try again.');
      setIsLoading(false);
    }
  }, [isClient]);

  // Create the map instance
  const createMap = useCallback(() => {
    // Add retry count property to the function
    (createMap as any).retryCount = (createMap as any).retryCount || 0;
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.log('Google Maps not ready yet, retrying...');
      // Retry after a short delay with a maximum of 10 attempts
      if ((createMap as any).retryCount < 10) {
        (createMap as any).retryCount++;
        setTimeout(() => {
          if (window.google && window.google.maps) {
            createMap();
          }
        }, 200);
      } else {
        setError('Failed to load Google Maps after multiple attempts');
        setIsLoading(false);
      }
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeId: 'roadmap',
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      setIsLoading(false);
      setError(null);
      
      // Reset retry count on success
      (createMap as any).retryCount = 0;

      // Try to get user location
      getUserLocation(map);

    } catch (err) {
      console.error('Error creating map:', err);
      setError('Failed to create map');
      setIsLoading(false);
    }
  }, []);

  // Get user location and center map
  const getUserLocation = useCallback((map: google.maps.Map) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(userLocation);
          map.setZoom(12);
          
          // Add user location marker
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Your Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
            }
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          // Continue with default location
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        }
      );
    }
  }, []);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Add journey markers to map
  const addJourneyMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    clearMarkers();

    journeys.forEach((journey, index) => {
      if (!journey.originCoords || !journey.destinationCoords) return;

      const originCoords = {
        lat: journey.originCoords.lat,
        lng: journey.originCoords.lng
      };

      const destinationCoords = {
        lat: journey.destinationCoords.lat,
        lng: journey.destinationCoords.lng
      };

      // Origin marker
      const originMarker = new window.google.maps.Marker({
        position: originCoords,
        map: mapInstanceRef.current,
        title: `Journey ${index + 1} - Origin: ${journey.origin}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">S</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        }
      });

      // Destination marker
      const destinationMarker = new window.google.maps.Marker({
        position: destinationCoords,
        map: mapInstanceRef.current,
        title: `Journey ${index + 1} - Destination: ${journey.destination}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">E</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        }
      });

      // Info windows
      const originInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">Journey ${index + 1} - Start</h3>
            <p class="text-sm">${journey.origin}</p>
            <p class="text-xs text-gray-600">Mode: ${journey.mode}</p>
            <p class="text-xs text-gray-600">Emissions: ${journey.emissions.toFixed(2)} kg CO₂</p>
          </div>
        `
      });

      const destinationInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">Journey ${index + 1} - End</h3>
            <p class="text-sm">${journey.destination}</p>
            <p class="text-xs text-gray-600">Distance: ${journey.distance} km</p>
            <p class="text-xs text-gray-600">Distance: ${journey.distance.toFixed(1)} km</p>
          </div>
        `
      });

      originMarker.addListener('click', () => {
        originInfoWindow.open(mapInstanceRef.current, originMarker);
      });

      destinationMarker.addListener('click', () => {
        destinationInfoWindow.open(mapInstanceRef.current, destinationMarker);
      });

      // Draw route line
      const routePath = new window.google.maps.Polyline({
        path: [originCoords, destinationCoords],
        geodesic: true,
        strokeColor: getRouteColor(journey.mode),
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });

      routePath.setMap(mapInstanceRef.current);

      markersRef.current.push(originMarker, destinationMarker);
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      mapInstanceRef.current!.fitBounds(bounds);
    }
  }, [journeys, clearMarkers]);

  // Get route color based on transport mode
  const getRouteColor = (mode: string): string => {
    switch (mode.toLowerCase()) {
      case 'walking':
        return '#10B981'; // Green
      case 'cycling':
        return '#3B82F6'; // Blue
      case 'public_transport':
      case 'transit':
        return '#8B5CF6'; // Purple
      case 'driving':
      default:
        return '#EF4444'; // Red
    }
  };

  // Initialize map on mount
  useEffect(() => {
    if (isClient) {
      initializeMap();
    }
  }, [isClient, initializeMap]);

  // Update markers when journeys change
  useEffect(() => {
    if (mapInstanceRef.current && journeys.length > 0) {
      addJourneyMarkers();
    }
  }, [journeys, addJourneyMarkers]);

  // Retry function
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    initializeMap();
  };

  // Show fallback map if there's an error or if Google Maps fails to load
  if (error && !isLoading) {
    return <FallbackMap journeys={journeys} error={error} />;
  }

  if (!isClient) {
    return (
      <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="font-medium">Journey Map</span>
          {journeys.length > 0 && (
            <Badge variant="secondary">
              {journeys.length} journey{journeys.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {error && (
          <Button onClick={handleRetry} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="h-[400px] w-full rounded-lg border bg-muted"
          style={{ minHeight: '400px' }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Journey Summary */}
      {journeys.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {journeys.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Journeys</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {journeys.reduce((sum, j) => sum + j.emissions, 0).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {journeys.reduce((sum, j) => sum + (j.distance || 0), 0).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">km Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {journeys.filter(j => j.mode === 'walking' || j.mode === 'cycling').length}
            </div>
            <div className="text-xs text-muted-foreground">Eco-Friendly</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {journeys.length === 0 && !isLoading && !error && (
        <div className="text-center py-8">
          <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Journeys Yet</h3>
          <p className="text-muted-foreground text-sm">
            Start logging your journeys to see them visualized on the map.
          </p>
        </div>
      )}
    </div>
  );
}