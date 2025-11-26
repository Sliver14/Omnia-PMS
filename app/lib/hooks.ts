// "use client";

// import { useHotel } from '../context/HotelContext';
// import { useState, useEffect, useCallback } from 'react';

// export function useApi<T>(url: string, options: RequestInit = {}) {
//   const { hotelId } = useHotel();
//   const [data, setData] = useState<T | null>(null);
//   const [error, setError] = useState<Error | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const fetchData = useCallback(async () => {
//     if (!hotelId) return;
//     setIsLoading(true);
//     try {
//       const headers = new Headers(options.headers);
//       headers.append('X-Hotel-ID', hotelId);

//       const response = await fetch(url, { ...options, headers });
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//       const result = await response.json();
//       setData(Array.isArray(result) ? result : []);
//     } catch (e) {
//       setError(e as Error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [url, hotelId]); // ✅ options removed


//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return { data, error, isLoading, refetch: fetchData };
// }

"use client";

import { useHotel } from '../context/HotelContext';
import { useState, useEffect, useCallback } from 'react';

export function useApi<T>(url: string, options: RequestInit = {}) {
  const { hotelId } = useHotel();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!hotelId) return;
    setIsLoading(true);
    try {
      const headers = new Headers(options.headers);
      headers.append('X-Hotel-ID', hotelId);

      const response = await fetch(url, { ...options, headers });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      // ✅ Type-safe handling:
      setData(result as T);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [url, hotelId, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}
