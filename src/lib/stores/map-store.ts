import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Journey } from '@/lib/types';

export interface RouteOption {
  id: string;
  mode: 'driving' | 'walking' | 'cycling' | 'transit';
  duration: string;
  distance: string;
  emissions: number;
  cost?: number;
  description: string;
  polyline?: string;
  steps?: google.maps.DirectionsStep[];
  bounds?: google.maps.LatLngBounds;
}

export interface MapState {
  // Map instance and loading
  mapInstance: google.maps.Map | null;
  isMapLoaded: boolean;
  mapError: string | null;
  
  // Location and routing
  userLocation: google.maps.LatLng | null;
  selectedOrigin: string;
  selectedDestination: string;
  originCoords: google.maps.LatLng | null;
  destinationCoords: google.maps.LatLng | null;
  
  // Routes and alternatives
  currentRoutes: RouteOption[];
  selectedRoute: RouteOption | null;
  isCalculatingRoutes: boolean;
  routeError: string | null;
  
  // Journey data
  journeys: Journey[];
  
  // Display options
  showJourneyPaths: boolean;
  showEmissionHeatmap: boolean;
  showAlternativeRoutes: boolean;
  showTrafficLayer: boolean;
  showTransitLayer: boolean;
  showBicyclingLayer: boolean;
  
  // UI state
  isLocationPermissionGranted: boolean;
  showRouteDetails: boolean;
  
  // Actions
  setMapInstance: (map: google.maps.Map | null) => void;
  setMapLoaded: (loaded: boolean) => void;
  setMapError: (error: string | null) => void;
  setUserLocation: (location: google.maps.LatLng | null) => void;
  setOrigin: (origin: string, coords?: google.maps.LatLng) => void;
  setDestination: (destination: string, coords?: google.maps.LatLng) => void;
  setCurrentRoutes: (routes: RouteOption[]) => void;
  setSelectedRoute: (route: RouteOption | null) => void;
  setCalculatingRoutes: (calculating: boolean) => void;
  setRouteError: (error: string | null) => void;
  setJourneys: (journeys: Journey[]) => void;
  toggleJourneyPaths: () => void;
  toggleEmissionHeatmap: () => void;
  toggleAlternativeRoutes: () => void;
  toggleTrafficLayer: () => void;
  toggleTransitLayer: () => void;
  toggleBicyclingLayer: () => void;
  setLocationPermission: (granted: boolean) => void;
  toggleRouteDetails: () => void;
  
  // Complex actions
  calculateRoutes: () => Promise<void>;
  centerMapOnUser: () => Promise<void>;
  clearRoutes: () => void;
  selectRouteAndDisplay: (route: RouteOption) => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    (set, get) => ({
      // Initial state
      mapInstance: null,
      isMapLoaded: false,
      mapError: null,
      userLocation: null,
      selectedOrigin: '',
      selectedDestination: '',
      originCoords: null,
      destinationCoords: null,
      currentRoutes: [],
      selectedRoute: null,
      isCalculatingRoutes: false,
      routeError: null,
      journeys: [],
      showJourneyPaths: true,
      showEmissionHeatmap: false,
      showAlternativeRoutes: true,
      showTrafficLayer: false,
      showTransitLayer: false,
      showBicyclingLayer: false,
      isLocationPermissionGranted: false,
      showRouteDetails: false,
      
      // Simple setters
      setMapInstance: (mapInstance) => set({ mapInstance }),
      setMapLoaded: (isMapLoaded) => set({ isMapLoaded }),
      setMapError: (mapError) => set({ mapError }),
      setUserLocation: (userLocation) => set({ userLocation }),
      setOrigin: (selectedOrigin, originCoords) => set({ selectedOrigin, originCoords }),
      setDestination: (selectedDestination, destinationCoords) => set({ selectedDestination, destinationCoords }),
      setCurrentRoutes: (currentRoutes) => set({ currentRoutes }),
      setSelectedRoute: (selectedRoute) => set({ selectedRoute }),
      setCalculatingRoutes: (isCalculatingRoutes) => set({ isCalculatingRoutes }),
      setRouteError: (routeError) => set({ routeError }),
      setJourneys: (journeys) => set({ journeys }),
      setLocationPermission: (isLocationPermissionGranted) => set({ isLocationPermissionGranted }),
      toggleRouteDetails: () => set((state) => ({ showRouteDetails: !state.showRouteDetails })),
      
      // Display toggles
      toggleJourneyPaths: () => set((state) => ({ showJourneyPaths: !state.showJourneyPaths })),
      toggleEmissionHeatmap: () => set((state) => ({ showEmissionHeatmap: !state.showEmissionHeatmap })),
      toggleAlternativeRoutes: () => set((state) => ({ showAlternativeRoutes: !state.showAlternativeRoutes })),
      toggleTrafficLayer: () => set((state) => ({ showTrafficLayer: !state.showTrafficLayer })),
      toggleTransitLayer: () => set((state) => ({ showTransitLayer: !state.showTransitLayer })),
      toggleBicyclingLayer: () => set((state) => ({ showBicyclingLayer: !state.showBicyclingLayer })),
      
      // Complex actions
      calculateRoutes: async () => {
        const state = get();
        if (!state.originCoords || !state.destinationCoords) {
          set({ routeError: 'Please select both origin and destination' });
          return;
        }
        
        set({ isCalculatingRoutes: true, routeError: null });
        
        try {
          const response = await fetch('/api/maps/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: {
                lat: state.originCoords.lat(),
                lng: state.originCoords.lng()
              },
              destination: {
                lat: state.destinationCoords.lat(),
                lng: state.destinationCoords.lng()
              },
              includeAlternatives: true
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to calculate routes');
          }
          
          const data = await response.json();
          set({ 
            currentRoutes: data.routes || [],
            selectedRoute: data.routes?.[0] || null
          });
          
        } catch (error) {
          set({ 
            routeError: error instanceof Error ? error.message : 'Failed to calculate routes',
            currentRoutes: [],
            selectedRoute: null
          });
        } finally {
          set({ isCalculatingRoutes: false });
        }
      },
      
      centerMapOnUser: async () => {
        const state = get();
        if (!state.mapInstance) return;
        
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
              });
            });
            
            const userLocation = new google.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );
            
            state.mapInstance.setCenter(userLocation);
            state.mapInstance.setZoom(14);
            
            set({ 
              userLocation,
              isLocationPermissionGranted: true,
              mapError: null
            });
            
          } catch (error) {
            set({ 
              mapError: 'Location access denied or unavailable',
              isLocationPermissionGranted: false
            });
          }
        }
      },
      
      clearRoutes: () => set({
        currentRoutes: [],
        selectedRoute: null,
        routeError: null
      }),
      
      selectRouteAndDisplay: (route) => {
        const state = get();
        set({ selectedRoute: route });
        
        // If map is available, fit bounds to show the route
        if (state.mapInstance && route.bounds) {
          state.mapInstance.fitBounds(route.bounds);
        }
      }
    }),
    {
      name: 'map-store'
    }
  )
);