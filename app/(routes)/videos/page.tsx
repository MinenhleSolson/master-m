import React from 'react'
import Header from '@/components/Header'
import VideoDisplay from '@/components/VideoDisplay'

function page() {
  return (
    <div>
      <Header />
      <div className="bg-[white] text-[#0A192F] text-center " >
           <h1 className="text-7xl  font-bold p-5 ">VIDEOS</h1> 
      </div>
      <VideoDisplay />
    </div>
  )
}

export default page
