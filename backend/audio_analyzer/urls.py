# audio_analyzer/urls.py
from django.contrib import admin
from django.urls import path
from api.views import AudioDetailView, HealthCheckView, AudioView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='health_check'),
    path('api/audio/', AudioView.as_view(), name='audio'),
    path('api/audio/<str:id>/', AudioDetailView.as_view(), name='audio_detail'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)