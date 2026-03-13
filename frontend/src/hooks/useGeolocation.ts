import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState<{lat: number; lng: number; acc: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada por su navegador');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return { location, error, loading, requestLocation };
}
