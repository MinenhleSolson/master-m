'use client'

import React, { useEffect, useState } from 'react'
import { fetchSongs } from "@/lib/firebase";
import Header from '@/components/Header'
import Image from 'next/image'
import { Facebook, Youtube, Instagram } from 'lucide-react'
import MusicPlayer from '@/components/MusicPlayer';
import Home from '@/components/Home';
import Footer from '@/components/Footer';

function Page() {



  

  return (
    <div>
      
      <Header />
      <Home />
      <Footer />

    </div>
  )
}

export default Page
