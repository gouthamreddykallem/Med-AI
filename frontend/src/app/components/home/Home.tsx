import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Home.scss';
import { AudioRecorderState } from '@/app/types/audio';
import Header from '../header/Header';
import Footer from '../footer/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SavedAudio {
  id: string;
  filename: string;
  audio_url: string;
  extracted_text: string;
}

const Home: React.FC = () => {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    audioBlob: null,
    audioUrl: null,
  });

  const [savedAudios, setSavedAudios] = useState<SavedAudio[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
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

  const saveAudio = async () => {
    if (recorderState.audioBlob) {
      const formData = new FormData();
      formData.append('audio', recorderState.audioBlob, 'recording.wav');

      try {
        const response = await axios.post(`${API_URL}/api/audio/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Audio saved:', response.data);
        fetchSavedAudios();
      } catch (error) {
        console.error('Error saving audio:', error);
      }
    }
  };

  
  const fetchSavedAudios = async () => {
    try {
      console.log('Fetching from:', `${API_URL}/api/audio/`);
      const response = await axios.get(`${API_URL}/api/audio/`);
      console.log('Fetched audio files:', response.data);
      setSavedAudios(response.data);

    } catch (error) {
      console.error('Error fetching saved audios:', error);
    }
  };

  useEffect(() => {
    fetchSavedAudios();
  }, []);

  useEffect(() => {
    console.log('Updated savedAudios:', savedAudios);
  }, [savedAudios]);

  return (
    <div className="home">
      <Header />
      <main className="home__main">
        <h2 className="home__title">Welcome to Medical AI Assistant</h2>
        <p className="home__description">
          This application helps record and analyze conversations between doctors and patients.
        </p>
        <button className="home__button" onClick={toggleRecording}>
          {recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {recorderState.audioUrl && (
          <div className="home__audio-player">
            <audio src={recorderState.audioUrl} controls />
            <button className="home__button" onClick={saveAudio}>Save Recording</button>
          </div>
        )}
        <div className="home__saved-audios">
          <h3>Saved Recordings</h3>
          {savedAudios.length === 0 ? (
            <p>No saved recordings yet.</p>
          ) : (
            <ul>
              {savedAudios.map((audio) => (
                <li key={audio.id} className="home__saved-audio-item">
                  <span>{audio.filename}</span>
                  <audio src={audio.audio_url} controls />
                  <div className="home__extracted-text">
                    <h4>Extracted Text:</h4>
                    <p>{audio.extracted_text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;