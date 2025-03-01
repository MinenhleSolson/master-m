// components/MusicPlayer.tsx
'use client';

import { useState, useEffect, useRef } from "react";
// import { fetchSongs } from "@/lib/firebase"; //  IMPORT DIRECTLY
import { db } from "@/lib/firebase"; // Import your Firebase configuration
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader2 } from "lucide-react";
import Image from 'next/image';

// Define a type for the song object
interface Song {
    id: string;
    title: string;
    artist: string;
    songURL: string; // Corrected: This should match your Firestore data
    artworkURL: string;
}

const MusicPlayer = () => {
    const [songs, setSongs] = useState<Song[]>([]); // Use the Song type here
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [durations, setDurations] = useState<number[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState<string | null>(null); // Add error state


    useEffect(() => {
        const getSongs = async () => {
            setLoading(true);
            setError(null);
            try {
                const songsCollection = query(collection(db, "songs"), orderBy("timestamp", "desc")); // Assuming a 'songs' collection.  Add ordering.
                const querySnapshot = await getDocs(songsCollection);

                const songsData: Song[] = [];  // Explicitly type as Song[]
                querySnapshot.forEach((doc) => {
                  // Correctly cast doc.data() to the expected structure *before* mapping
                  const docData = doc.data() as { title?: string; artist?: string; songURL?: string; artworkURL?: string; timestamp?: any };

                  songsData.push({
                        id: doc.id, // Always include the ID
                        title: docData.title || "Unknown Title",
                        artist: docData.artist || "Unknown Artist",
                        songURL: docData.songURL || "",  // Corrected: Use audioUrl
                        artworkURL: docData.artworkURL || "",
                    });
                });
                setSongs(songsData);
                setDurations(new Array(songsData.length).fill(0));  // Initialize durations
            } catch (error) {
                console.error("Error fetching songs:", error);
                setError("Failed to load songs: " + error); // Set error message

            } finally {
                setLoading(false);
            }
        };
        getSongs();
    }, []);

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play();
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying, currentSongIndex, songs]); // Add songs to dependency array

    const handleNext = () => {
        setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    };

    const handlePrevious = () => {
        setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    };

    const handleSelectSong = (index: number) => {
        setCurrentSongIndex(index);
        setIsPlaying(true);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        setMuted(!muted);
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const volume = parseFloat(e.target.value);
        setVolume(volume);
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
          const newDurations = [...durations];
            newDurations[currentSongIndex] = audioRef.current.duration;
            setDurations(newDurations);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
        setCurrentTime(time);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    // Handle loading and error states
    if (loading) {
        return <div className="text-black flex justify-center items-center">Loading songs... <Loader2 className='ml-2 animate-spin'/></div>;
    }

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }

    if (songs.length === 0) {
        return <p className="text-black">No songs found.</p>;
    }


    return (
        <div className="bg-white w-[330px] text-black relative">
             <Image
                src={songs[currentSongIndex]?.artworkURL || '/placeholder-image.jpg'} // Use placeholder
                alt="Album Art"
                width={330}
                height={270}
                className="mx-auto mb-3 flex justify-start"
                onError={(e) => { // Handle image loading errors
                    e.currentTarget.src = '/placeholder-image.jpg'; // Set to placeholder
                }}

            />
            <h3 className="text-md font-bold ">{songs[currentSongIndex]?.title}</h3>
            <p className="text-xs text-gray-700">{songs[currentSongIndex]?.artist}</p>
            <audio
                ref={audioRef}
                src={songs[currentSongIndex]?.songURL}  // Use audioUrl
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleNext} // Automatically play the next song
            />

            <div className="flex my-3">
                <button onClick={handlePrevious} className="mr-2">
                    <SkipBack size={16} />
                </button>
                <button onClick={togglePlayPause} className="mx-2">
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={handleNext} className="ml-2">
                    <SkipForward size={16} />
                </button>
                <button onClick={toggleMute} className="ml-3">
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
            </div>

            <div className="flex items-center justify-between mb-3 text-xs">
                <span>{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={durations[currentSongIndex]?.toString() || "0"}
                    value={currentTime.toString()}
                    onChange={handleSeek}
                    className="w-full mx-2"
                />
                <span>{formatTime(durations[currentSongIndex] || 0)}</span>
            </div>

            <div className="flex items-center mb-3">
                <Volume2 size={16} className="mr-2" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume.toString()}
                    onChange={handleVolumeChange}
                    className="w-full"
                />
            </div>

            <div className="mt-3 text-left cursor-pointer text-sm">
                {songs.map((song, index) => (
                    <p
                        key={index}
                        className={`p-2 border-b border-gray-300 flex justify-between cursor-pointer ${
                          index === currentSongIndex ? "bg-gray-200" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleSelectSong(index)}
                    >
                        <span>{index + 1}. {song.title}</span>
                        <span>{formatTime(durations[index] || 0)}</span>
                    </p>
                ))}
            </div>
        </div>
    );
};

export default MusicPlayer;