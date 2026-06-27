import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Persona } from '../types';
import { SYSTEM_PERSONAS } from '../constants';

interface AuthContextType {
  isLoggedIn: boolean;
  activePersona: Persona;
  allPersonas: Persona[];
  customPersonas: Persona[];
  login: (persona: Persona) => void;
  logout: () => void;
  registerPersona: (persona: Persona) => void;
  setActivePersona: (persona: Persona) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customPersonas, setCustomPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem('ticketswap_custom_personas');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('ticketswap_is_logged_in');
    return saved === 'true';
  });

  const [activePersona, setActivePersonaState] = useState<Persona>(() => {
    const saved = localStorage.getItem('ticketswap_active_persona');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return SYSTEM_PERSONAS[0];
  });

  const allPersonas = [...SYSTEM_PERSONAS, ...customPersonas];
  if (isLoggedIn && activePersona && !allPersonas.some(p => p.id === activePersona.id)) {
    allPersonas.push(activePersona);
  }

  const login = (persona: Persona) => {
    setActivePersonaState(persona);
    localStorage.setItem('ticketswap_active_persona', JSON.stringify(persona));
    setIsLoggedIn(true);
    localStorage.setItem('ticketswap_is_logged_in', 'true');

    const isSystem = SYSTEM_PERSONAS.some(p => p.id === persona.id);
    const isCustom = customPersonas.some(p => p.id === persona.id);
    if (!isSystem && !isCustom) {
      const updated = [...customPersonas, persona];
      setCustomPersonas(updated);
      localStorage.setItem('ticketswap_custom_personas', JSON.stringify(updated));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('ticketswap_is_logged_in');
    localStorage.removeItem('ticketswap_active_persona');
    setActivePersonaState(SYSTEM_PERSONAS[0]);
  };

  const registerPersona = (newPersona: Persona) => {
    const updated = [...customPersonas, newPersona];
    setCustomPersonas(updated);
    localStorage.setItem('ticketswap_custom_personas', JSON.stringify(updated));
  };

  const setActivePersona = (persona: Persona) => {
    setActivePersonaState(persona);
    localStorage.setItem('ticketswap_active_persona', JSON.stringify(persona));
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      activePersona,
      allPersonas,
      customPersonas,
      login,
      logout,
      registerPersona,
      setActivePersona
    }}>
      {children}
    </AuthContext.Provider>
  );
}
