declare module "video-stitch" {
  interface VideoStitchOptions {
    silent?: boolean;
    overwrite?: boolean;
  }

  interface ClipOptions {
    fileName: string;
  }

  interface VideoConcat {
    clips: (clips: ClipOptions[]) => VideoConcat;
    output: (path: string) => VideoConcat;
    concat: () => Promise<void>;
  }

  interface VideoStitch {
    concat: (options: VideoStitchOptions) => VideoConcat;
  }

  const videoStitch: VideoStitch;
  export default videoStitch;
}
