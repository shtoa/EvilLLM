import argparse
import os
import whisper_timestamped as whisper;
import json;


def wav_to_text(audio_path, output_filename="parsed_audio.json"):
    audio = whisper.load_audio(audio_path);
    model = whisper.load_model("base");
    data = whisper.transcribe(model, audio, language="en");
    
    # Save transcription data to JSON file
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


    print(f"Output Parsed Data {output_filename}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert WAV to text timestamped")
    parser.add_argument("audio", help="Audio to convert to text")
    parser.add_argument("--output", "-o", default="parsed_audio.json", help="Output json file name")
    
    args = parser.parse_args()
    wav_to_text(args.audio, args.output)