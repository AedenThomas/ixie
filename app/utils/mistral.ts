import { Mistral } from "@mistralai/mistralai";

interface Theme {
  name: string;
  emoji: string;
}

interface StoryFrame {
  text: string;
  imageUrl: string;
  soundEffect?: string;
}

interface Story {
  title: string;
  frames: StoryFrame[];
}

interface RawTheme {
  name?: string;
  emoji?: string;
}

export async function generateThemes(genre: string): Promise<Theme[]> {
  const client = new Mistral({
    apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY || "",
  });

  const prompt = `Generate 5 creative and unique story themes for the "${genre}" genre. Each theme should be accompanied by a single relevant emoji.
The themes should be engaging and specific to the genre.
You must respond with a JSON array containing exactly 5 objects, each with "name" and "emoji" properties.
IMPORTANT: Each emoji must be exactly one Unicode emoji character - no sequences, no modifiers, just a single emoji symbol.`;

  try {
    const chatResponse = await client.chat.complete({
      model: "mistral-small",
      messages: [
        {
          role: "system",
          content:
            "You are a creative writing assistant that generates story themes in JSON format. Always respond with a JSON array of theme objects.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    if (!chatResponse?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from Mistral API");
    }

    const content = String(chatResponse.choices[0].message.content);
    const parsedContent = JSON.parse(content);

    // Check if the parsed content is an array
    const themes: Theme[] = Array.isArray(parsedContent)
      ? parsedContent.map((theme: RawTheme) => {
          // Ensure we only take the first emoji character if multiple are provided
          const emoji =
            String(theme.emoji || "✨").match(/\p{Emoji}/u)?.[0] || "✨";
          return {
            name: String(theme.name || ""),
            emoji,
          };
        })
      : [];

    if (themes.length === 0) {
      throw new Error("No themes generated");
    }

    return themes.slice(0, 5);
  } catch (error) {
    console.error("Error generating themes:", error);
    // Return some fallback themes if the API fails
    return [
      { name: "Mystery Plot", emoji: "🔍" },
      { name: "Character Journey", emoji: "👤" },
      { name: "Epic Quest", emoji: "⚔️" },
      { name: "Hidden Truth", emoji: "🗝️" },
      { name: "New Beginning", emoji: "✨" },
    ];
  }
}

export async function generateStory(
  genre: string,
  theme: string
): Promise<Story> {
  const client = new Mistral({
    apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY || "",
  });

  const prompt = `Generate a creative and engaging story in the "${genre}" genre, focusing on the theme "${theme}". The story should be told in exactly 10 frames, each representing a key moment in the narrative.

The story should follow these guidelines:
1. Each frame should be a vivid, descriptive sentence that can be easily visualized
2. The frames should flow naturally and create a cohesive narrative arc
3. The story should have a clear beginning, middle, and end
4. The tone and style should match the genre
5. The theme should be woven throughout the narrative
6. Each frame's text should be detailed enough to generate an image from
7. Include a background sound effect description for each frame that enhances the mood

You must respond with a JSON object in this exact format:
{
  "title": "A creative and thematic title for the story",
  "frames": [
    {
      "text": "Descriptive text for frame 1",
      "imageUrl": "",
      "soundEffect": "A clear description of the background sound effect"
    },
    // ... exactly 10 frames total
  ]
}`;

  try {
    const chatResponse = await client.chat.complete({
      model: "mistral-small",
      messages: [
        {
          role: "system",
          content:
            "You are a creative writing assistant that generates structured stories in JSON format. Always respond with a properly formatted JSON object containing a title and exactly 10 frames, each with descriptive text and a matching sound effect description.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    if (!chatResponse?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from Mistral API");
    }

    const content = String(chatResponse.choices[0].message.content);
    const parsedContent = JSON.parse(content);

    // Validate the story structure
    if (
      !parsedContent.title ||
      !Array.isArray(parsedContent.frames) ||
      parsedContent.frames.length !== 10
    ) {
      throw new Error("Invalid story structure from API");
    }

    // Ensure each frame has the required properties
    const story: Story = {
      title: String(parsedContent.title),
      frames: parsedContent.frames.map((frame: any) => ({
        text: String(frame.text || ""),
        imageUrl: "",
        soundEffect: String(frame.soundEffect || ""),
      })),
    };

    return story;
  } catch (error) {
    console.error("Error generating story:", error);
    // Return a fallback story if the API fails
    return {
      title: `A ${theme} ${genre} Tale`,
      frames: Array(10)
        .fill(null)
        .map((_, i) => ({
          text: `Frame ${i + 1} of the story...`,
          imageUrl: "",
          soundEffect: "",
        })),
    };
  }
}
