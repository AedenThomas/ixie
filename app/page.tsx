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
    "genre" | "theme" | "format" | "story"
  >("genre");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<
    "motion-comic" | "video" | null
  >(null);
  const [generatedThemes, setGeneratedThemes] = useState<
    Array<{ name: string; emoji: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<{
    message: string;
    progress: number;
  }>({ message: "", progress: 0 });
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
        className="absolute inset-0 flex flex-col items-center justify-center z-10"
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
        className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${
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
                        className={`font-medium whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                          selectedGenre === "Romance"
                            ? "text-black"
                            : "text-white"
                        }`}
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

      {/* Format Selection View */}
      <motion.div
        initial={{ y: 1000, opacity: 0 }}
        animate={{
          y: currentScreen === "format" ? 0 : 1000,
          opacity: currentScreen === "format" ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${
          currentScreen === "format"
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Story Format
          </h1>
          <p className="text-gray-300 text-lg">
            Select how you'd like your story to be presented
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setSelectedFormat("motion-comic")}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              selectedFormat === "motion-comic"
                ? "bg-white text-black"
                : "bg-white bg-opacity-10 text-white hover:bg-opacity-20"
            }`}
          >
            Motion Comic
          </button>
          <button
            onClick={() => setSelectedFormat("video")}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              selectedFormat === "video"
                ? "bg-white text-black"
                : "bg-white bg-opacity-10 text-white hover:bg-opacity-20"
            }`}
          >
            Video
          </button>
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
        className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${
          currentScreen === "story"
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-8 p-8 max-w-lg mx-auto text-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-white border-opacity-20"></div>
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  className="text-white"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  strokeDasharray={`${loadingStatus.progress * 283} 283`}
                  r="45"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xl font-medium">
                  {Math.round(loadingStatus.progress * 100)}%
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Creating Your{" "}
              {selectedFormat === "motion-comic" ? "Motion Comic" : "Video"}{" "}
              Story
            </h2>
            <p className="text-gray-300 text-lg animate-pulse">
              {loadingStatus.message}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div
                className={`p-4 rounded-lg ${
                  loadingStatus.progress >= 0.2
                    ? "bg-white bg-opacity-10"
                    : "bg-white bg-opacity-5"
                }`}
              >
                <p className="text-white font-medium">Story</p>
                <p className="text-sm text-gray-400">Generating plot</p>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  loadingStatus.progress >= 0.5
                    ? "bg-white bg-opacity-10"
                    : "bg-white bg-opacity-5"
                }`}
              >
                <p className="text-white font-medium">Media</p>
                <p className="text-sm text-gray-400">Creating visuals</p>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  loadingStatus.progress >= 0.8
                    ? "bg-white bg-opacity-10"
                    : "bg-white bg-opacity-5"
                }`}
              >
                <p className="text-white font-medium">Audio</p>
                <p className="text-sm text-gray-400">Adding narration</p>
              </div>
            </div>
          </div>
        ) : story ? (
          <div className="w-full max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              {story.title}
            </h1>

            <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-8 bg-gray-800">
              {story.frames[currentFrame].imageUrl ? (
                selectedFormat === "motion-comic" ? (
                  <Image
                    src={story.frames[currentFrame].imageUrl}
                    alt={story.frames[currentFrame].text}
                    fill
                    className="object-cover"
                    priority={currentFrame < 2}
                    onLoad={() => {
                      if (
                        currentFrame < 2 &&
                        story.frames[currentFrame].audio?.base64
                      ) {
                        const audio = base64ToAudio(
                          story.frames[currentFrame].audio!.base64
                        );
                        audio.volume = 1.0;
                        audio.play();

                        // Listen for audio completion
                        audio.onended = () => {
                          if (currentFrame < story.frames.length - 1) {
                            setCurrentFrame(currentFrame + 1);
                          }
                        };
                      }
                    }}
                  />
                ) : (
                  <video
                    src={story.frames[currentFrame].imageUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                    onPlay={() => {
                      if (
                        currentFrame < 2 &&
                        story.frames[currentFrame].audio?.base64
                      ) {
                        const audio = base64ToAudio(
                          story.frames[currentFrame].audio!.base64
                        );
                        audio.volume = 1.0;
                        audio.play();

                        // Create flags to track completion
                        let audioComplete = false;
                        let videoComplete = false;

                        // Function to check if both are complete
                        const checkCompletion = () => {
                          if (audioComplete && videoComplete) {
                            if (currentFrame < story.frames.length - 1) {
                              setCurrentFrame(currentFrame + 1);
                            }
                          }
                        };

                        // Listen for audio completion
                        audio.onended = () => {
                          audioComplete = true;
                          checkCompletion();
                        };

                        // Listen for video completion
                        const video = document.querySelector("video");
                        if (video) {
                          video.onended = () => {
                            videoComplete = true;
                            checkCompletion();
                          };
                        }
                      }
                    }}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-lg">Media not yet generated</p>
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
          } else if (currentScreen === "theme" && selectedTheme) {
            setCurrentScreen("format");
          } else if (currentScreen === "format" && selectedFormat) {
            console.log("Starting story generation...");
            setIsLoading(true);
            setLoadingStatus({
              message: "Initializing story generation...",
              progress: 0.1,
            });
            console.log("Loading status set:", {
              isLoading: true,
              progress: 0.1,
            });

            try {
              console.log("Calling generateStoryImages...");
              const generatedStory = await generateStoryImages(
                selectedGenre,
                selectedTheme,
                selectedFormat,
                (status: string, progress: number) => {
                  console.log("Progress update:", { status, progress });
                  setLoadingStatus({ message: status, progress });
                }
              );

              console.log("Story generation complete:", generatedStory);
              setStory(generatedStory);
              setCurrentFrame(0);
              setCurrentScreen("story");
            } catch (error) {
              console.error("Error generating story:", error);
            } finally {
              console.log("Resetting loading state...");
              setIsLoading(false);
              setLoadingStatus({ message: "", progress: 0 });
            }
          }
        }}
      >
        {currentScreen === "genre"
          ? "Next"
          : currentScreen === "theme"
          ? selectedTheme
            ? "Create Story"
            : "Select a Theme"
          : currentScreen === "format"
          ? selectedFormat
            ? "Generate Story"
            : "Select a Format"
          : ""}
      </motion.button>

      {/* Radial Gradient */}
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{
          opacity: currentScreen === "genre" ? [0.2, 0.4, 0.2] : [1, 0],
          scale: currentScreen === "genre" ? [1, 1.1, 1] : [1, 10],
          backgroundColor: "transparent",
        }}
        transition={{
          duration: currentScreen === "genre" ? 3 : 2,
          ease: "easeInOut",
          repeat: currentScreen === "genre" ? Infinity : 0,
          times: currentScreen === "genre" ? [0, 0.5, 1] : [0, 1],
        }}
        className="fixed inset-0 w-screen h-screen z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center bottom, ${currentGradientColor} 0%, transparent 60%)`,
          transformOrigin: "center bottom",
        }}
      />
      {/* Second gradient for continuous subtle pulse */}
      {currentScreen !== "genre" && (
        <motion.div
          initial={{ opacity: 0, scale: 2.9 }}
          animate={{
            opacity: [0.2, 0.3, 0.2],
            scale: [0.6, 0.63, 0.6],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            times: [0, 0.5, 1],
            delay: 2,
          }}
          className="fixed inset-0 w-screen h-screen z-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center bottom, ${currentGradientColor} 0%, transparent 60%)`,
            transformOrigin: "center bottom",
          }}
        />
      )}
    </div>
  );
}
