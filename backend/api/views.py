# api/views.py
from .models import Audio
from .serializers import AudioSerializer
import speech_recognition as sr
from pydub import AudioSegment
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "healthy"}, status=status.HTTP_200_OK)

class AudioView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'error': 'No audio file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Save the file
        filename = audio_file.name
        file_path = os.path.join('audios', filename)
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'wb+') as destination:
            for chunk in audio_file.chunks():
                destination.write(chunk)

        try:
            # Extract text from audio
            extracted_text = self.extract_text_from_audio(full_path)

            # Save file information to database
            audio = Audio.objects.create(filename=filename, file_path=file_path, extracted_text=extracted_text)
            serializer = AudioSerializer(audio, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error processing audio file: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, *args, **kwargs):
        audios = Audio.objects.all()
        serializer = AudioSerializer(audios, many=True, context={'request': request})
        return Response(serializer.data)

    def extract_text_from_audio(self, file_path):
        logger.info(f"Processing audio file: {file_path}")

        # Get the file extension
        _, ext = os.path.splitext(file_path)
        
        try:
            # Convert audio to WAV format if it's not already
            if ext.lower() != '.wav':
                logger.info(f"Converting {ext} to WAV")
                audio = AudioSegment.from_file(file_path)
                wav_path = file_path.rsplit('.', 1)[0] + '.wav'
                audio.export(wav_path, format="wav")
                logger.info(f"Converted file saved at: {wav_path}")
            else:
                wav_path = file_path

            # Perform speech recognition
            recognizer = sr.Recognizer()
            with sr.AudioFile(wav_path) as source:
                logger.info("Reading audio file")
                audio_data = recognizer.record(source)
                logger.info("Performing speech recognition")
                text = recognizer.recognize_google(audio_data)
                logger.info("Speech recognition completed")
                return text
        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand the audio")
            return "Speech recognition could not understand the audio"
        except sr.RequestError as e:
            logger.error(f"Could not request results from speech recognition service; {e}")
            return f"Could not request results from speech recognition service; {e}"
        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            raise ValueError(f"Error processing audio: {str(e)}")