from django.db import models
from djongo.models.fields import ObjectIdField
from bson import ObjectId

class Audio(models.Model):
    _id = ObjectIdField(primary_key=True, default=ObjectId)
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    audio_url = models.CharField(max_length=255)
    extracted_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    patient_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.filename