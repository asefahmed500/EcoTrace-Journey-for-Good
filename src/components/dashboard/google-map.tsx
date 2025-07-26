
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { Journey, CommunityImpactZone, EvChargingStation } from '@/lib/types';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  journeys: Journey[];
  impactZones: CommunityImpactZone[];
  chargingStations?: EvChargingStation[];
  onMapLoad: (map: google.maps.Map) => void;
  showJourneys: boolean;
  showHeatmap: boolean;
}

export function GoogleMap({ center, zoom, journeys, impactZones, chargingStations, onMapLoad, showJourneys, showHeatmap }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [google, setGoogle] = useState<typeof window.google | null>(null);
  const directionsRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
  const journeyMarkersRef = useRef<google.maps.Marker[]>([]);
  const impactZoneMarkersRef = useRef<google.maps.Marker[]>([]);
  const evChargerMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ["places", "routes", "marker", "visualization"],
    });

    loader.load().then((loadedGoogle) => {
      setGoogle(loadedGoogle);
      if (mapRef.current && !map) {
        const newMap = new loadedGoogle.maps.Map(mapRef.current, {
          center,
          zoom,
          mapId: 'ECO_TRACE_MAP',
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
            { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
          ]
        });
        setMap(newMap);
        onMapLoad(newMap);
        infoWindowRef.current = new loadedGoogle.maps.InfoWindow();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for journey polylines
  useEffect(() => {
    if (map && google) {
      // Clear previous renderers and markers
      directionsRenderersRef.current.forEach(renderer => renderer.setMap(null));
      directionsRenderersRef.current = [];
      journeyMarkersRef.current.forEach(marker => marker.setMap(null));
      journeyMarkersRef.current = [];

      if (showJourneys && journeys.length > 0) {
        const directionsService = new google.maps.DirectionsService();
        
        const getTravelMode = (mode: string): google.maps.TravelMode => {
            switch (mode.toLowerCase()) {
                case 'driving':
                    return google.maps.TravelMode.DRIVING;
                case 'public transit':
                    return google.maps.TravelMode.TRANSIT;
                case 'cycling':
                    return google.maps.TravelMode.BICYCLING;
                case 'walking':
                    return google.maps.TravelMode.WALKING;
                default:
                    return google.maps.TravelMode.DRIVING;
            }
        };

        journeys.forEach(journey => {
          const getPolylineColor = (emissions: number) => {
            if (emissions > 10) return '#F44336'; // Red for high emissions
            if (emissions > 2) return '#FF9800'; // Orange for medium
            return '#7EC4CF'; // Accent color for low
          }

          directionsService.route({
              origin: journey.origin,
              destination: journey.destination,
              travelMode: getTravelMode(journey.mode),
          }, (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                  const renderer = new google.maps.DirectionsRenderer({
                      map: map,
                      directions: result,
                      suppressMarkers: true, 
                      polylineOptions: {
                          strokeColor: getPolylineColor(journey.emissions),
                          strokeOpacity: 0.8,
                          strokeWeight: 6
                      }
                  });
                  directionsRenderersRef.current.push(renderer);

                  const leg = result.routes[0].legs[0];
                  
                  const startMarker = new google.maps.Marker({
                      position: leg.start_location,
                      map: map,
                      title: `Start: ${leg.start_address}`,
                      icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: '#7EC4CF', // Accent blue for start
                          fillOpacity: 1,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 2,
                      }
                  });
                  
                  const endMarker = new google.maps.Marker({
                      position: leg.end_location,
                      map: map,
                      title: `End: ${leg.end_address}`,
                      icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: '#3F704F', // Primary green for end
                          fillOpacity: 1,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 2,
                      }
                  });

                  const infoWindowContent = `
                    <div style="color: #333; max-width: 250px; font-family: sans-serif;">
                        <h4 style="font-weight: bold; margin: 0 0 8px 0;">Journey Details</h4>
                        <p style="margin: 0 0 4px 0;"><strong>From:</strong> ${journey.origin}</p>
                        <p style="margin: 0 0 4px 0;"><strong>To:</strong> ${journey.destination}</p>
                        <p style="margin: 0 0 4px 0;"><strong>Date:</strong> ${new Date(journey.date).toLocaleDateString()}</p>
                        <p style="margin: 0 0 4px 0;"><strong>Emissions:</strong> ${journey.emissions.toFixed(2)} kg CO2</p>
                        <p style="margin: 0;"><strong>Mode:</strong> <span style="text-transform: capitalize;">${journey.mode}</span></p>
                    </div>
                  `;

                  startMarker.addListener('click', () => {
                      if (infoWindowRef.current) {
                          infoWindowRef.current.setContent(infoWindowContent);
                          infoWindowRef.current.open(map, startMarker);
                      }
                  });
                  
                  endMarker.addListener('click', () => {
                      if (infoWindowRef.current) {
                          infoWindowRef.current.setContent(infoWindowContent);
                          infoWindowRef.current.open(map, endMarker);
                      }
                  });
                  
                  journeyMarkersRef.current.push(startMarker, endMarker);

              } else {
                  console.error(`Directions request failed due to ${status}`);
              }
          });
        });
      }
    }
  }, [map, google, journeys, showJourneys]);
  
  // Effect for heatmap
  useEffect(() => {
    if (map && google) {
        if (!heatmapRef.current) {
            heatmapRef.current = new google.maps.visualization.HeatmapLayer({
                radius: 30,
                opacity: 0.8,
            });
        }

        if (showHeatmap) {
            const heatmapData = journeys
                .filter(j => j.originCoords && j.destinationCoords)
                .flatMap(j => [
                    { location: new google.maps.LatLng(j.originCoords.lat, j.originCoords.lng), weight: j.emissions || 0.1 },
                    { location: new google.maps.LatLng(j.destinationCoords.lat, j.destinationCoords.lng), weight: j.emissions || 0.1 }
                ]);

            heatmapRef.current.setData(heatmapData);
            heatmapRef.current.setMap(map);
            const gradient = [
                "rgba(126, 196, 207, 0)", // accent color, transparent
                "rgba(126, 196, 207, 1)", // accent color
                "rgba(255, 152, 0, 1)", // orange
                "rgba(244, 67, 54, 1)", // red
            ];
            heatmapRef.current.set("gradient", gradient);
        } else {
            heatmapRef.current.setMap(null);
        }
    }
  }, [map, google, journeys, showHeatmap]);

  // Effect for impact zone markers
  useEffect(() => {
    if (map && google) {
        impactZoneMarkersRef.current.forEach(marker => marker.setMap(null));
        impactZoneMarkersRef.current = [];

        impactZones.forEach(zone => {
            const marker = new google.maps.Marker({
                position: { lat: zone.lat, lng: zone.lng },
                map: map,
                title: zone.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#FBC02D',
                    fillOpacity: 1,
                    strokeColor: '#000000',
                    strokeWeight: 1,
                },
            });

            marker.addListener('click', () => {
                if (infoWindowRef.current) {
                    const content = `
                        <div style="color: #333; max-width: 200px;">
                            <h3 style="font-weight: bold; margin-bottom: 4px;">${zone.name}</h3>
                            <p>${zone.reasoning}</p>
                        </div>
                    `;
                    infoWindowRef.current.setContent(content);
                    infoWindowRef.current.open(map, marker);
                }
            });
            impactZoneMarkersRef.current.push(marker);
        })
    }
  }, [map, google, impactZones]);

  // Effect for EV charger markers
  useEffect(() => {
    if (map && google) {
      evChargerMarkersRef.current.forEach(marker => marker.setMap(null));
      evChargerMarkersRef.current = [];

      if (chargingStations) {
        chargingStations.forEach(station => {
          const marker = new google.maps.Marker({
            position: station.location,
            map: map,
            title: station.name,
            icon: {
              path: 'M12 3L4 13h5v6h6v-6h5L12 3z', // Lightning bolt SVG path
              fillColor: '#4CAF50',
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#FFFFFF',
              scale: 1.2,
              anchor: new google.maps.Point(12, 12),
            }
          });

          marker.addListener('click', () => {
            if (infoWindowRef.current) {
              const isOpenText = station.isOpenNow === 'unknown'
                ? 'Status unknown'
                : station.isOpenNow
                ? '<span style="color: green;">Open now</span>'
                : '<span style="color: red;">Closed</span>';

              const content = `
                <div style="color: #333; max-width: 220px; font-family: sans-serif;">
                    <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 4px;">${station.name}</h3>
                    <p style="margin: 0 0 4px 0;">${station.vicinity}</p>
                    <p style="margin: 0;">${isOpenText}</p>
                </div>
              `;
              infoWindowRef.current.setContent(content);
              infoWindowRef.current.open(map, marker);
            }
          });
          evChargerMarkersRef.current.push(marker);
        });
      }
    }
  }, [map, google, chargingStations]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '0.375rem' }} />;
}
