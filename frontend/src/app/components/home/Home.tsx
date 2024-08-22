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

  const [savedAudios, setSavedAudios] = useState<SavedAudio[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const router = useRouter();
  const { setSelectedAudioId } = useAudio();

  const startRecording = async () => {
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

      mediaRecorderRef.current.start(100); // Start recording and fire ondataavailable every 100ms
      setRecorderState((prevState) => ({ ...prevState, isRecording: true }));
    } catch (error) {
      console.error('Error accessing microphone:', error);
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
        await apiService.saveAudio(audioBlob);
        fetchSavedAudios();
      } catch (error) {
        console.error('Error saving audio:', error);
      }
    }
  };

  const fetchSavedAudios = async () => {
    try {
      const audios = await apiService.fetchSavedAudios();
      setSavedAudios(audios);
    } catch (error) {
      console.error('Error fetching saved audios:', error);
    }
  };

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
        <button className="home__button" onClick={toggleRecording}>
          {recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <div className="home__saved-audios">
          <h3>Saved Recordings</h3>
          {savedAudios.length === 0 ? (
            <p>No saved recordings yet.</p>
          ) : (
            <ul>
              {savedAudios.map((audio) => (
                <li key={audio.id} className="home__saved-audio-item">
                  <button onClick={() => handleAudioSelect(audio.id)}>
                    <span>{audio.filename}</span>
                  </button>
                  <audio src={audio.audio_url} controls />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;