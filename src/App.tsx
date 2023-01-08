import React, { useCallback, useEffect } from "react";
import { Box } from "@material-ui/core";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "video.js/dist/video-js.css";
import "videojs-wavesurfer/dist/css/videojs.wavesurfer.css";
import "videojs-wavesurfer/dist/videojs.wavesurfer.js";

const url =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const useResize = (initialWidth: number, initialHeight: number) => {
  const [width, setWidth] = React.useState(initialWidth);
  const [height, setHeight] = React.useState(initialHeight);
  const aspectRatio = initialWidth / initialHeight;

  const onResize = useCallback(
    (event: EventType) => {
      const target = event.target as HTMLDivElement;
      const newWidth = target.offsetWidth;
      const newHeight = target.offsetHeight;
      console.log("******* NEW WIDTH: ", newWidth);

      if (newWidth % aspectRatio === 0) {
        setWidth(newWidth);
        setHeight(newWidth / aspectRatio);
      } else if (newHeight % aspectRatio === 0) {
        setWidth(newHeight * aspectRatio);
        setHeight(newHeight);
      }
    },
    [aspectRatio]
  );

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  return { width, height, onResize };
};

const VideoJS = (props: VideoJSProps) => {
  const videoRef = React.useRef<null | HTMLDivElement>(null);
  const waveRef = React.useRef<null | HTMLDivElement>(null);
  const playerRef = React.useRef<null | VideoJsPlayer>(null);
  const { options, onReady } = props;

  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-default-skin");
      videoRef.current?.appendChild(videoElement);

      const waveElement = document.createElement("div");
      waveElement.setAttribute("id", "waveform");
      waveRef.current?.appendChild(waveElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        if (onReady) onReady(player);
      }));
    } else {
      const player = playerRef.current as VideoJsPlayer;
      player.autoplay(options.autoplay!);
      player.src(options.sources!);
    }
  }, [onReady, options, videoRef, waveRef]);

  React.useEffect(() => {
    const player = (playerRef.current as unknown) as VideoJsPlayer;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <>
      <div ref={videoRef} />
      <div ref={waveRef} />
    </>
  );
};

const handlePlayerReady = (player: VideoJsPlayer) => {
  player.src({ src: url, type: "video/mp4" });

  player.on("waiting", () => {
    videojs.log("player is waiting");
  });

  player.on("dispose", () => {
    videojs.log("player will dispose");
  });
};

const initialWidth = 600;
const initialHeight = 300;

type EventType = Event | React.SyntheticEvent;

type VideoJSProps = {
  options: VideoJsPlayerOptions;
  onReady: (player: VideoJsPlayer) => void;
};

export const App = () => {
  const { width, height, onResize } = useResize(initialWidth, initialHeight);
  const videoJsOptions: VideoJsPlayerOptions = {
    controls: true,
    autoplay: true,
    loop: false,
    muted: false,
    fluid: false,
    width,
    height,
    inactivityTimeout: 0,
    bigPlayButton: false,
    playsinline: true,
    plugins: {
      wavesurfer: {
        backend: "MediaElement",
        displayMilliseconds: true,
        debug: true,
        cursorColor: "black",
        hideScrollbar: true,
        container: "#waveform"
      }
    }
  };
  console.log("******* WIDTH: ", width);

  return (
    <div
      onResize={onResize}
      style={{
        width: width,
        border: "1px solid black",
        padding: "4px",
        overflow: "auto",
        resize: "both"
      }}
    >
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
      <div
        id="waveform"
        style={{
          width: width
        }}
      ></div>
    </div>
  );
};
