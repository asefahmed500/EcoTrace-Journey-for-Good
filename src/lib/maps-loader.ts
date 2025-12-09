import { Loader } from '@googlemaps/js-api-loader';

// Centralized Maps API loader to prevent conflicts and multiple requests
let loaderInstance: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;
let isLoading = false;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;
let isGoogleMapsLoaded = false;

export const getMapsLoader = () => {
  if (!loaderInstance) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.');
    }
    
    loaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: [
        'places', 
        'visualization', 
        'geometry'
      ],
      // Add retry configuration
      retries: 2,
    });
  }
  return loaderInstance;
};

export const loadMapsAPI = async (): Promise<typeof google> => {
  // Prevent multiple simultaneous loading attempts
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Return existing promise if available
  if (loadPromise) {
    return loadPromise;
  }

  // Check if already loaded
  if (typeof window !== 'undefined' && window.google?.maps && window.google.maps.Map) {
    return window.google;
  }

  // Prevent too many retry attempts
  if (loadAttempts >= MAX_LOAD_ATTEMPTS) {
    throw new Error('Google Maps API failed to load after multiple attempts. Please check your API key and network connection.');
  }

  isLoading = true;
  loadAttempts++;

  try {
    const loader = getMapsLoader();
    loadPromise = loader.load().then((google) => {
      isLoading = false;
      loadAttempts = 0; // Reset on success
      isGoogleMapsLoaded = true;
      console.log('Google Maps API loaded successfully');
      
      // Verify that the Map constructor is available
      if (!google.maps || !google.maps.Map) {
        throw new Error('Google Maps API loaded but Map constructor is not available');
      }
      
      return google;
    });
    
    return await loadPromise;
  } catch (error) {
    isLoading = false;
    loadPromise = null; // Reset promise on error to allow retry
    
    console.error('Failed to load Google Maps API:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      attempts: loadAttempts,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set'
    });
    
    throw new Error(`Google Maps API failed to load (attempt ${loadAttempts}/${MAX_LOAD_ATTEMPTS}): ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Reset function for testing or manual retry
export const resetMapsLoader = () => {
  loaderInstance = null;
  loadPromise = null;
  isLoading = false;
  loadAttempts = 0;
};