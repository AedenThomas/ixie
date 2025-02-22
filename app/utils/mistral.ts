import { Mistral } from "@mistralai/mistralai";

interface Theme {
  name: string;
  emoji: string;
}

export async function generateThemes(genre: string): Promise<Theme[]> {
  const client = new Mistral({
    apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY || "",
  });

  const prompt = `Generate 5 creative and unique story themes for the "${genre}" genre. Each theme should be accompanied by a single relevant emoji.
The themes should be engaging and specific to the genre.
You must respond with a JSON array containing exactly 5 objects, each with "name" and "emoji" properties.
Each emoji must be a single Unicode emoji character.`;

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
      ? parsedContent.map((theme: any) => ({
          name: String(theme.name || ""),
          emoji: String(theme.emoji || "✨"),
        }))
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
