import speech_recognition as sr
import pyttsx3

# Initialize the recognizer
r = sr.Recognizer()


# Function to convert text to speech
def SpeakText(command):
    # Initialize the engine
    engine = pyttsx3.init()
    engine.say(command)
    engine.runAndWait()


# List available microphones
print("Available Microphones:")
for index, name in enumerate(sr.Microphone.list_microphone_names()):
    print(f"{index}: {name}")

# Use the first available microphone or specify the index you want to use
mic_index = 0  # Change this if needed
with sr.Microphone(device_index=mic_index) as source2:
    # Adjusting for ambient noise if needed
    r.adjust_for_ambient_noise(source2, duration=0.2)

    while True:
        try:
            print("Start listening")
            audio2 = r.listen(source2, timeout=10.0, phrase_time_limit=5.0)
            print("Done listening")

            # Using Google to recognize audio
            MyText = r.recognize_google(audio2)
            MyText = MyText.lower()

            print(f"Did you say {MyText}")
            SpeakText(MyText)

        except sr.RequestError as e:
            print(f"Could not request results; {e}")

        except sr.UnknownValueError:
            print("unknown error occurred")
