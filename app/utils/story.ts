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

const SAMPLE_STORIES: Record<string, Story> = {
  Mystery: {
    title: "The Vanishing Artifact",
    frames: [
      {
        text: "In the dimly lit halls of the Metropolitan Museum, curator Sarah Chen discovers an empty display case where the priceless Ming vase once stood.",
        imageUrl: "",
      },
      {
        text: "Security footage reveals a strange anomaly - the vase seems to fade from existence rather than being physically removed.",
        imageUrl: "",
      },
      {
        text: "Sarah finds an ancient symbol etched into the display case glass, glowing faintly in the darkness.",
        imageUrl: "",
      },
      {
        text: "Research leads her to a hidden chamber beneath the museum, walls covered in similar symbols.",
        imageUrl: "",
      },
      {
        text: "A mysterious figure in traditional Chinese robes appears, explaining that the vase was a doorway between worlds.",
        imageUrl: "",
      },
      {
        text: "Sarah discovers her own family seal among the ancient markings - her heritage is intertwined with the vase's guardians.",
        imageUrl: "",
      },
      {
        text: "The symbols begin to pulse with energy, creating a portal in the chamber's center.",
        imageUrl: "",
      },
      {
        text: "Through the portal, Sarah glimpses the vase in an ethereal temple, surrounded by other lost artifacts.",
        imageUrl: "",
      },
      {
        text: "She must choose: step through to recover the vase, or seal the portal to protect both worlds.",
        imageUrl: "",
      },
      {
        text: "Sarah chooses to become the new guardian, watching over the threshold between the mundane and magical realms.",
        imageUrl: "",
      },
    ],
  },
  Fantasy: {
    title: "The Crystal Song",
    frames: [
      {
        text: "Deep in the Crystal Forest, young mage Aria discovers a resonating shard that hums with an ancient melody.",
        imageUrl: "",
      },
      {
        text: "The crystal's song awakens dormant magic in the forest, causing luminous flowers to bloom in its wake.",
        imageUrl: "",
      },
      {
        text: "Mystical creatures, long thought extinct, emerge from hiding, drawn to the crystal's harmonious power.",
        imageUrl: "",
      },
      {
        text: "Aria learns that the shard is a piece of the legendary Crystal Harp, an artifact that once maintained world harmony.",
        imageUrl: "",
      },
      {
        text: "Dark forces stir as news of the crystal's discovery spreads, threatening to steal its power for chaos.",
        imageUrl: "",
      },
      {
        text: "Guided by forest spirits, Aria begins a quest to find the remaining pieces of the Crystal Harp.",
        imageUrl: "",
      },
      {
        text: "Each shard she recovers adds a new layer to the mysterious melody, revealing the story of her world's creation.",
        imageUrl: "",
      },
      {
        text: "The final piece lies in the heart of a dormant volcano, protected by an ancient dragon guardian.",
        imageUrl: "",
      },
      {
        text: "Aria must prove her worth by performing the unfinished Song of Creation for the dragon.",
        imageUrl: "",
      },
      {
        text: "United, the Crystal Harp's song restores balance to the realm, with Aria as its new chosen musician.",
        imageUrl: "",
      },
    ],
  },
  Horror: {
    title: "Echo in the Static",
    frames: [
      {
        text: "Tech journalist Maya receives a mysterious signal on her vintage radio, a voice calling for help through the static.",
        imageUrl: "",
      },
      {
        text: "The voice belongs to someone claiming to be trapped between radio frequencies, a victim of a forgotten experiment.",
        imageUrl: "",
      },
      {
        text: "Maya's research reveals a series of disappearances linked to an abandoned radio station on the city's outskirts.",
        imageUrl: "",
      },
      {
        text: "The station's equipment comes alive at night, broadcasting fragments of lost souls into the airwaves.",
        imageUrl: "",
      },
      {
        text: "Maya discovers her own voice among the recordings, from a future she hasn't lived yet.",
        imageUrl: "",
      },
      {
        text: "The station's walls pulse with dark energy, revealing glimpses of a parallel dimension through tears in reality.",
        imageUrl: "",
      },
      {
        text: "Previous investigators have left warnings scrawled in blood: 'Don't answer when it calls your name.'",
        imageUrl: "",
      },
      {
        text: "The entity behind the voices reveals itself - a creature that feeds on radio waves and human consciousness.",
        imageUrl: "",
      },
      {
        text: "Maya must find a way to close the frequency portal before more souls are trapped in the static.",
        imageUrl: "",
      },
      {
        text: "The final broadcast reveals the true horror: every radio signal now carries a piece of the entity's influence.",
        imageUrl: "",
      },
    ],
  },
  Adventure: {
    title: "Race to the Lost City",
    frames: [
      {
        text: "Professor Elena Martinez decodes an ancient map leading to the legendary city of El Dorado, hidden in the Amazon.",
        imageUrl: "",
      },
      {
        text: "Her expedition team discovers a series of sophisticated traps protecting the entrance to a vast underground network.",
        imageUrl: "",
      },
      {
        text: "Ancient mechanisms spring to life, powered by an unknown energy source that still functions after centuries.",
        imageUrl: "",
      },
      {
        text: "The team finds evidence of an advanced civilization that harnessed sustainable energy long before modern times.",
        imageUrl: "",
      },
      {
        text: "Rival explorers appear, forcing Elena to navigate political intrigue alongside physical dangers.",
        imageUrl: "",
      },
      {
        text: "A hidden chamber reveals the truth: El Dorado was not a city of gold, but of revolutionary technology.",
        imageUrl: "",
      },
      {
        text: "The city's central plaza contains a device capable of producing unlimited clean energy.",
        imageUrl: "",
      },
      {
        text: "Elena must choose between academic glory and protecting the city's secrets from exploitation.",
        imageUrl: "",
      },
      {
        text: "The city's defense systems activate, giving Elena minutes to make her decision before sealing forever.",
        imageUrl: "",
      },
      {
        text: "Elena chooses to share the discovery with indigenous guardians, ensuring the technology's responsible use.",
        imageUrl: "",
      },
    ],
  },
  Romance: {
    title: "Letters in the Digital Age",
    frames: [
      {
        text: "Software developer Zara discovers an AI bug that's delivering love letters from parallel universes.",
        imageUrl: "",
      },
      {
        text: "Each letter describes a different version of her life, all connected to a mysterious person named Alex.",
        imageUrl: "",
      },
      {
        text: "The letters reveal moments where their paths almost crossed in this universe but never quite aligned.",
        imageUrl: "",
      },
      {
        text: "Zara begins to notice small changes in her reality as the AI continues to bridge parallel worlds.",
        imageUrl: "",
      },
      {
        text: "She realizes Alex is her new colleague, recently transferred from another tech company.",
        imageUrl: "",
      },
      {
        text: "The AI shows them glimpses of their lives together in other dimensions, each uniquely beautiful.",
        imageUrl: "",
      },
      {
        text: "Reality starts to blur as memories from different timelines begin to merge.",
        imageUrl: "",
      },
      {
        text: "Zara and Alex must decide whether to embrace their parallel lives or forge their own unique path.",
        imageUrl: "",
      },
      {
        text: "The AI reveals it was created by their future selves to ensure they would find each other.",
        imageUrl: "",
      },
      {
        text: "They choose to write their own story, knowing their love transcends all possible universes.",
        imageUrl: "",
      },
    ],
  },
};

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

