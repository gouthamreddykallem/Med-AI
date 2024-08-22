"use client"

// src/app/components/record/Record.tsx
import React, { useState, useEffect } from 'react';
import { useAudio } from '@/app/contexts/AudioContext';
import { SavedAudio } from '@/app/types/audio';
import apiService from '@/app/services/apiService';
import './Records.scss';

const Record: React.FC = () => {
  const { selectedAudioId } = useAudio();
  const [audioDetails, setAudioDetails] = useState<SavedAudio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioDetails = async () => {
      if (!selectedAudioId) {
        setError('No audio selected');
        setLoading(false);
        return;
      }

      try {
        const details = await apiService.fetchAudioDetails(selectedAudioId);
        setAudioDetails(details);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch audio details');
        setLoading(false);
      }
    };

    fetchAudioDetails();
  }, [selectedAudioId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!audioDetails) return <div>No audio details found</div>;

  return (
    <div className="main-container">
      <div className="details">
        <div className="history">
          <div className="chief_Complaint">
            <strong><h2>Chief Complaint</h2></strong>
            <h2>Copy All</h2>
          </div>
          <h3>History</h3>
          <p>{audioDetails.extracted_text || 'No extracted text available'}</p>
          <h3>Assessment & Plan</h3>
          <p>Not available in current data</p>
          <h3>Review of Systems</h3>
          <p>Not available in current data</p>
        </div>
        <div className="transcript">
          <button>Transcript</button><br />
          <button>Noteworthy</button>
          <p>{audioDetails.extracted_text || 'No transcript available'}</p>
        </div>
      </div>
      <audio controls className="audio" src={audioDetails.audio_url} />
    </div>
  );
};

export default Record;