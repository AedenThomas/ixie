import { fal } from "@fal-ai/client";
import {
  generateSpeechWithTimestamps,
  generateSoundEffect,
} from "./elevenlabs";
import { generateStory } from "./mistral";

// Configure fal-ai client with the correct credentials format
if (typeof window !== "undefined") {
  fal.config({
    credentials: process.env.NEXT_PUBLIC_FAL_KEY,
  });
}

interface StoryFrame {
  text: string;
  imageUrl: string;
  soundEffect?: string;
  audio?: {
    base64: string;
    duration: number;
    backgroundSound?: {
      base64: string;
      duration: number;
    };
  };
}

interface Story {
  title: string;
  frames: StoryFrame[];
}

// Add WebkitAudioContext type declaration
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

async function mixAudioTracks(
  voiceBase64: string,
  backgroundBase64: string
): Promise<string> {
  // Create audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Function to decode base64 audio
  const decodeBase64Audio = async (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return await audioContext.decodeAudioData(bytes.buffer);
  };

  // Decode both audio tracks
  const [voiceBuffer, backgroundBuffer] = await Promise.all([
    decodeBase64Audio(voiceBase64),
    decodeBase64Audio(backgroundBase64),
  ]);

  // Create mono output buffer
  const outputBuffer = audioContext.createBuffer(
    1, // Use mono output
    Math.max(voiceBuffer.length, backgroundBuffer.length),
    audioContext.sampleRate
  );

  // Get the channel data
  const outputData = outputBuffer.getChannelData(0);
  const voiceData = voiceBuffer.getChannelData(0);
  const backgroundData = backgroundBuffer.getChannelData(0);

  // Mix the tracks
  for (let i = 0; i < outputData.length; i++) {
    // Both voice and background at 100% volume
    outputData[i] = voiceData[i] + (backgroundData[i] || 0);
  }

  // Convert back to base64
  const offlineContext = new OfflineAudioContext(
    1, // Use mono output
    outputBuffer.length,
    outputBuffer.sampleRate
  );
  const source = offlineContext.createBufferSource();
  source.buffer = outputBuffer;
  source.connect(offlineContext.destination);
  source.start();

  const renderedBuffer = await offlineContext.startRendering();
  const wavBlob = await new Promise<Blob>((resolve) => {
    const length = renderedBuffer.length * 2; // 2 bytes per sample for 16-bit audio
    const view = new DataView(new ArrayBuffer(44 + length));

    // Write WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // Mono
    view.setUint16(22, 1, true); // Number of channels
    view.setUint32(24, renderedBuffer.sampleRate, true);
    view.setUint32(28, renderedBuffer.sampleRate * 2, true); // Byte rate for mono
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, length, true);

    // Write audio data
    const floatTo16BitPCM = (
      output: DataView,
      offset: number,
      input: Float32Array
    ) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
    };

    floatTo16BitPCM(view, 44, renderedBuffer.getChannelData(0));

    resolve(new Blob([view], { type: "audio/wav" }));
  });

  // Convert Blob to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(",")[1]);
    };
  });
  reader.readAsDataURL(wavBlob);
  return base64Promise;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

interface FluxImageResult {
  images: Array<{
    url: string;
  }>;
}

interface LtxVideoResult {
  video: {
    url: string;
  };
}

interface MediaResult {
  data: FluxImageResult | LtxVideoResult;
}

export async function generateStoryImages(
  genre: string,
  theme: string,
  format: "motion-comic" | "video",
  onProgress?: (status: string, progress: number) => void
): Promise<Story> {
  try {
    // Generate the story using Mistral
    onProgress?.("Generating story plot...", 0.1);
    const story = await generateStory(genre, theme);
    onProgress?.("Creating your story world...", 0.2);

    // For debugging: only process the first two frames
    const firstTwoFrames = story.frames.slice(0, 2);
    const remainingFrames = story.frames
      .slice(2)
      .map((frame) => ({ ...frame, imageUrl: "" }));

    // Generate images and audio for first two frames
    const updatedFrames = await Promise.all(
      firstTwoFrames.map(async (frame, index) => {
        try {
          console.log("Generating content for frame:", frame.text);
          onProgress?.(
            `Generating ${
              format === "motion-comic" ? "images" : "video"
            } for frame ${index + 1}...`,
            0.3 + index * 0.2
          );

          // Start with generating the voice narration to get its duration
          console.log("Generating voice narration...");
          const voiceResult = await generateSpeechWithTimestamps(frame.text);
          onProgress?.(
            `Adding narration to frame ${index + 1}...`,
            0.4 + index * 0.2
          );

          const narrationDuration =
            voiceResult.normalized_alignment.character_end_times_seconds[
              voiceResult.normalized_alignment.character_end_times_seconds
                .length - 1
            ];

          // Generate image/video and sound effect concurrently
          console.log(`Generating ${format} content...`);
          const [mediaResult, soundEffectResult] = await Promise.all([
            format === "motion-comic"
              ? (fal.subscribe("fal-ai/flux/schnell", {
                  input: {
                    prompt: frame.text,
                    image_size: "landscape_16_9",
                    num_inference_steps: 4,
                    enable_safety_checker: true,
                  },
                }) as Promise<MediaResult>)
              : (fal.subscribe("fal-ai/ltx-video", {
                  input: {
                    prompt: frame.text,
                    negative_prompt:
                      "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly",
                    num_inference_steps: 30,
                    guidance_scale: 3,
                  },
                }) as Promise<MediaResult>),
            frame.soundEffect
              ? generateSoundEffect(frame.soundEffect, narrationDuration, 0.3)
              : null,
          ]);

          console.log("Media generation result:", mediaResult);
          onProgress?.(
            `Processing audio for frame ${index + 1}...`,
            0.5 + index * 0.2
          );

          let mixedAudio;
          if (soundEffectResult) {
            mixedAudio = await mixAudioTracks(
              voiceResult.audio_base64,
              soundEffectResult
            );
          }

          // Extract the URL based on the format
          let mediaUrl: string;
          if (format === "motion-comic") {
            const imageResult = mediaResult.data as FluxImageResult;
            mediaUrl = imageResult.images?.[0]?.url;
            console.log("Motion comic image URL:", mediaUrl);
          } else {
            const videoResult = mediaResult.data as LtxVideoResult;
            mediaUrl = videoResult.video?.url;
            console.log("Video URL:", mediaUrl);
          }

          if (!mediaUrl) {
            console.error("Failed to get media URL from result:", mediaResult);
            throw new Error("Failed to get media URL from generation result");
          }

          return {
            ...frame,
            imageUrl: mediaUrl,
            audio: {
              base64: mixedAudio || voiceResult.audio_base64,
              duration: narrationDuration,
              backgroundSound: soundEffectResult
                ? {
                    base64: soundEffectResult,
                    duration: narrationDuration,
                  }
                : undefined,
            },
          };
        } catch (error) {
          console.error("Error generating content for frame:", error);
          return frame;
        }
      })
    );

    onProgress?.("Finalizing your story...", 0.9);

    return {
      ...story,
      frames: [...updatedFrames, ...remainingFrames],
    };
  } catch (error) {
    console.error("Error in generateStoryImages:", error);
    throw error;
  }
}
