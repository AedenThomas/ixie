import axios from "axios";

interface TextToSpeechResponse {
  audio_base64: string;
  normalized_alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
}

export async function generateSpeechWithTimestamps(
  text: string
): Promise<TextToSpeechResponse> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ElevenLabs API key is not configured");
  }

  const response = await axios.post(
    "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb/with-timestamps",
    {
      text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "json",
    }
  );

  return response.data;
}

export function base64ToAudio(base64String: string): HTMLAudioElement {
  const audio = new Audio();
  audio.src = `data:audio/mp3;base64,${base64String}`;
  return audio;
}
