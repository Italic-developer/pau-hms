"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  hostels: { value: string; label: string; hasCafe: boolean }[];
}

const Context = createContext<ContextProps | undefined>(undefined);

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const hostels = [
    { value: "amethyst", label: "Amethyst", hasCafe: true },
    { value: "faith", label: "Faith", hasCafe: false },
  ];
  return (
    <Context.Provider value={{ isAuthenticated, setIsAuthenticated, hostels }}>
      {children}
    </Context.Provider>
  );
};

const useCont = () => {
  const context: ContextProps | undefined = useContext(Context);
  if (!context) {
    throw new Error('useContext must be used within a ContextProvider');
  }
  return context;
};

export { ContextProvider, useCont };
