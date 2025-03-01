// useAudioPlayer.ts
'use client';

import { useState, useEffect, useRef } from 'react';

interface UseAudioPlayerProps {
  onSongEnd?: (songId: string) => void;
}

const useAudioPlayer = ({ onSongEnd }: UseAudioPlayerProps = {}) => {
  const [currentPlayingSongId, setCurrentPlayingSongId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1); // Global volume, simplified
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentPlayingSongId && audioRef.current) {
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
        }
      };

      audioRef.current.onended = () => {
        setCurrentPlayingSongId(null);
        setProgress(0);
        onSongEnd?.(currentPlayingSongId); // Notify component of song end
      };

      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        setCurrentPlayingSongId(null); // Reset on error
        setProgress(0);
      };
    }
  }, [currentPlayingSongId, onSongEnd]);


  const play = (songId: string, audioUrl: string) => {
    if (audioRef.current && currentPlayingSongId !== songId) {
       audioRef.current.pause(); // Pause current if any
       audioRef.current.src = audioUrl; // set new Source
       audioRef.current.load(); //load a new source
    } else if (!audioRef.current) {
        // Create for the first time
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = volume;
    }

    audioRef.current.play().then(() => {
            setCurrentPlayingSongId(songId)
    }).catch((error) => {
        console.error("Play Error", error);
        setCurrentPlayingSongId(null);
    });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setCurrentPlayingSongId(null);
    }
  };

  const seek = (percentage: number) => {
    if (audioRef.current) {
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  };

  const setAudioVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset to beginning
            setCurrentPlayingSongId(null);
            setProgress(0);
        }
    };

  return {
    currentPlayingSongId,
    progress,
    volume,
    play,
    pause,
    seek,
    setAudioVolume,
      stop,
    isPlaying: currentPlayingSongId !== null, //Helper,
    audioRef //expose it in case we need to do something directly
  };
};

export default useAudioPlayer;