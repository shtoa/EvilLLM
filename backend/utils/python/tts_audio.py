from pydub import AudioSegment
from gtts import gTTS
import argparse
from pydub import AudioSegment
from gtts import gTTS
import os


def text_to_wav(text, output_filename="output.wav"):
    tts = gTTS(text, lang='en')
    tts.save("temp.mp3")

    # Step 2: Convert MP3 to WAV
    audio = AudioSegment.from_mp3("temp.mp3")
    audio.export(output_filename, format="wav")
    
    os.remove("temp.mp3")
    print(f"WAV file saved as: {output_filename}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert text to speech and save as WAV")
    parser.add_argument("text", help="Text to convert to speech")
    parser.add_argument("--output", "-o", default="output.wav", help="Output WAV file name")
    
    args = parser.parse_args()
    text_to_wav(args.text, args.output)