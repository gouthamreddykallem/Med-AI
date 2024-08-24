# api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import os
from .models import Audio
from .serializers import AudioSerializer
from django.shortcuts import get_object_or_404
from bson import ObjectId
import speech_recognition as sr
from pydub import AudioSegment
import tempfile

class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "healthy"}, status=status.HTTP_200_OK)

class AudioView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        audio_file = request.FILES.get('audio')
        patient_name = request.data.get('patient_name', '')
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

        # Extract text from audio
        extracted_text = self.extract_text_from_audio(full_path)

        # Save file information to database
        audio = Audio.objects.create(
            filename=filename, 
            file_path=file_path, 
            patient_name=patient_name,
            extracted_text=extracted_text
        )
        serializer = AudioSerializer(audio, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        audios = Audio.objects.all()
        serializer = AudioSerializer(audios, many=True, context={'request': request})
        return Response(serializer.data)

    def extract_text_from_audio(self, audio_file_path):
        r = sr.Recognizer()
        
        # Convert audio to WAV format
        audio = AudioSegment.from_file(audio_file_path)
        with tempfile.NamedTemporaryFile(suffix=".wav") as temp_wav:
            audio.export(temp_wav.name, format="wav")
            
            with sr.AudioFile(temp_wav.name) as source:
                audio_data = r.record(source)
        
        try:
            text = r.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            return "Speech recognition could not understand the audio"
        except sr.RequestError as e:
            return f"Could not request results from speech recognition service; {e}"

class AudioDetailView(APIView):
    def get(self, request, id):
        audio = get_object_or_404(Audio, _id=ObjectId(id))
        serializer = AudioSerializer(audio, many=False, context={'request': request})
        return Response(serializer.data)