"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { generateThemes } from "./utils/mistral";
import { generateStoryImages } from "./utils/story";
import { base64ToAudio } from "./utils/elevenlabs";
import { CenteredCarousel } from "./components/CenteredCarousel";

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<string>("Mystery");
  const [currentScreen, setCurrentScreen] = useState<
    "genre" | "theme" | "story"
  >("genre");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [generatedThemes, setGeneratedThemes] = useState<
    Array<{ name: string; emoji: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<{
    title: string;
    frames: Array<{
      text: string;
      imageUrl: string;
      audio?: { base64: string; duration: number };
    }>;
  } | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  const genres = [
    {
      name: "Fantasy",
      color: "bg-[#399A1D]",
      gradientColor: "#399A1D",
      icon: "/cloud.svg",
    },
    {
      name: "Horror",
      color: "bg-[#F54B4B]",
      gradientColor: "#F54B4B",
      icon: "/wolf.svg",
    },
    {
      name: "Mystery",
      color: "bg-[#FD950D]",
      gradientColor: "#FD950D",
      icon: "/shell.svg",
    },
    {
      name: "Adventure",
      color: "bg-[#2660DA]",
      gradientColor: "#2660DA",
      icon: "/feather.svg",
    },
    {
      name: "Romance",
      color: "bg-[#FFF]",
      gradientColor: "#FFFFFF",
      textColor: "text-black",
      icon: "/flower.svg",
    },
  ];

  useEffect(() => {
    if (currentScreen === "theme") {
      setIsLoading(true);
      generateThemes(selectedGenre)
        .then((themes) => {
          setGeneratedThemes(themes);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    }
  }, [currentScreen, selectedGenre]);

  // Add keyboard navigation
  useEffect(() => {
    if (currentScreen === "story") {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          setCurrentFrame((prev) => Math.max(0, prev - 1));
        } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          setCurrentFrame((prev) =>
            Math.min((story?.frames.length || 1) - 1, prev + 1)
          );
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [currentScreen, story?.frames.length]);

  // Get the current genre's gradient color
  const currentGradientColor = genres.find(
    (genre) => genre.name === selectedGenre
  )?.gradientColor;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <motion.div
        initial={false}
        animate={{
          y: currentScreen === "genre" ? 0 : -1000,
          opacity: currentScreen === "genre" ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full flex flex-col items-center justify-center"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Ixie
          </h1>
          <p className="text-gray-300 text-lg">
            Select a genre to begin your story journey
          </p>
        </div>

        {/* Genre Row */}
        <CenteredCarousel
          items={genres.map((genre) => ({
            id: genre.name,
            width: selectedGenre === genre.name ? 300 : 56,
            isSelected: selectedGenre === genre.name,
            onClick: () => setSelectedGenre(genre.name),
            className: genre.color,
            content: (
              <>
                <motion.div
                  className={`
                    w-6 h-6 
                    shrink-0 
                    flex items-center justify-center
                    ${selectedGenre === genre.name ? "mr-3" : ""}
                  `}
                  layout
                >
                  <Image
                    src={genre.icon}
                    alt={`${genre.name} icon`}
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: selectedGenre === genre.name ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`font-medium whitespace-nowrap ${
                    genre.textColor || "text-white"
                  }`}
                >
                  {genre.name}
                </motion.h2>
              </>
            ),
          }))}
          containerClassName="relative z-10"
        />
      </motion.div>

      <motion.div
        initial={{ y: 1000, opacity: 0 }}
        animate={{
          y: currentScreen === "theme" ? 0 : 1000,
          opacity: currentScreen === "theme" ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`absolute inset-0 flex flex-col items-center justify-center ${
          currentScreen === "theme"
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Let's Narrow It Down
          </h1>
          <p className="text-gray-300 text-lg">
            Pick a theme or let us surprise you!
          </p>
        </div>

        <div className="flex flex-row gap-4 justify-center items-center relative z-10">
          {isLoading ? (
            <div className="text-white text-lg">Generating themes...</div>
          ) : (
            <CenteredCarousel
              items={[
                ...generatedThemes.map((theme) => ({
                  id: theme.name,
                  width: selectedTheme === theme.name ? 400 : 56,
                  isSelected: selectedTheme === theme.name,
                  onClick: () => setSelectedTheme(theme.name),
                  className: `${
                    genres.find((g) => g.name === selectedGenre)?.color
                  } ${selectedTheme === theme.name ? "px-6" : "px-0"}`,
                  content: (
                    <>
                      <motion.div
                        className={`
                          w-6 h-6 
                          shrink-0 
                          flex items-center justify-center
                          ${selectedTheme === theme.name ? "mr-3" : ""}
                        `}
                        layout
                      >
                        <span className="text-2xl">{theme.emoji}</span>
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: selectedTheme === theme.name ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap text-white min-w-0 overflow-hidden text-ellipsis"
                      >
                        {theme.name}
                      </motion.h2>
                    </>
                  ),
                })),
                {
                  id: "random",
                  width: 56,
                  isSelected: false,
                  onClick: () => {
                    const randomTheme =
                      generatedThemes[
                        Math.floor(Math.random() * generatedThemes.length)
                      ];
                    setSelectedTheme(randomTheme?.name || "");
                  },
                  className: "bg-white bg-opacity-10",
                  content: (
                    <span className="text-2xl flex items-center justify-center w-full h-full">
                      🎲
                    </span>
                  ),
                },
              ]}
              containerClassName="relative z-10"
            />
          )}
        </div>
      </motion.div>

      {/* Story View */}
      <motion.div
        initial={{ y: 1000, opacity: 0 }}
        animate={{
          y: currentScreen === "story" ? 0 : 1000,
          opacity: currentScreen === "story" ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`absolute inset-0 flex flex-col items-center justify-center ${
          currentScreen === "story"
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
      >
        {isLoading ? (
          <div className="text-white text-lg">Generating your story...</div>
        ) : story ? (
          <div className="w-full max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              {story.title}
            </h1>

            <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-8 bg-gray-800">
              {story.frames[currentFrame].imageUrl ? (
                <Image
                  src={story.frames[currentFrame].imageUrl}
                  alt={story.frames[currentFrame].text}
                  fill
                  className="object-cover"
                  priority={currentFrame < 2} // Prioritize loading first two images
                  onLoad={() => {
                    // Play audio when image loads and we're on one of the first two frames
                    if (
                      currentFrame < 2 &&
                      story.frames[currentFrame].audio?.base64
                    ) {
                      const audio = base64ToAudio(
                        story.frames[currentFrame].audio!.base64
                      );
                      audio.play();

                      // Set up automatic transition to next frame
                      if (currentFrame === 0) {
                        const duration =
                          story.frames[currentFrame].audio!.duration * 1000; // Convert to milliseconds
                        setTimeout(() => {
                          setCurrentFrame(1);
                        }, duration);
                      }
                    }
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-lg">Image not yet generated</p>
                </div>
              )}
            </div>

            <p className="text-white text-lg text-center mb-8">
              {story.frames[currentFrame].text}
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                  disabled={currentFrame === 0}
                  className={`px-6 py-3 rounded-full flex items-center gap-2 ${
                    currentFrame === 0
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-white text-black hover:bg-opacity-90"
                  }`}
                >
                  ← Previous
                </button>
                <div className="bg-white bg-opacity-10 px-4 py-2 rounded-full">
                  <span className="text-white font-medium">
                    Frame {currentFrame + 1} of {story.frames.length}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setCurrentFrame(
                      Math.min(story.frames.length - 1, currentFrame + 1)
                    )
                  }
                  disabled={currentFrame === story.frames.length - 1}
                  className={`px-6 py-3 rounded-full flex items-center gap-2 ${
                    currentFrame === story.frames.length - 1
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-white text-black hover:bg-opacity-90"
                  }`}
                >
                  Next →
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                Use arrow keys to navigate between frames
              </p>
            </div>
          </div>
        ) : null}
      </motion.div>

      {/* Next Button */}
      <motion.button
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 right-8 bg-white rounded-full px-8 py-3 font-medium text-black z-50"
        onClick={async () => {
          if (currentScreen === "genre") {
            setTimeout(() => setCurrentScreen("theme"), 100);
          } else if (currentScreen === "theme") {
            setIsLoading(true);
            try {
              const generatedStory = await generateStoryImages(selectedGenre);
              setStory(generatedStory);
              setCurrentFrame(0);
              setCurrentScreen("story");
            } catch (error) {
              console.error("Error generating story:", error);
            } finally {
              setIsLoading(false);
            }
          }
        }}
      >
        {currentScreen === "genre"
          ? "Next"
          : currentScreen === "theme"
          ? "Create Story"
          : ""}
      </motion.button>

      {/* Radial Gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: currentScreen === "theme" ? [0.3, 0.9, 0, 0.3] : 0.3,
          scale: currentScreen === "theme" ? [1, 3, 3, 1] : 1,
          backgroundColor:
            currentScreen === "theme"
              ? ["transparent", "transparent", "black", "transparent"]
              : "transparent",
        }}
        transition={{
          duration: 2,
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.2, 0.4, 1],
        }}
        className="fixed inset-0 w-screen h-screen z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center bottom, ${currentGradientColor} 0%, transparent 60%)`,
          transformOrigin: "center bottom",
        }}
      />
    </div>
  );
}
