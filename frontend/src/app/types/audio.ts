// src/types/audio.ts

export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export interface SavedAudio {
  id: string;  // This now corresponds to the _id field in MongoDB
  filename: string;
  file_path: string;
  audio_url: string;
  extracted_text?: string;
  created_at: string;
  patient_name:string;
}