export async function generateStoryImages(
  genre: string,
  theme: string
): Promise<Story> {
  try {
    // Generate the story using Mistral
    const story = await generateStory(genre, theme);

    // For debugging: only process the first two frames
    const firstTwoFrames = story.frames.slice(0, 2);
    const remainingFrames = story.frames
      .slice(2)
      .map((frame) => ({ ...frame, imageUrl: "" }));

    // Generate images and audio for first two frames
    const updatedFrames = await Promise.all(
      firstTwoFrames.map(async (frame) => {
        try {
          console.log("Generating content for frame:", frame.text);

          // Start with generating the voice narration to get its duration
          const voiceResult = await generateSpeechWithTimestamps(frame.text);

          const narrationDuration =
            voiceResult.normalized_alignment.character_end_times_seconds[
              voiceResult.normalized_alignment.character_end_times_seconds
                .length - 1
            ];

          // Generate image and sound effect concurrently
          const [imageResult, soundEffectResult] = await Promise.all([
            fal.subscribe("fal-ai/flux/schnell", {
              input: {
                prompt: frame.text,
                image_size: "landscape_16_9",
                num_inference_steps: 4,
                enable_safety_checker: true,
              },
            }),
            frame.soundEffect
              ? generateSoundEffect(
                  frame.soundEffect,
                  narrationDuration, // Match the duration of the narration
                  0.3
                )
              : null,
          ]);

          let mixedAudio;
          if (soundEffectResult) {
            mixedAudio = await mixAudioTracks(
              voiceResult.audio_base64,
              soundEffectResult
            );
          }

          return {
            ...frame,
            imageUrl: imageResult.data.images[0].url,
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

    return {
      ...story,
      frames: [...updatedFrames, ...remainingFrames],
    };
  } catch (error) {
    console.error("Error in generateStoryImages:", error);
    throw error;
  }
}
