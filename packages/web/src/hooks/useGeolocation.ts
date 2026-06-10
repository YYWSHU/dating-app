import { useState, useCallback } from 'react';
import * as locationApi from '../api/location.api';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setState({ latitude, longitude, error: null, loading: false });

        // Sync to server
        try {
          await locationApi.updateLocation(latitude, longitude);
        } catch {
          // Silent fail - location will sync on next attempt
        }
      },
      (err) => {
        let errorMsg = 'Failed to get location';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Location permission denied';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Location unavailable';
            break;
          case err.TIMEOUT:
            errorMsg = 'Location request timed out';
            break;
        }
        setState((s) => ({ ...s, error: errorMsg, loading: false }));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // cache for 5 minutes
      }
    );
  }, []);

  return { ...state, requestLocation };
}
