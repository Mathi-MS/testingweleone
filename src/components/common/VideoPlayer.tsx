import React, { useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  RotateCcw,
  RotateCw,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl?: string;
  onVideoWatched?: () => void;
  sessionStartDate?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  meetingUrl?: string;
}

export function VideoPlayer({
  videoUrl,
  onVideoWatched,
  sessionStartDate,
  sessionStartTime,
  meetingUrl,
  sessionEndTime
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasTriggeredWatched, setHasTriggeredWatched] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };
// const getSessionState = () => {
//   if (!sessionStartDate || !sessionStartTime) return "unknown";

//   const sessionDateTime = new Date(`${sessionStartDate} ${sessionStartTime}`);
//   const now = new Date();

//   if (sessionDateTime > now) return "upcoming";

//   if (sessionDateTime <= now && !videoUrl) return "processing";

//   if (videoUrl) return "ready";

//   return "unknown";
// };
const getSessionState = () => {
  if (!sessionStartDate || !sessionStartTime || !sessionEndTime)
    return "unknown";

  const start = new Date(`${sessionStartDate} ${sessionStartTime}`);
  const end = new Date(`${sessionStartDate} ${sessionEndTime}`);
  const now = new Date();

  if (now < start) return "upcoming";

  if (now >= start && now <= end) return "ongoing";

  if (now > end && !videoUrl) return "processing";

  if (videoUrl) return "ready";

  return "unknown";
};

const sessionState = getSessionState();
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    if (!hasTriggeredWatched && duration > 0) {
      const watchedPercentage = (current / duration) * 100;

      if (watchedPercentage >= 90 && onVideoWatched) {
        setHasTriggeredWatched(true);
        onVideoWatched();
      }
    }
    
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = () => {
    if (!videoRef.current) return;
    setVolume(videoRef.current.volume);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
    setVolume(videoRef.current.muted ? 0 : videoRef.current.volume);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  /* FIXED SEEK FUNCTIONS */

  const seekForward = () => {
    if (!videoRef.current) return;

    const newTime = Math.min(videoRef.current.currentTime + 10, duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const seekBackward = () => {
    if (!videoRef.current) return;

    const newTime = Math.max(videoRef.current.currentTime - 10, 0);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };


  return (
    <div className="mb-6">
      <div className="relative w-full">
        {/* Responsive aspect ratio container */}
        <div className="relative w-full bg-black group cursor-pointer rounded-[10px] overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: '70vh' }}>
          {videoUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={videoUrl}
              controlsList="nodownload"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onVolumeChange={handleVolumeChange}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <>
              <div className="w-full h-full bg-black relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 sm:w-16 sm:h-16 bg-[#00BF53]/90 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                  </div>
                </div>

                <div className="absolute top-4 sm:bottom-[30%] sm:top-auto left-0 right-0 flex flex-col items-center text-center text-white px-4">
                 <div className="text-xs sm:text-sm mb-4">
  {sessionState === "upcoming" && (
    <>Upcoming Session starts at {sessionStartDate} | {sessionStartTime}</>
  )}
  {/* {sessionState === "processing" && (
    <>Session completed. Video will be available shortly.</>
  )} */}
  {sessionState === "ongoing" && (
  <>Session is live now. Join the meeting.</>
)}
{sessionState === "processing" && (
  <>Session completed. Video will be available shortly.</>
)}
  {sessionState === "unknown" && (
    <>Session details unavailable.</>
  )}
</div>
                </div>
              </div>

            {/* {meetingUrl && (sessionState === "upcoming" || sessionState === "processing") && (
  <button
    onClick={() => window.open(meetingUrl, "_blank")}
    className="absolute top-[20%] sm:bottom-[20%] sm:top-auto left-1/2 transform -translate-x-1/2 px-2 py-1 sm:px-4 sm:py-2 bg-[#00BF53] hover:bg-[#00BF53]/80 text-white rounded-md transition-colors text-xs sm:text-sm font-medium z-10 h-[max-content]"
  >
    Join Meeting
  </button>
)} */}

{meetingUrl &&
  ["upcoming",  "ongoing"].includes(sessionState) && (
    <button
      onClick={() => window.open(meetingUrl, "_blank")}
      className="absolute top-[20%] sm:bottom-[20%] sm:top-auto left-1/2 transform -translate-x-1/2 px-2 py-1 sm:px-4 sm:py-2 bg-[#00BF53] hover:bg-[#00BF53]/80 text-white rounded-md transition-colors text-xs sm:text-sm font-medium z-10 h-[max-content]"
    >
      Join Meeting
    </button>
)}

            </>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300 ${
              isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
            }`}
          >
            {/* Center play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                disabled={!videoUrl}
                className="w-10 h-10 sm:w-16 sm:h-16 bg-[#00BF53]/90 hover:bg-[#00BF53] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-8 sm:h-8 text-white fill-white" />
                ) : (
                  <Play className="w-4 h-4 sm:w-8 sm:h-8 text-white fill-white" />
                )}
              </button>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
              {/* Progress bar */}
              <div className="mb-2 sm:mb-3" onClick={handleSeek}>
                <div className="relative w-full h-1 bg-white/30 rounded-lg cursor-pointer">
                  <div
                    className="absolute top-0 h-full bg-[#00BF53] rounded-lg"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-[#00BF53]/80 rounded-full flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                  )}
                </button>

                {/* Seek backward - hidden on small screens */}
                <button
                  onClick={seekBackward}
                  className="flex w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-[#00BF53]/80 rounded-full items-center justify-center relative"
                >
                  <RotateCcw className="w-5 h-5 sm:w-7 sm:h-7 text-white opacity-60" />
                  <span className="absolute text-[8px] sm:text-[10px] text-white">10</span>
                </button>

                {/* Seek forward - hidden on small screens */}
                <button
                  onClick={seekForward}
                  className="flex w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-[#00BF53]/80 rounded-full items-center justify-center relative"
                >
                  <RotateCw className="w-5 h-5 sm:w-7 sm:h-7 text-white opacity-60" />
                  <span className="absolute text-[8px] sm:text-[10px] text-white">10</span>
                </button>

                {/* Volume */}
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-[#00BF53]"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                {/* Time display - hidden on small screens */}
                <span className="block text-white text-xs sm:text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-[#00BF53]"
                >
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}