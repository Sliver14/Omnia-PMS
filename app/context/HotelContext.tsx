"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface HotelContextType {
  hotelId: string | null;
  setHotelId: (id: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [hotelId, setHotelIdState] = useState<string | null>(null);

  useEffect(() => {
    const storedHotelId = localStorage.getItem('selectedHotelId');
    if (storedHotelId) {
      setHotelIdState(storedHotelId);
    }
  }, []);

  const setHotelId = (id: string) => {
    setHotelIdState(id);
    localStorage.setItem('selectedHotelId', id);
  };

  return (
    <HotelContext.Provider value={{ hotelId, setHotelId }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
