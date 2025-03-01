// VideoDisplay.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Play, Pause, Maximize, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  videoURL: string;
  timestamp: any;
}

const VideoDisplay: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});  // Progress per video
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});


    useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const videosQuery = query(collection(db, 'videos'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(videosQuery);
        const videoData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Video));
        setVideos(videoData);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);


  const togglePlayPause = (videoId: string) => {
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;

    if (playingVideoId === videoId) {
      videoElement.pause();
      setPlayingVideoId(null);
    } else {
      // Pause any other playing video
      if (playingVideoId && videoRefs.current[playingVideoId]) {
        videoRefs.current[playingVideoId]!.pause();
      }
      videoElement.play();
      setPlayingVideoId(videoId);

        // Set up timeupdate listener *only* when playing
        videoElement.ontimeupdate = () => {
          if(videoElement) {
             setProgress((prev) => ({
                ...prev,
                [videoId]: (videoElement.currentTime / videoElement.duration) * 100 || 0,
              }));
          }
        }
        // Clean up the listener to prevent double updates
        videoElement.onpause = () => {
            videoElement.ontimeupdate = null;
        }
         videoElement.onended = () => {
            setPlayingVideoId(null);
            setProgress((prev) => ({ ...prev, [videoId]: 0 })); //reset progress
        };
    }
  };

    const handleSeek = (videoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const videoElement = videoRefs.current[videoId];
        if (videoElement) {
          const newTime = (parseFloat(e.target.value) / 100) * videoElement.duration;
          videoElement.currentTime = newTime;
           setProgress((prev) => ({ ...prev, [videoId]: parseFloat(e.target.value) }));
        }
    }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    // Apply volume to all video elements
    Object.values(videoRefs.current).forEach((videoElement) => {
      if (videoElement) {
        videoElement.volume = newVolume;
      }
    });
  };

  const toggleFullscreen = (videoId: string) => {
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;

    if (document.fullscreenElement === videoElement) {
      document.exitFullscreen();
      setFullscreenVideo(null);
    } else {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      }
      setFullscreenVideo(videoId);
    }

      //important to keep track of playing state in full screen
        videoElement.onfullscreenchange = () => {
            if(!document.fullscreenElement) {
                setFullscreenVideo(null); // Reset fullscreen state
                if(playingVideoId === videoId) { // If exited fullscreen and was playing
                    videoElement.play()
                }
            }
        }

  };

    // Helper function to format time
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
            .filter(Boolean)
            .join(':');
    };


  return (
    <div className=" py-12">
      <div className="container mx-auto px-4">
       

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-gray-900" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="bg-white text-black   overflow-hidden flex flex-col lg:flex-row lg:justify-between">
                {/* Video Player */}
                <div className="relative lg:w-full">
                    <video
                        ref={(el: HTMLVideoElement | null) => {
                            if (el) {
                                videoRefs.current[video.id] = el;
                            } else {
                                delete videoRefs.current[video.id];
                            }
                        }}
                        id={`video-${video.id}`}
                        className="w-full aspect-video object-cover"
                        controls={false}
                        // volume={volume} // Remove volume prop from here
                    >
                    <source src={video.videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                    </video>


                  {/* Custom Controls */}
                  <div className="absolute bottom-2 left-0 right-0 px-4 py-2 flex flex-col">
                     {/* Progress Bar */}
                    <div className='w-full relative'>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress[video.id] || 0}
                            onChange={(e) => handleSeek(video.id, e)}
                            className="w-full h-1 bg-gray-700 rounded-full appearance-none"
                            disabled={playingVideoId !== video.id}
                            />

                        {/* Display Time */}
                        {videoRefs.current[video.id] && (
                            <div className="text-white text-xs mt-1 flex justify-between">
                            <span>{formatTime(videoRefs.current[video.id]!.currentTime)}</span>
                            <span>{formatTime(videoRefs.current[video.id]!.duration)}</span>
                            </div>
                         )}

                    </div>

                    <div className='flex justify-between w-full items-center mt-2'>
                        <button onClick={() => togglePlayPause(video.id)} className="text-white hover:text-gray-300">
                        {playingVideoId === video.id ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <div className="flex items-center gap-2">
                        <button onClick={() => toggleFullscreen(video.id)} className="text-white hover:text-gray-300">
                            <Maximize size={20} />
                        </button>
                        <button onClick={() => setVolume((prev) => (prev === 0 ? 1 : 0))} className="text-white">
                            {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20"
                        />
                        </div>
                    </div>
                </div>
                </div>

                {/* Video Information */}
                <div className="p-6 lg:w-full lg:self-center bg-[#0A192F] lg:bg-white">
                  <h2 className="text-2xl  font-semibold text-white lg:text-black lg:ml-7 mb-2">{video.title}</h2>
                  <p className="lg:text-black text-white text-sm  lg:ml-7 ">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDisplay;