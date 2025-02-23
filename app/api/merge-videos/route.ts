import { NextResponse } from "next/server";
import VideoStitch from "video-stitch";
import axios from "axios";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const videoConcat = VideoStitch.concat;

interface VideoRequest {
  videos: Array<{
    url: string;
    audioBase64?: string;
    duration: number;
    playbackRate: number;
  }>;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { videos } = (await req.json()) as VideoRequest;

    if (!Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json(
        { error: "Invalid videos array" },
        { status: 400 }
      );
    }

    // Create temporary directory paths
    const tempDir = tmpdir();
    const inputFiles: string[] = [];
    const audioFiles: string[] = [];
    const outputPath = join(tempDir, "output.mp4");

    // Download and process videos
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];

      // Download video
      const videoResponse = await axios.get(video.url, {
        responseType: "arraybuffer",
      });
      const videoPath = join(tempDir, `video${i}.mp4`);
      await writeFile(videoPath, videoResponse.data);
      inputFiles.push(videoPath);

      // Save audio if present
      if (video.audioBase64) {
        const audioBuffer = Buffer.from(video.audioBase64, "base64");
        const audioPath = join(tempDir, `audio${i}.mp3`);
        await writeFile(audioPath, audioBuffer);
        audioFiles.push(audioPath);
      }
    }

    try {
      // Merge videos
      await new Promise<void>((resolve, reject) => {
        videoConcat({
          silent: true,
          overwrite: true,
        })
          .clips(
            inputFiles.map((file, i) => ({
              fileName: file,
              // Add audio options if available
              ...(audioFiles[i] && {
                audioFileName: audioFiles[i],
                audioStartTime: 0,
                audioEndTime: videos[i].duration,
              }),
            }))
          )
          .output(outputPath)
          .concat()
          .then(() => resolve())
          .catch(reject);
      });

      // Read the output file
      const outputBuffer = await readFile(outputPath);

      // Clean up temporary files
      await Promise.all([
        ...inputFiles.map((file) => unlink(file)),
        ...audioFiles.map((file) => unlink(file)),
        unlink(outputPath),
      ]);

      // Return the merged video as a response
      return new NextResponse(outputBuffer, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": 'attachment; filename="merged.mp4"',
        },
      });
    } catch (error) {
      // Clean up temporary files on error
      await Promise.all([
        ...inputFiles.map((file) => unlink(file).catch(() => {})),
        ...audioFiles.map((file) => unlink(file).catch(() => {})),
        unlink(outputPath).catch(() => {}),
      ]);

      console.error("Error merging videos:", error);
      return NextResponse.json(
        { error: "Failed to merge videos" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in merge-videos route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
