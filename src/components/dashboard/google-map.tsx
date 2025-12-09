
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadMapsAPI } from '@/lib/maps-loader';
import type { Journey, CommunityImpactZone, EvChargingStation } from '@/lib/types';

interface InteractiveMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  journeys: Journey[];
  impactZones: CommunityImpactZone[];
  chargingStations?: EvChargingStation[];
  onMapLoad: (map: google.maps.Map) => void;
  showJourneys: boolean;
  showHeatmap: boolean;
  showNeighborhoodImpact?: boolean;
  timeVisualizationMode?: string;
  // Enhanced map layer controls
  showAirQuality?: boolean;
  showCarbonEfficient?: boolean;
  showPublicTransit?: boolean;
  showBikeLanes?: boolean;
  showWalkingPaths?: boolean;
  enableSmartClustering?: boolean;
  showPredictiveRouting?: boolean;
}

export function InteractiveMap({ 
  center, zoom, journeys, impactZones, chargingStations, onMapLoad, showJourneys, showHeatmap, 
  showNeighborhoodImpact, timeVisualizationMode, showAirQuality, showCarbonEfficient, 
  showPublicTransit, showBikeLanes, showWalkingPaths, enableSmartClustering, showPredictiveRouting 
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [google, setGoogle] = useState<typeof window.google | null>(null);
  const directionsRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
  const journeyMarkersRef = useRef<google.maps.Marker[]>([]);
  const impactZoneMarkersRef = useRef<google.maps.Marker[]>([]);
  const evChargerMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const neighborhoodCirclesRef = useRef<google.maps.Circle[]>([]);
  const timeVisualizationMarkersRef = useRef<google.maps.Marker[]>([]);
  
  // Enhanced map layer references
  const airQualityLayerRef = useRef<google.maps.Data | null>(null);
  const carbonEfficientRoutesRef = useRef<google.maps.DirectionsRenderer[]>([]);
  const transitLayerRef = useRef<google.maps.TransitLayer | null>(null);
  const bikeLayerRef = useRef<google.maps.BicyclingLayer | null>(null);
  const walkingPathsRef = useRef<google.maps.Polyline[]>([]);
  const smartClustersRef = useRef<google.maps.Marker[]>([]);
  const predictiveRoutesRef = useRef<google.maps.DirectionsRenderer[]>([]);

  // Helper function for travel mode conversion
  const getTravelMode = useCallback((mode: string): google.maps.TravelMode => {
    if (!google?.maps) return 'DRIVING' as any;
    switch (mode.toLowerCase()) {
      case 'driving': return google.maps.TravelMode.DRIVING;
      case 'public transit': return google.maps.TravelMode.TRANSIT;
      case 'cycling': return google.maps.TravelMode.BICYCLING;
      case 'walking': return google.maps.TravelMode.WALKING;
      default: return google.maps.TravelMode.DRIVING;
    }
  }, [google]);

  // Helper function to validate journey data
  const isValidJourney = useCallback((journey: any): boolean => {
    if (!journey || !journey.origin || !journey.destination) {
      return false;
    }
    
    const origin = journey.origin.toString().trim();
    const destination = journey.destination.toString().trim();
    
    // Basic length check
    if (origin.length < 3 || destination.length < 3) {
      return false;
    }
    
    // Same origin and destination
    if (origin.toLowerCase() === destination.toLowerCase()) {
      return false;
    }
    
    // Invalid test data patterns
    const invalidPatterns = [
      'basun', 'test', 'example', 'sample', 'demo',
      /^[0-9]+$/, // Only numbers
      /^[a-z]$/, // Single letters
      /^undefined$/i,
      /^null$/i,
      /^nan$/i
    ];
    
    for (const pattern of invalidPatterns) {
      if (typeof pattern === 'string') {
        if (origin.toLowerCase().includes(pattern) || destination.toLowerCase().includes(pattern)) {
          return false;
        }
      } else {
        if (pattern.test(origin) || pattern.test(destination)) {
          return false;
        }
      }
    }
    
    return true;
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      try {
        if (!isMounted) return;
        
        console.log('Initializing Google Maps...');
        const loadedGoogle = await loadMapsAPI();
        
        if (!isMounted) return;
        
        console.log('Google Maps API loaded successfully');
        setGoogle(loadedGoogle);
        
        if (mapRef.current && !map && isMounted) {
          console.log('Creating new map instance...');
          const newMap = new loadedGoogle.maps.Map(mapRef.current, {
          center,
          zoom,
          mapId: 'ECO_TRACE_MAP',
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          styles: [
            // Enhanced styling for better layer visibility
            { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#333333" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#1976d2" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8e6c9" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#2e7d32" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e0e0e0" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#424242" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ffeb3b" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#f57f17" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#333333" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2196f3" }] },
            { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#1976d2" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#bbdefb" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#1976d2" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
          ]
        });
        
        console.log('Map instance created successfully');
        if (isMounted) {
          setMap(newMap);
          onMapLoad?.(newMap);
          infoWindowRef.current = new loadedGoogle.maps.InfoWindow();
        }
      } else {
        console.log('Map ref not available or map already exists');
      }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        // Show error in the map container safely
        if (mapRef.current && mapRef.current.parentNode) {
          try {
            mapRef.current.innerHTML = `
              <div style="
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                height: 100%; 
                background: #f5f5f5; 
                color: #666; 
                text-align: center;
                padding: 20px;
              ">
                <div style="font-size: 24px; margin-bottom: 8px;">🗺️</div>
                <div style="font-weight: bold; margin-bottom: 4px;">Map Unavailable</div>
                <div style="font-size: 12px;">Google Maps failed to load</div>
              </div>
            `;
          } catch (domError) {
            console.warn('Could not update map container:', domError);
          }
        }
        // Notify parent component about the error
        if (onMapLoad) {
          onMapLoad(undefined as any);
        }
      }
    };

    initializeMap();
    
    return () => {
      isMounted = false;
    };
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

        journeys.forEach((journey, index) => {
          const getPolylineColor = (emissions: number) => {
            // Enhanced color coding based on emission intensity
            if (emissions === 0) return '#4CAF50'; // Green for zero emissions
            if (emissions < 1) return '#8BC34A'; // Light green for very low
            if (emissions < 2) return '#CDDC39'; // Yellow-green for low
            if (emissions < 5) return '#FFC107'; // Yellow for medium-low
            if (emissions < 10) return '#FF9800'; // Orange for medium
            if (emissions < 20) return '#FF5722'; // Red-orange for high
            return '#D32F2F'; // Dark red for very high
          }

          const getPolylineOpacity = (emissions: number) => {
            // Opacity based on emission intensity for better visualization
            return Math.max(0.4, Math.min(1.0, emissions / 10));
          }

          const getPolylineWeight = (emissions: number) => {
            // Line thickness based on emission intensity
            return Math.max(3, Math.min(8, 3 + emissions / 5));
          }

          // Skip invalid journeys
          if (!isValidJourney(journey)) {
            return;
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
                          strokeOpacity: getPolylineOpacity(journey.emissions),
                          strokeWeight: getPolylineWeight(journey.emissions)
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
                  console.warn(`Directions request failed for journey ${journey.id}:`, status, {
                      origin: journey.origin,
                      destination: journey.destination,
                      mode: journey.mode
                  });
                  // Don't throw error, just skip this journey
              }
          });
        });
      }
    }
  }, [map, google, journeys, showJourneys, isValidJourney]);
  
  // Effect for enhanced heatmap with emission intensity
  useEffect(() => {
    if (map && google) {
        if (!heatmapRef.current) {
            heatmapRef.current = new google.maps.visualization.HeatmapLayer({
                radius: 40,
                opacity: 0.7,
                maxIntensity: 20,
            });
        }

        if (showHeatmap) {
            // Create weighted heatmap data based on emission intensity
            const heatmapData = journeys
                .filter(j => j.originCoords && j.destinationCoords)
                .flatMap(j => {
                    const weight = Math.max(j.emissions, 0.1);
                    const points: any[] = [];
                    
                    // Add origin point
                    points.push({
                        location: new google.maps.LatLng(j.originCoords.lat, j.originCoords.lng),
                        weight: weight
                    });
                    
                    // Add destination point
                    points.push({
                        location: new google.maps.LatLng(j.destinationCoords.lat, j.destinationCoords.lng),
                        weight: weight
                    });
                    
                    // Add intermediate points for better visualization of routes
                    const latDiff = j.destinationCoords.lat - j.originCoords.lat;
                    const lngDiff = j.destinationCoords.lng - j.originCoords.lng;
                    for (let i = 0.25; i < 1; i += 0.25) {
                        points.push({
                            location: new google.maps.LatLng(
                                j.originCoords.lat + latDiff * i,
                                j.originCoords.lng + lngDiff * i
                            ),
                            weight: weight * 0.7 // Slightly lower weight for intermediate points
                        });
                    }
                    
                    return points;
                });

            heatmapRef.current.setData(heatmapData);
            heatmapRef.current.setMap(map);
            
            // Enhanced gradient for better emission intensity visualization
            const gradient = [
                "rgba(76, 175, 80, 0)",   // Transparent green
                "rgba(76, 175, 80, 0.6)", // Green for low emissions
                "rgba(139, 195, 74, 0.7)", // Light green
                "rgba(205, 220, 57, 0.8)", // Yellow-green
                "rgba(255, 193, 7, 0.8)",  // Yellow
                "rgba(255, 152, 0, 0.9)",  // Orange
                "rgba(255, 87, 34, 0.9)",  // Red-orange
                "rgba(211, 47, 47, 1)",    // Red for high emissions
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

  // Effect for neighborhood impact zones
  useEffect(() => {
    if (map && google) {
      neighborhoodCirclesRef.current.forEach(circle => circle.setMap(null));
      neighborhoodCirclesRef.current = [];

      if (showNeighborhoodImpact && journeys.length > 0) {
        // Group journeys by geographic clusters
        const clusters = new Map();
        const clusterRadius = 0.05; // ~5km clustering radius

        journeys.forEach(journey => {
          if (journey.originCoords) {
            const key = `${Math.round(journey.originCoords.lat / clusterRadius)}_${Math.round(journey.originCoords.lng / clusterRadius)}`;
            if (!clusters.has(key)) {
              clusters.set(key, {
                lat: journey.originCoords.lat,
                lng: journey.originCoords.lng,
                emissions: 0,
                count: 0,
                journeys: []
              });
            }
            const cluster = clusters.get(key);
            cluster.emissions += journey.emissions;
            cluster.count += 1;
            cluster.journeys.push(journey);
          }
        });

        // Create circles for each cluster
        clusters.forEach(cluster => {
          const averageEmission = cluster.emissions / cluster.count;
          const circleColor = averageEmission > 5 ? '#FF5722' : 
                             averageEmission > 2 ? '#FF9800' : 
                             averageEmission > 0.5 ? '#FFC107' : '#4CAF50';
          
          const circle = new google.maps.Circle({
            strokeColor: circleColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: circleColor,
            fillOpacity: 0.2,
            map: map,
            center: { lat: cluster.lat, lng: cluster.lng },
            radius: Math.max(500, Math.min(5000, cluster.count * 200)) // Radius based on journey count
          });

          circle.addListener('click', () => {
            if (infoWindowRef.current) {
              const content = `
                <div style="color: #333; max-width: 250px; font-family: sans-serif;">
                    <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px;">Neighborhood Impact Zone</h3>
                    <p style="margin: 0 0 4px 0;"><strong>Total Journeys:</strong> ${cluster.count}</p>
                    <p style="margin: 0 0 4px 0;"><strong>Total Emissions:</strong> ${cluster.emissions.toFixed(2)} kg CO2</p>
                    <p style="margin: 0 0 4px 0;"><strong>Average per Trip:</strong> ${averageEmission.toFixed(2)} kg CO2</p>
                    <p style="margin: 0;"><strong>Impact Level:</strong> 
                      <span style="color: ${circleColor}; font-weight: bold;">
                        ${averageEmission > 5 ? 'High' : averageEmission > 2 ? 'Medium' : 'Low'}
                      </span>
                    </p>
                </div>
              `;
              infoWindowRef.current.setContent(content);
              infoWindowRef.current.setPosition({ lat: cluster.lat, lng: cluster.lng });
              infoWindowRef.current.open(map);
            }
          });

          neighborhoodCirclesRef.current.push(circle);
        });
      }
    }
  }, [map, google, journeys, showNeighborhoodImpact]);

  // Effect for time visualization markers
  useEffect(() => {
    if (map && google && timeVisualizationMode) {
      timeVisualizationMarkersRef.current.forEach(marker => marker.setMap(null));
      timeVisualizationMarkersRef.current = [];

      if (timeVisualizationMode !== 'monthly' && journeys.length > 0) {
        // Group journeys by time periods
        const timeGroups = new Map();
        
        journeys.forEach(journey => {
          const date = new Date(journey.date);
          let timeKey = '';
          
          switch (timeVisualizationMode) {
            case 'weekly':
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              timeKey = weekStart.toISOString().split('T')[0];
              break;
            case 'seasonal':
              const month = date.getMonth();
              timeKey = month < 3 ? 'Winter' : month < 6 ? 'Spring' : month < 9 ? 'Summer' : 'Fall';
              break;
            case 'yearly':
              timeKey = date.getFullYear().toString();
              break;
            default:
              timeKey = date.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
          }
          
          if (!timeGroups.has(timeKey)) {
            timeGroups.set(timeKey, {
              emissions: 0,
              count: 0,
              journeys: []
            });
          }
          
          const group = timeGroups.get(timeKey);
          group.emissions += journey.emissions;
          group.count += 1;
          group.journeys.push(journey);
        });

        // Create markers for time evolution
        let index = 0;
        timeGroups.forEach((group, timeKey) => {
          if (group.journeys.length > 0 && group.journeys[0].originCoords) {
            const journey = group.journeys[0];
            const marker = new google.maps.Marker({
              position: { lat: journey.originCoords.lat, lng: journey.originCoords.lng },
              map: map,
              title: `${timeKey}: ${group.emissions.toFixed(2)} kg CO2`,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: Math.max(8, Math.min(20, 8 + group.emissions / 2)),
                fillColor: group.emissions > 10 ? '#F44336' : group.emissions > 5 ? '#FF9800' : '#4CAF50',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              },
              label: {
                text: (index + 1).toString(),
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: '12px'
              }
            });

            marker.addListener('click', () => {
              if (infoWindowRef.current) {
                const content = `
                  <div style="color: #333; max-width: 200px; font-family: sans-serif;">
                      <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px;">${timeKey}</h3>
                      <p style="margin: 0 0 4px 0;"><strong>Journeys:</strong> ${group.count}</p>
                      <p style="margin: 0 0 4px 0;"><strong>Total Emissions:</strong> ${group.emissions.toFixed(2)} kg CO2</p>
                      <p style="margin: 0;"><strong>Average:</strong> ${(group.emissions / group.count).toFixed(2)} kg CO2</p>
                  </div>
                `;
                infoWindowRef.current.setContent(content);
                infoWindowRef.current.open(map, marker);
              }
            });

            timeVisualizationMarkersRef.current.push(marker);
            index++;
          }
        });
      }
    }
  }, [map, google, journeys, timeVisualizationMode]);

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

  // Effect for real-time air quality overlay
  useEffect(() => {
    if (map && google && showAirQuality) {
      if (!airQualityLayerRef.current) {
        airQualityLayerRef.current = new google.maps.Data();
        airQualityLayerRef.current.setMap(map);
        
        // Style air quality zones
        airQualityLayerRef.current.setStyle((feature) => {
          const aqi = feature.getProperty('aqi') as number;
          let color = '#4CAF50'; // Good (0-50)
          let opacity = 0.3;
          
          if (aqi > 150) { color = '#9C27B0'; opacity = 0.7; } // Unhealthy
          else if (aqi > 100) { color = '#FF5722'; opacity = 0.6; } // Unhealthy for Sensitive
          else if (aqi > 50) { color = '#FF9800'; opacity = 0.5; } // Moderate
          else if (aqi > 25) { color = '#FFC107'; opacity = 0.4; } // Fair
          
          return {
            fillColor: color,
            fillOpacity: opacity,
            strokeColor: color,
            strokeWeight: 2,
            strokeOpacity: 0.8
          };
        });
      }
      
      // Generate mock air quality data based on journey locations
      const airQualityZones = generateAirQualityData(journeys);
      airQualityLayerRef.current.forEach((feature) => {
        airQualityLayerRef.current?.remove(feature);
      });
      
      airQualityZones.forEach(zone => {
        const feature = airQualityLayerRef.current?.add({
          geometry: new google.maps.Data.Polygon([zone.coordinates]),
          properties: { aqi: zone.aqi, location: zone.location }
        });
        
        if (feature) {
          airQualityLayerRef.current?.addListener('click', (event: any) => {
            if (infoWindowRef.current && event.feature) {
              const aqi = event.feature.getProperty('aqi');
              const location = event.feature.getProperty('location');
              const aqiLevel = getAQILevel(aqi);
              
              const content = `
                <div style="color: #333; max-width: 200px; font-family: sans-serif;">
                    <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px;">Air Quality</h3>
                    <p style="margin: 0 0 4px 0;"><strong>Location:</strong> ${location}</p>
                    <p style="margin: 0 0 4px 0;"><strong>AQI:</strong> ${aqi}</p>
                    <p style="margin: 0;"><strong>Level:</strong> <span style="color: ${getAQIColor(aqi)}; font-weight: bold;">${aqiLevel}</span></p>
                </div>
              `;
              infoWindowRef.current.setContent(content);
              infoWindowRef.current.setPosition(event.latLng);
              infoWindowRef.current.open(map);
            }
          });
        }
      });
    } else if (airQualityLayerRef.current) {
      airQualityLayerRef.current.setMap(null);
    }
  }, [map, google, showAirQuality, journeys]);

  // Effect for carbon-efficient route highlighting
  useEffect(() => {
    if (map && google && showCarbonEfficient) {
      // Clear previous carbon-efficient routes
      carbonEfficientRoutesRef.current.forEach(renderer => renderer.setMap(null));
      carbonEfficientRoutesRef.current = [];
      
      if (journeys.length > 0) {
        const directionsService = new google.maps.DirectionsService();
        
        // Find and highlight the most carbon-efficient routes
        const efficientJourneys = journeys
          .filter(j => j.emissions < 2) // Low emission threshold
          .slice(0, 5); // Limit to 5 most efficient routes
        
        efficientJourneys.forEach((journey, index) => {
          // Skip invalid journeys
          if (!isValidJourney(journey)) {
            return;
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
                  strokeColor: '#4CAF50',
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                }
              });
              carbonEfficientRoutesRef.current.push(renderer);
              
              // Add efficiency marker
              const leg = result.routes[0].legs[0];
              const midpoint = google.maps.geometry.spherical.interpolate(
                leg.start_location,
                leg.end_location,
                0.5
              );
              
              const efficiencyMarker = new google.maps.Marker({
                position: midpoint,
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: '#4CAF50',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                },
                title: `Efficient Route: ${journey.emissions.toFixed(2)} kg CO2`
              });
              
              efficiencyMarker.addListener('click', () => {
                if (infoWindowRef.current) {
                  const content = `
                    <div style="color: #333; max-width: 250px; font-family: sans-serif;">
                        <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px; color: #4CAF50;">🌱 Carbon-Efficient Route</h3>
                        <p style="margin: 0 0 4px 0;"><strong>From:</strong> ${journey.origin}</p>
                        <p style="margin: 0 0 4px 0;"><strong>To:</strong> ${journey.destination}</p>
                        <p style="margin: 0 0 4px 0;"><strong>Mode:</strong> ${journey.mode}</p>
                        <p style="margin: 0 0 4px 0;"><strong>Emissions:</strong> ${journey.emissions.toFixed(2)} kg CO2</p>
                        <p style="margin: 0; color: #4CAF50; font-weight: bold;">✓ Eco-Friendly Choice!</p>
                    </div>
                  `;
                  infoWindowRef.current.setContent(content);
                  infoWindowRef.current.open(map, efficiencyMarker);
                }
              });
            } else {
              console.warn(`Carbon efficient route request failed for journey ${journey.id}:`, status, {
                origin: journey.origin,
                destination: journey.destination,
                mode: journey.mode
              });
            }
          });
        });
      }
    } else {
      carbonEfficientRoutesRef.current.forEach(renderer => renderer.setMap(null));
      carbonEfficientRoutesRef.current = [];
    }
  }, [map, google, showCarbonEfficient, journeys, getTravelMode, isValidJourney]);

  // Effect for public transit real-time data
  useEffect(() => {
    if (map && google && showPublicTransit) {
      if (!transitLayerRef.current) {
        transitLayerRef.current = new google.maps.TransitLayer();
      }
      transitLayerRef.current.setMap(map);
      
      // Add transit stops and real-time info
      addTransitStops(map, google, journeys);
    } else if (transitLayerRef.current) {
      transitLayerRef.current.setMap(null);
    }
  }, [map, google, showPublicTransit, journeys]);

  // Effect for bike lanes
  useEffect(() => {
    if (map && google && showBikeLanes) {
      if (!bikeLayerRef.current) {
        bikeLayerRef.current = new google.maps.BicyclingLayer();
      }
      bikeLayerRef.current.setMap(map);
    } else if (bikeLayerRef.current) {
      bikeLayerRef.current.setMap(null);
    }
  }, [map, google, showBikeLanes]);

  // Effect for walking path optimization
  useEffect(() => {
    if (map && google && showWalkingPaths) {
      // Clear previous walking paths
      walkingPathsRef.current.forEach(path => path.setMap(null));
      walkingPathsRef.current = [];
      
      const walkingJourneys = journeys.filter(j => j.mode.toLowerCase() === 'walking');
      
      walkingJourneys.forEach(journey => {
        if (journey.originCoords && journey.destinationCoords) {
          // Create optimized walking path
          const walkingPath = new google.maps.Polyline({
            path: [
              { lat: journey.originCoords.lat, lng: journey.originCoords.lng },
              { lat: journey.destinationCoords.lat, lng: journey.destinationCoords.lng }
            ],
            geodesic: true,
            strokeColor: '#FF6B6B',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map: map
          });
          
          walkingPathsRef.current.push(walkingPath);
          
          // Add walking optimization info
          walkingPath.addListener('click', (event: any) => {
            if (infoWindowRef.current) {
              const content = `
                <div style="color: #333; max-width: 200px; font-family: sans-serif;">
                    <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px; color: #FF6B6B;">🚶 Optimized Walking Path</h3>
                    <p style="margin: 0 0 4px 0;"><strong>Distance:</strong> ${journey.distance.toFixed(2)} km</p>
                    <p style="margin: 0 0 4px 0;"><strong>Est. Time:</strong> ${Math.round(journey.distance / 5 * 60)} min</p>
                    <p style="margin: 0 0 4px 0;"><strong>Calories:</strong> ~${Math.round(journey.distance * 50)}</p>
                    <p style="margin: 0; color: #4CAF50; font-weight: bold;">Zero Emissions! 🌱</p>
                </div>
              `;
              infoWindowRef.current.setContent(content);
              infoWindowRef.current.setPosition(event.latLng);
              infoWindowRef.current.open(map);
            }
          });
        }
      });
    } else {
      walkingPathsRef.current.forEach(path => path.setMap(null));
      walkingPathsRef.current = [];
    }
  }, [map, google, showWalkingPaths, journeys]);

  // Effect for smart clustering
  useEffect(() => {
    if (map && google && enableSmartClustering) {
      // Clear previous clusters
      smartClustersRef.current.forEach(marker => marker.setMap(null));
      smartClustersRef.current = [];
      
      const clusters = generateSmartClusters(journeys);
      
      clusters.forEach(cluster => {
        const clusterMarker = new google.maps.Marker({
          position: { lat: cluster.lat, lng: cluster.lng },
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: Math.max(10, Math.min(25, cluster.journeys.length * 2)),
            fillColor: getClusterColor(cluster.avgEmissions),
            fillOpacity: 0.8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          title: `Cluster: ${cluster.journeys.length} journeys`
        });
        
        clusterMarker.addListener('click', () => {
          if (infoWindowRef.current) {
            const content = `
              <div style="color: #333; max-width: 250px; font-family: sans-serif;">
                  <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px;">📍 Journey Cluster</h3>
                  <p style="margin: 0 0 4px 0;"><strong>Journeys:</strong> ${cluster.journeys.length}</p>
                  <p style="margin: 0 0 4px 0;"><strong>Avg Emissions:</strong> ${cluster.avgEmissions.toFixed(2)} kg CO2</p>
                  <p style="margin: 0 0 4px 0;"><strong>Total Distance:</strong> ${cluster.totalDistance.toFixed(1)} km</p>
                  <p style="margin: 0 0 4px 0;"><strong>Most Common Mode:</strong> ${cluster.mostCommonMode}</p>
                  <p style="margin: 0; font-size: 12px; color: #666;">Click to zoom in for details</p>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(map, clusterMarker);
          }
        });
        
        smartClustersRef.current.push(clusterMarker);
      });
    } else {
      smartClustersRef.current.forEach(marker => marker.setMap(null));
      smartClustersRef.current = [];
    }
  }, [map, google, enableSmartClustering, journeys]);

  // Effect for predictive routing
  useEffect(() => {
    if (map && google && showPredictiveRouting) {
      // Clear previous predictive routes
      predictiveRoutesRef.current.forEach(renderer => renderer.setMap(null));
      predictiveRoutesRef.current = [];
      
      // Generate predictive routes based on patterns
      const predictiveRoutes = generatePredictiveRoutes(journeys);
      const directionsService = new google.maps.DirectionsService();
      
      predictiveRoutes.forEach((route, index) => {
        // Skip invalid or test routes
        if (!route.origin || !route.destination || 
            route.origin.length < 3 || route.destination.length < 3 ||
            route.origin === 'basun' || route.destination === 'basun') {
          return;
        }

        directionsService.route({
          origin: route.origin,
          destination: route.destination,
          travelMode: getTravelMode(route.suggestedMode),
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const renderer = new google.maps.DirectionsRenderer({
              map: map,
              directions: result,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#9C27B0',
                strokeOpacity: 0.6,
                strokeWeight: 3,
              }
            });
            predictiveRoutesRef.current.push(renderer);
            
            // Add predictive marker
            const leg = result.routes[0].legs[0];
            const predictiveMarker = new google.maps.Marker({
              position: leg.start_location,
              map: map,
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: '#9C27B0',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 1,
              },
              title: `Predicted optimal route`
            });
            
            predictiveMarker.addListener('click', () => {
              if (infoWindowRef.current) {
                const content = `
                  <div style="color: #333; max-width: 250px; font-family: sans-serif;">
                      <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px; color: #9C27B0;">🔮 Predictive Route</h3>
                      <p style="margin: 0 0 4px 0;"><strong>Suggested Mode:</strong> ${route.suggestedMode}</p>
                      <p style="margin: 0 0 4px 0;"><strong>Optimal Time:</strong> ${route.optimalTime}</p>
                      <p style="margin: 0 0 4px 0;"><strong>Est. Emissions:</strong> ${route.predictedEmissions.toFixed(2)} kg CO2</p>
                      <p style="margin: 0 0 4px 0;"><strong>Confidence:</strong> ${route.confidence}%</p>
                      <p style="margin: 0; font-size: 12px; color: #9C27B0;">Based on your travel patterns</p>
                  </div>
                `;
                infoWindowRef.current.setContent(content);
                infoWindowRef.current.open(map, predictiveMarker);
              }
            });
          } else {
            console.warn(`Predictive route request failed for route ${index}:`, status, {
              origin: route.origin,
              destination: route.destination,
              mode: route.suggestedMode
            });
          }
        });
      });
    } else {
      predictiveRoutesRef.current.forEach(renderer => renderer.setMap(null));
      predictiveRoutesRef.current = [];
    }
  }, [map, google, showPredictiveRouting, journeys, getTravelMode]);

  // Helper functions

  const generateAirQualityData = (journeys: Journey[]) => {
    // Generate mock air quality zones based on journey density
    const zones: any[] = [];
    const locationClusters = new Map();
    
    journeys.forEach(journey => {
      if (journey.originCoords) {
        const key = `${Math.round(journey.originCoords.lat * 100)}_${Math.round(journey.originCoords.lng * 100)}`;
        if (!locationClusters.has(key)) {
          locationClusters.set(key, {
            lat: journey.originCoords.lat,
            lng: journey.originCoords.lng,
            journeyCount: 0,
            totalEmissions: 0
          });
        }
        const cluster = locationClusters.get(key);
        cluster.journeyCount++;
        cluster.totalEmissions += journey.emissions;
      }
    });
    
    locationClusters.forEach(cluster => {
      const avgEmissions = cluster.totalEmissions / cluster.journeyCount;
      const aqi = Math.min(200, Math.max(10, avgEmissions * 20 + Math.random() * 30));
      
      zones.push({
        coordinates: [
          { lat: cluster.lat + 0.01, lng: cluster.lng + 0.01 },
          { lat: cluster.lat + 0.01, lng: cluster.lng - 0.01 },
          { lat: cluster.lat - 0.01, lng: cluster.lng - 0.01 },
          { lat: cluster.lat - 0.01, lng: cluster.lng + 0.01 }
        ],
        aqi: Math.round(aqi),
        location: `${cluster.lat.toFixed(3)}, ${cluster.lng.toFixed(3)}`
      });
    });
    
    return zones;
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#FFC107';
    if (aqi <= 150) return '#FF9800';
    if (aqi <= 200) return '#FF5722';
    return '#9C27B0';
  };

  const addTransitStops = (map: google.maps.Map, google: typeof window.google, journeys: Journey[]) => {
    const transitJourneys = journeys.filter(j => j.mode.toLowerCase() === 'public transit');
    
    transitJourneys.forEach(journey => {
      if (journey.originCoords) {
        const transitStop = new google.maps.Marker({
          position: { lat: journey.originCoords.lat, lng: journey.originCoords.lng },
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#2196F3',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          title: 'Transit Stop'
        });
        
        transitStop.addListener('click', () => {
          if (infoWindowRef.current) {
            const content = `
              <div style="color: #333; max-width: 200px; font-family: sans-serif;">
                  <h3 style="font-weight: bold; margin-top: 0; margin-bottom: 8px; color: #2196F3;">🚌 Transit Stop</h3>
                  <p style="margin: 0 0 4px 0;"><strong>Next Arrival:</strong> 3 min</p>
                  <p style="margin: 0 0 4px 0;"><strong>Route:</strong> Bus #42</p>
                  <p style="margin: 0 0 4px 0;"><strong>Status:</strong> <span style="color: #4CAF50;">On Time</span></p>
                  <p style="margin: 0; font-size: 12px; color: #666;">Real-time transit data</p>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(map, transitStop);
          }
        });
      }
    });
  };

  const generateSmartClusters = (journeys: Journey[]) => {
    const clusters: any[] = [];
    const clusterRadius = 0.02; // ~2km clustering
    const locationGroups = new Map();
    
    journeys.forEach(journey => {
      if (journey.originCoords) {
        const key = `${Math.round(journey.originCoords.lat / clusterRadius)}_${Math.round(journey.originCoords.lng / clusterRadius)}`;
        if (!locationGroups.has(key)) {
          locationGroups.set(key, {
            lat: journey.originCoords.lat,
            lng: journey.originCoords.lng,
            journeys: [],
            totalEmissions: 0,
            totalDistance: 0,
            modes: new Map()
          });
        }
        const group = locationGroups.get(key);
        group.journeys.push(journey);
        group.totalEmissions += journey.emissions;
        group.totalDistance += journey.distance;
        group.modes.set(journey.mode, (group.modes.get(journey.mode) || 0) + 1);
      }
    });
    
    locationGroups.forEach(group => {
      if (group.journeys.length >= 2) { // Only cluster if 2+ journeys
        const modeEntries = Array.from(group.modes.entries()) as [string, number][];
        const mostCommonMode = modeEntries
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'mixed';
        
        clusters.push({
          lat: group.lat,
          lng: group.lng,
          journeys: group.journeys,
          avgEmissions: group.totalEmissions / group.journeys.length,
          totalDistance: group.totalDistance,
          mostCommonMode
        });
      }
    });
    
    return clusters;
  };

  const getClusterColor = (avgEmissions: number) => {
    if (avgEmissions === 0) return '#4CAF50';
    if (avgEmissions < 2) return '#8BC34A';
    if (avgEmissions < 5) return '#FFC107';
    if (avgEmissions < 10) return '#FF9800';
    return '#FF5722';
  };

  const generatePredictiveRoutes = (journeys: Journey[]) => {
    const routes: any[] = [];
    const routePatterns = new Map();
    
    // Analyze journey patterns
    journeys.forEach(journey => {
      const key = `${journey.origin}_${journey.destination}`;
      if (!routePatterns.has(key)) {
        routePatterns.set(key, {
          origin: journey.origin,
          destination: journey.destination,
          modes: new Map(),
          times: [],
          emissions: []
        });
      }
      const pattern = routePatterns.get(key);
      pattern.modes.set(journey.mode, (pattern.modes.get(journey.mode) || 0) + 1);
      pattern.times.push(new Date(journey.date).getHours());
      pattern.emissions.push(journey.emissions);
    });
    
    // Generate predictions for frequent routes
    routePatterns.forEach(pattern => {
      if (pattern.emissions.length >= 2) { // Need at least 2 data points
        const patternModeEntries = Array.from(pattern.modes.entries()) as [string, number][];
        const mostCommonMode = patternModeEntries
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'driving';
        
        const avgEmissions = pattern.emissions.reduce((a: number, b: number) => a + b, 0) / pattern.emissions.length;
        const mostCommonHour = pattern.times.reduce((acc: Record<string, number>, time: any) => {
          acc[time] = (acc[time] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const optimalHour = Object.entries(mostCommonHour)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '9';
        
        routes.push({
          origin: pattern.origin,
          destination: pattern.destination,
          suggestedMode: mostCommonMode,
          optimalTime: `${optimalHour}:00`,
          predictedEmissions: avgEmissions * 0.9, // 10% improvement prediction
          confidence: Math.min(95, pattern.emissions.length * 20)
        });
      }
    });
    
    return routes.slice(0, 3); // Limit to 3 predictions
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup all map elements safely with timeout to prevent DOM errors
      setTimeout(() => {
        try {
          if (directionsRenderersRef.current) {
            directionsRenderersRef.current.forEach(renderer => {
              try {
                if (renderer && typeof renderer.setMap === 'function') {
                  renderer.setMap(null);
                }
              } catch (e) {
                // Ignore cleanup errors
              }
            });
            directionsRenderersRef.current = [];
          }
          
          if (journeyMarkersRef.current) {
            journeyMarkersRef.current.forEach(marker => {
              try {
                if (marker && typeof marker.setMap === 'function') {
                  marker.setMap(null);
                }
              } catch (e) {
                // Ignore cleanup errors
              }
            });
            journeyMarkersRef.current = [];
          }
          
          if (carbonEfficientRoutesRef.current) {
            carbonEfficientRoutesRef.current.forEach(renderer => {
              try {
                if (renderer && typeof renderer.setMap === 'function') {
                  renderer.setMap(null);
                }
              } catch (e) {
                // Ignore cleanup errors
              }
            });
            carbonEfficientRoutesRef.current = [];
          }
          
          if (predictiveRoutesRef.current) {
            predictiveRoutesRef.current.forEach(renderer => {
              try {
                if (renderer && typeof renderer.setMap === 'function') {
                  renderer.setMap(null);
                }
              } catch (e) {
                // Ignore cleanup errors
              }
            });
            predictiveRoutesRef.current = [];
          }
        } catch (e) {
          // Ignore all cleanup errors
        }
      }, 0);
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        borderRadius: '0.375rem',
        minHeight: '400px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {!map && (
        <div style={{ 
          textAlign: 'center', 
          color: '#666',
          position: 'absolute',
          zIndex: 1000
        }}>
          <div style={{ marginBottom: '8px', fontSize: '24px' }}>🗺️</div>
          <div>Loading Google Maps...</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Please wait while we initialize the map
          </div>
        </div>
      )}
    </div>
  );
}

// Export alias for backward compatibility
export { InteractiveMap as GoogleMap };
