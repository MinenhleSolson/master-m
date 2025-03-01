'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface HomeData { // Use the same interface
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

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<HomeData['socialLinks'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchSocialLinks = async () => {
        setLoading(true);
        setError(null);
      try {
        const docRef = doc(db, 'home', 'settings'); // Use the same fixed document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as HomeData;
          setSocialLinks(data.socialLinks);
        } else {
          setError('No social links found.');
        }
      } catch (error: any) {
        console.error('Error fetching social links:', error);
        setError('Failed to load social links: ' + error.message);
      } finally {
          setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);



  return (
    <div>
    <nav className="w-full px-6 py-8 bg-[#0A192F] text-white flex items-center justify-between">
      {/* Left: Artist Name */}
     <Link href="/"><h1 className="text-4xl font-bold font-libre">MASTER M</h1></Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex space-x-6 text-lg font-raleway">
        <Link href="/" className="hover:text-gray-400">HOME</Link>
        <Link href="/music" className="hover:text-gray-400 ">MUSIC</Link>
        <Link href="/videos" className="hover:text-gray-400">VIDEOS</Link>
        <Link href="/booking" className="hover:text-gray-400">BOOKING</Link>
      </div>


      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Menu className="w-7 h-7" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#0A192F] text-white">
            {/* ✅ Add Header for Accessibility */}
            <SheetHeader>
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col space-y-6 text-lg mt-4">
              <Link href="/" className="hover:text-gray-400" onClick={() => setOpen(false)}>HOME</Link>
              <Link href="/music" className="hover:text-gray-400" onClick={() => setOpen(false)}>MUSIC</Link>
              <Link href="/videos" className="hover:text-gray-400" onClick={() => setOpen(false)}>VIDEOS</Link>
              <Link href="/booking" className="hover:text-gray-400" onClick={() => setOpen(false)}>BOOKING</Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
    </nav>
    <div className="md:hidden bg-[#0A192F] py-6 px-4 border border-[#0A192F]">
        {loading ? (
            <div className="flex justify-center items-center">
               <Loader2 className='animate-spin' size={24}/>
            </div>
        ) : error ? (
             <div className="text-red-500 text-center">Error: {error}</div>
        ) : (
        <div className="flex justify-around items-center">
           {socialLinks && (
            <>
                <a href={socialLinks.youtubeMusic || '#'} aria-label="YouTube Music" className="hover:opacity-75">
                    <img src="/assets/youtubeMusicWhite.svg" alt="YouTube Music" className="w-9 h-9" />
                </a>
                <a href={socialLinks.spotify || '#'} aria-label="Spotify" className="hover:opacity-75">
                    <img src="/assets/whitespotify.svg" alt="Spotify" className="w-9 h-9" />
                </a>
                <a href={socialLinks.appleMusic || '#'} aria-label="Apple Music" className="hover:opacity-75">
                    <img src="/assets/white-apple-music.svg" alt="Apple Music" className="w-9 h-9" />
                </a>
                <a href={socialLinks.instagram || '#'} aria-label="Instagram" className="hover:opacity-75">
                    <img src="/assets/instagramWhite.svg" alt="Instagram" className="w-9 h-9" />
                </a>
                <a href={socialLinks.youtube || '#'} aria-label="YouTube" className="hover:opacity-75">
                    <img src="/assets/youtubeWhite.svg" alt="YouTube" className="w-9 h-9" />
                </a>
                <a href={socialLinks.facebook || '#'} aria-label="Facebook" className="hover:opacity-75">
                    <img src="/assets/facebookWhite.svg" alt="Facebook" className="w-9 h-9" />
                </a>
                <a href={socialLinks.tiktok || '#'} aria-label="TikTok" className="hover:opacity-75">
                    <img src="/assets/tiktokWhite.svg" alt="TikTok" className="w-9 h-9" />
                </a>
            </>
           )}
        </div>
        )}
    </div>
    </div>
  );
};

export default Navbar;