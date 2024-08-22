"use client"

import React, { useEffect, useState } from 'react';
import apiService from '@/app/services/apiService';
import './Records.scss';
import { SavedAudio } from '@/app/types/audio';


const Record: React.FC<SavedAudio> = ({ id }) => {
  const [audioDetails, setAudioDetails] = useState<SavedAudio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioDetails = async () => {
      try {
        const details = await apiService.fetchAudioDetails(id);
        setAudioDetails(details);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch audio details');
        setLoading(false);
      }
    };

    fetchAudioDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!audioDetails) return <div>No audio details found</div>;

  return (
    <div className="main-container">
      <div className="details">
        <div className="history">
          <div className="chief_Complaint">
            <strong><h2>Chief Complaint</h2></strong>
            {/* <h1>Record ID: {id}</h1> */}
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
      
      {/* <div className="metadata">
        <p>Filename: {audioDetails.filename}</p>
        <p>Created at: {new Date(audioDetails.created_at).toLocaleString()}</p>
      </div> */}
    </div>
  );
};

export default Record;