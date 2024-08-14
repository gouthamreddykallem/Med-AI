# backend/Dockerfile
FROM python:3.9

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libasound-dev \
    portaudio19-dev \
    python3-pyaudio \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]