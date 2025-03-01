'use client'
// app/admin/page.tsx (or your admin route file)
import React from 'react';
import dynamic from 'next/dynamic'; // Import dynamic

const MusicUpload = dynamic(() => import('@/components/MusicUpload'), { ssr: false });
const VideoUpload = dynamic(() => import('@/components/VideoUpload'), { ssr: false });
const TopSongsUpload = dynamic(() => import('@/components/TopSongsUpload'), { ssr: false });
const HomeSettings = dynamic(() => import('@/components/HomeSettings'), { ssr: false });


function Page() {
  return (
    <div className="bg-[#102d63] min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Upload Content</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <MusicUpload />
          <VideoUpload />
          <TopSongsUpload />
          <HomeSettings/>
    
        </div>
      </div>
    </div>
  );
}

export default Page;