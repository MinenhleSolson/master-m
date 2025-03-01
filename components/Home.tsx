'use client';

import React, { useEffect, useState } from 'react';
import { db } from "@/lib/firebase"; // Import your Firebase configuration
import { doc, getDoc } from "firebase/firestore";

import { Loader2 } from 'lucide-react';
import MusicPlayer from '@/components/MusicPlayer';

interface HomeData { // Interface from HomeSettings
    latestSongTitle: string;
    latestSongDescription: string;
    recordLabel: string;
    socialLinks: {
        youtubeMusic: string;
        spotify: string;
        appleMusic: string;
        instagram: string;
        youtube: string;
        facebook: string;
        tiktok: string;
    };
}

function Home() {
//   const [songs, setSongs] = useState<any[]>([]); // Not used anymore
  const [socialLinks, setSocialLinks] = useState<HomeData['socialLinks'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [homeData, setHomeData] = useState<HomeData | null>(null);


  useEffect(() => {
    const getHomeData = async () => {
        setLoading(true);
        setError(null);
      try {
        const docRef = doc(db, 'home', 'settings'); //  fixed document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as HomeData; // Use HomeData interface
          setHomeData(data); // Store all home data
          setSocialLinks(data.socialLinks);
        } else {
          setError('No home data found.');
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
        setError('Failed to load home data: ' + error);
      } finally {
          setLoading(false);
      }
    };

    getHomeData();
  }, []);

    if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }


  return (
    <>
     
      <div className="flex flex-col md:flex-row md:h-screen">
        {/* Left Section - Artist Image & Info */}
        <div
          className="md:relative md:w-1/2 w-full h-screen md:h-full flex items-center justify-center text-white p-10"
          style={{
            backgroundImage: "url('/assets/musician.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="md:absolute md:top-0 md:left-0 md:p-6 text-center">
           {homeData && (
            <>
              <h3 className="text-3xl font-bold md:text-[#0A192F]">OUT NOW</h3>
              <h2 className="text-4xl font-bold">{homeData.latestSongTitle}</h2>
              <p className="mt-2 text-[#ffffff]">{homeData.latestSongDescription}</p>
            </>
           )}
            <button className="mt-4 bg-[#0A192F] px-4 py-2 rounded">Explore</button>
          </div>
        </div>

        {/* Right Section - Album Player & Social Icons */}
        <div className="md:w-1/2 w-full h-1/2 md:h-full flex flex-col justify-center items-center p-6 ">
          {/* Music Player */}
          <div className="bg-white p-10 rounded-lg md:max-w-fit md:border-none text-black">
            <MusicPlayer />
          </div>

          {/* Social Icons (Hidden on Mobile) */}
          <div className="hidden md:flex flex-col absolute right-4 top-1/2 transform -translate-y-1/2 space-y-4 text-black">
           {socialLinks && (
            <>
                <a href={socialLinks.youtubeMusic || '#'} aria-label="YouTube Music" className="hover:opacity-75">
                <img src="/assets/youtubeMusicBlack.svg" alt="YouTube Music" className="w-6 h-6" />
                </a>
                <a href={socialLinks.spotify || '#'} aria-label="Spotify" className="hover:opacity-75">
                <img src="/assets/spotifyBlack.svg" alt="Spotify" className="w-6 h-6" />
                </a>
                <a href={socialLinks.appleMusic || '#'} aria-label="Apple Music" className="hover:opacity-75">
                <img src="/assets/appleMusicBlack.svg" alt="Apple Music" className="w-6 h-6" />
                </a>
                <a href={socialLinks.instagram || '#'} aria-label="Instagram" className="hover:opacity-75">
                <img src="/assets/instagramBlack.svg" alt="Instagram" className="w-6 h-6" />
                </a>
                <a href={socialLinks.youtube || '#'} aria-label="YouTube" className="hover:opacity-75">
                <img src="/assets/youtubeBlack.svg" alt="YouTube" className="w-6 h-6" />
                </a>
                <a href={socialLinks.facebook || '#'} aria-label="Facebook" className="hover:opacity-75">
                <img src="/assets/facebookBlack.svg" alt="Facebook" className="w-6 h-6" />
                </a>
                <a href={socialLinks.tiktok || '#'} aria-label="TikTok" className="hover:opacity-75">
                <img src="/assets/tiktokBlack.svg" alt="TikTok" className="w-6 h-6" />
                </a>
            </>
           )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;