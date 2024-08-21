import axios from 'axios';
import { SavedAudio } from '../types/audio';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const generateUniqueFileName = (extension: string = 'wav'): string => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const random = Math.random().toString(36).substring(2, 8);
  return `recording_${timestamp}_${random}.${extension}`;
};

const apiService = {
    saveAudio: async (audioBlob: Blob): Promise<SavedAudio> => {
        const formData = new FormData();
        const fileName = generateUniqueFileName();
        formData.append('audio', audioBlob, fileName);

        try {
            const response = await axios.post(`${API_URL}/api/audio/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error saving audio:', error);
            throw error;
        }
    },

    fetchSavedAudios: async (): Promise<SavedAudio[]> => {
        try {
            const response = await axios.get(`${API_URL}/api/audio/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching saved audios:', error);
            throw error;
        }
    },

    fetchAudioDetails: async (id: string): Promise<SavedAudio> => {
        try {
            const response = await axios.get(`${API_URL}/api/audio/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching audio details for id ${id}:`, error);
            throw error;
        }
    }
};

export default apiService;