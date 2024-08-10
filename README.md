A nextJS based web front-end which records audio conversations between a doctor and a patient. Django as back-end and MongoDB for database.
1) Store the audio files 
2) Analyzes the files and extract the information
	a) A model to classify and differentiate doctor and patient
	b) A model to analyse and summerize the conversation
3) Store the extarcted information in database
4) Extract and show all the information related to that conversation on the web UI


# docker-compose up --build

This will build and start all the containers. You should be able to access:

Frontend: http://localhost:3000
Backend: http://localhost:8000
database UI console: http://localhost:8082/ 