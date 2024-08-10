# api/models.py
from django.db import models
from djongo.models.fields import ObjectIdField

class Audio(models.Model):
    _id = ObjectIdField()
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename