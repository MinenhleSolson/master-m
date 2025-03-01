// MusicDisplay.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from "firebase/firestore";
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import useAudioPlayer from './useAudioPlayer';

interface Song {
  title: string;
  artist: string;
  audioUrl: string;
  id: string;
  artwork: string;
}

interface MusicItem {
  name: string;
  artwork: string;
  songs: Omit<Song, "artwork">[];
}

const MusicDisplay: React.FC = () => {
  const [albums, setAlbums] = useState<MusicItem[]>([]);
  const [eps, setEPs] = useState<MusicItem[]>([]);
  const [singles, setSingles] = useState<Song[]>([]);

  const {
    currentPlayingSongId,
    progress,
    volume,
    play,
    pause,
    seek,
    setAudioVolume,
    isPlaying,
  } = useAudioPlayer();

    useEffect(() => {
    const fetchMusic = async () => {
      const fetchCollection = async (collectionName: string, isSingles = false): Promise<MusicItem[] | Song[]> => {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const items = querySnapshot.docs.map((doc) => doc.data() as MusicItem);

        if (isSingles) {
          let flattenedSingles: Song[] = [];
          items.forEach((item, itemIndex) => {
            item.songs.forEach((song, songIndex) => {
              const uniqueId = `${collectionName}-${itemIndex}-${songIndex}-${Date.now()}-${Math.random()}`;
              flattenedSingles.push({ ...song, id: uniqueId, artwork: item.artwork });
            });
          });
          return flattenedSingles;
        } else {
          return items.map(item => ({
            ...item,
            songs: item.songs.map(song => ({ ...song, id: `${item.name}-${item.songs.indexOf(song)}` })),
          }));
        }
      };

      setAlbums(await fetchCollection('album') as MusicItem[]);
      setEPs(await fetchCollection('ep') as MusicItem[]);
      setSingles(await fetchCollection('singles', true) as Song[]);
    };

    fetchMusic();
  }, []);



  const handlePlayPause = (songId: string, audioUrl: string) => {
    if (isPlaying && currentPlayingSongId === songId) {
      pause();
    } else {
      play(songId, audioUrl);
    }
  };

  const renderMusicPlayer = (song: Song | Omit<Song, "artwork">) => {
    const isThisSongPlaying = currentPlayingSongId === song.id;
    return (
      <div className="bg-[#0A192F] text-white p-3 rounded-lg shadow-lg flex flex-col gap-2">
        <h3 className="text-base font-semibold">{song.title}</h3>
        <p className="text-xs text-gray-400">{song.artist}</p>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePlayPause(song.id, song.audioUrl)}
            className="p-1 bg-gray-800 rounded-full hover:bg-gray-700 transition"
          >
            {isThisSongPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={isThisSongPlaying ? progress : 0}
            onChange={(e) => isThisSongPlaying && seek(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-full appearance-none" // Added styling
            disabled={!isThisSongPlaying}
          />

          {/* Volume Control */}
          <button className="p-1">
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
            className="w-12 h-1 bg-gray-700 rounded-full appearance-none"  // Added styling
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white  min-h-screen"> {/* Added background and min-height */}
      <div className="container mx-auto p-5 max-w-6xl">
        
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6"> {/* Responsive grid */}
          {/* Albums */}
          {albums.map((album) => (
            <div key={album.name} className="p-2">
              <div className="bg-[#112240] text-white p-4 rounded-lg shadow-lg">
                <img src={album.artwork} alt={album.name} className="w-full aspect-square object-cover mb-4 rounded-lg" /> {/* Aspect ratio and object-cover */}
                <h3 className="text-lg font-semibold">{album.name}</h3>
                {album.songs.map((song) => (
                  <div key={song.id} className="mt-2">
                    {renderMusicPlayer(song)}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* EPs */}
          {eps.map((ep) => (
            <div key={ep.name} className="p-2">
              <div className="bg-[#112240] text-white p-4 rounded-lg shadow-lg">
                <img src={ep.artwork} alt={ep.name} className="w-full aspect-square object-cover mb-4 rounded-lg" /> {/* Aspect ratio and object-cover */}
                <h3 className="text-lg font-semibold">{ep.name}</h3>
                {ep.songs.map((song) => (
                  <div key={song.id} className="mt-2">
                    {renderMusicPlayer(song)}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Singles */}
          {singles.map((song) => (
            <div key={song.id} className="p-2">
              <div className="bg-[#112240] text-white p-4 rounded-lg shadow-lg">
                <img src={song.artwork} alt={song.title} className="w-full aspect-square object-cover mb-4 rounded-lg" /> {/* Aspect ratio and object-cover */}
              
                <div className="mt-2">
                  {renderMusicPlayer(song)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicDisplay;