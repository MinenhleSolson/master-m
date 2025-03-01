// components/Footer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface HomeData {
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

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<HomeData['socialLinks'] | null>(null);
  const [recordLabel, setRecordLabel] = useState<string | null>(null); // Add state for record label
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'home', 'settings');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as HomeData;
          setSocialLinks(data.socialLinks);
          setRecordLabel(data.recordLabel); // Set the record label
        } else {
          setError('No data found.');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Failed to load data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <footer className="bg-[#112240] text-white py-6 p-11 flex justify-center items-center">
        <Loader2 className="animate-spin" size={24} />
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="bg-[#112240] text-white py-6 p-11">
        <div className="container mx-auto text-center text-red-500">
          Error: {error}
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#112240] text-white py-6 p-11">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Logo or Brand Name and Record Label */}
        <div className="text-center md:text-left">
          <h4 className="text-xl font-bold">{recordLabel || 'Record Label'}</h4> {/* Display recordLabel */}
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} {recordLabel || 'Record Label'}. All rights reserved.</p>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center space-x-4">
          {socialLinks && (
            <>
              <a href={socialLinks.youtubeMusic || '#'} aria-label="YouTube Music" className="hover:opacity-75">
                <img src="/assets/youtubeMusicWhite.svg" alt="YouTube Music" className="w-6 h-6" />
              </a>
              <a href={socialLinks.spotify || '#'} aria-label="Spotify" className="hover:opacity-75">
                <img src="/assets/whitespotify.svg" alt="Spotify" className="w-6 h-6" />
              </a>
              <a href={socialLinks.appleMusic || '#'} aria-label="Apple Music" className="hover:opacity-75">
                <img src="/assets/white-apple-music.svg" alt="Apple Music" className="w-6 h-6" />
              </a>
              <a href={socialLinks.instagram || '#'} aria-label="Instagram" className="hover:opacity-75">
                <img src="/assets/instagramWhite.svg" alt="Instagram" className="w-6 h-6" />
              </a>
              <a href={socialLinks.youtube || '#'} aria-label="YouTube" className="hover:opacity-75">
                <img src="/assets/youtubeWhite.svg" alt="YouTube" className="w-6 h-6" />
              </a>
              <a href={socialLinks.facebook || '#'} aria-label="Facebook" className="hover:opacity-75">
                <img src="/assets/facebookWhite.svg" alt="Facebook" className="w-6 h-6" />
              </a>
              <a href={socialLinks.tiktok || '#'} aria-label="TikTok" className="hover:opacity-75">
                <img src="/assets/tiktokWhite.svg" alt="TikTok" className="w-6 h-6" />
              </a>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;