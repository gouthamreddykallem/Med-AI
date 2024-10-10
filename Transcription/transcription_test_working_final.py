import whisper
from pyannote.audio import Pipeline
import warnings
import torch
import librosa
import soundfile as sf
import os

warnings.filterwarnings('ignore')


def round_time(time, precision=0.5):
    return round(time / precision) * precision


def assign_speakers(speaker_segments, transcription_segments, error_threshold=1.0):
    rounded_speaker_segments = [(round_time(start), round_time(end), speaker)
                                for start, end, speaker in speaker_segments]

    final_transcript = []
    for segment in transcription_segments:
        segment_start = segment['start']
        segment_end = segment['end']
        segment_text = segment['text']

        # Find overlapping speaker segments with error threshold
        overlapping_speakers = []
        for start, end, speaker in rounded_speaker_segments:
            if (start - error_threshold <= segment_end and
                    end + error_threshold >= segment_start):
                overlap = min(end, segment_end) - max(start, segment_start)
                if overlap > 0 or abs(start - segment_start) < error_threshold:
                    overlapping_speakers.append((speaker, overlap))

        # Assign the speaker with the most overlap, or the closest start time if no overlap
        if overlapping_speakers:
            speaker, _ = max(overlapping_speakers, key=lambda x: x[1])
        else:
            # If no overlap, find the closest speaker segment
            closest_speaker = min(rounded_speaker_segments,
                                  key=lambda x: min(abs(x[0] - segment_start), abs(x[1] - segment_end)))
            speaker = closest_speaker[2]

        final_transcript.append(f"{speaker}: {segment_text}")

    return final_transcript


audio_file = "me_anmol.mp3"

# Check if file exists
if not os.path.isfile(audio_file):
    raise FileNotFoundError(f"The file {audio_file} does not exist.")

# Load and resample audio
try:
    audio, sr = librosa.load(audio_file, sr=16000, mono=True)
    sf.write("temp_audio.wav", audio, sr, subtype='PCM_16')
    audio_file = "temp_audio.wav"
except Exception as e:
    print(f"Error loading audio file: {e}")
    exit(1)

# Whisper transcription
model = whisper.load_model("medium")
result = model.transcribe(audio_file)
transcription = result["text"]
print("Transcription:", result)

# Speaker diarization
pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization@2.1",
                                    use_auth_token="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")

# Ensure CUDA is available, otherwise use CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
pipeline = pipeline.to(device)

diarization = pipeline(audio_file, num_speakers=2)

# Extract speaker segments
speaker_segments = [(turn.start, turn.end, speaker) for turn, _, speaker in diarization.itertracks(yield_label=True)]

print("Speaker segments:", speaker_segments)

# Get transcription segments
segments = result["segments"]
print("Transcription segments:", segments)

# Assign speakers to transcribed text
final_transcript = assign_speakers(speaker_segments, segments, error_threshold=1.0)

# Print the final transcript
print("\nFinal Transcript:")
for line in final_transcript:
    print(line)

# Clean up temporary file
os.remove("temp_audio.wav")