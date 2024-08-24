import React, { useState, useRef, useEffect } from 'react';
import './Home.scss';
import { AudioRecorderState, SavedAudio } from '@/app/types/audio';
import Link from 'next/link';
import apiService from '@/app/services/apiService';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/app/contexts/AudioContext';

const Home: React.FC = () => {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    audioBlob: null,
    audioUrl: null,
  });

  const [patientName, setPatientName] = useState<string>('');
  const [savedAudios, setSavedAudios] = useState<SavedAudio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const router = useRouter();
  const { setSelectedAudioId } = useAudio();

  const startRecording = async () => {
    if (!patientName.trim()) {
      setError('Please enter a patient name before starting the recording.');
      return;
    }

    setError(null); // Clear any existing error message
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecorderState({
          isRecording: false,
          audioBlob,
          audioUrl,
        });
        saveAudio(audioBlob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start(100);
      setRecorderState((prevState) => ({ ...prevState, isRecording: true }));
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Failed to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recorderState.isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleRecording = () => {
    if (recorderState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const saveAudio = async (audioBlob: Blob) => {
    if (audioBlob) {
      try {
        await apiService.saveAudio(audioBlob, patientName);
        fetchSavedAudios();
      } catch (error) {
        console.error('Error saving audio:', error);
        setError('Failed to save audio. Please try again.');
      }
    }
  };

  const fetchSavedAudios = async () => {
    try {
      const audios = await apiService.fetchSavedAudios();
  
      // Map the fetched audios to include the patientName property
      const mappedAudios = audios.map((audio) => ({
        ...audio,
        patientName: 'N/A',  // Provide a default or placeholder value
      }));
  
      setSavedAudios(mappedAudios);
    } catch (error) {
      console.error('Error fetching saved audios:', error);
      setError('Failed to fetch saved recordings. Please try again.');
    }
  };;

  const handleAudioSelect = (id: string) => {
    setSelectedAudioId(id);
    router.push('/record');
  };

  useEffect(() => {
    fetchSavedAudios();
  }, []);

  return (
    <div className="home">
      <main className="home__main">
        <h2 className="home__title">Welcome to Medical AI Assistant</h2>
        <p className="home__description">
          This application helps record and analyze conversations between doctors and patients.
        </p>
        <div className="home__patient-name">
          <label>
            Patient Name:
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
            />
          </label>
        </div>
        <div className="home__recorder">
          <button 
            className={`home__record-button ${recorderState.isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
          >
            <span>{recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </button>
        </div>
        {error && <p className="home__error">{error}</p>}
        <div className="home__saved-audios">
          <h3>Saved Recordings</h3>
          {savedAudios.length === 0 ? (
            <p>No saved recordings yet.</p>
          ) : (
            <table className="home__recordings-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Created Date</th>
                  <th>Recording</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {savedAudios.map((audio) => (
                  <tr key={audio.id}>
                    <td>{audio.patient_name || 'N/A'}</td>
                    <td>{new Date(audio.created_at).toLocaleString()}</td>
                    <td>
                      <audio src={audio.audio_url} controls />
                    </td>
                    <td>
                      <button onClick={() => handleAudioSelect(audio.id)}>
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
