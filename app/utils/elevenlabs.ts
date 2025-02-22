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

export async function generateSoundEffect(
  text: string,
  duration_seconds?: number,
  prompt_influence: number = 0.3
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ElevenLabs API key is not configured");
  }

  try {
    console.log("Generating sound effect:", {
      text,
      duration_seconds,
      prompt_influence,
    });

    const response = await axios.post(
      "https://api.elevenlabs.io/v1/sound-generation",
      {
        text,
        duration_seconds,
        prompt_influence,
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    if (!response.data) {
      throw new Error("No data received from sound effects API");
    }

    const uint8Array = new Uint8Array(response.data);
    const base64 = btoa(
      Array.from(uint8Array)
        .map((byte) => String.fromCharCode(byte))
        .join("")
    );

    console.log("Sound effect generated successfully");
    return base64;
  } catch (error) {
    console.error("Error generating sound effect:", {
      error,
      text,
      duration_seconds,
      prompt_influence,
    });
    throw error;
  }
}

export function base64ToAudio(base64String: string): HTMLAudioElement {
  const audio = new Audio();
  audio.src = `data:audio/mp3;base64,${base64String}`;
  return audio;
}
