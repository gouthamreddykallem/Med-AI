"use client"
// src/app/contexts/AudioContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AudioContextType {
  selectedAudioId: string | null;
  setSelectedAudioId: (id: string | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);

  return (
    <AudioContext.Provider value={{ selectedAudioId, setSelectedAudioId }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};