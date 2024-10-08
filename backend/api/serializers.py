# api/serializers.py
from rest_framework import serializers
from django.conf import settings
from .models import Audio

class AudioSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='_id', read_only=True)
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = Audio
        fields = ['id', 'filename', 'file_path', 'extracted_text', 'created_at', 'audio_url', 'patient_name']

    def get_audio_url(self, obj):
        request = self.context.get('request')
        if obj.file_path and request is not None:
            return request.build_absolute_uri(settings.MEDIA_URL + obj.file_path)
        return None