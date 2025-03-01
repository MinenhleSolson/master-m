import React from 'react'
import Header from '@/components/Header'
import MusicDisplay from '@/components/MusicDisplay'
import Footer from '@/components/Footer'

function page() {
  return (

    <div>
      <Header />
      <div className="bg-white text-center text-[#0A192F] " >
           <h1 className="text-7xl  font-bold p-5 ">MUSIC</h1> 
      </div>
   
      <div className="container mx-auto p-1 max-w-6xl " >
     
      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center">
        
          <div>
            <MusicDisplay />
          </div>
        
      
      </div>
    </div>
    <Footer />
    </div>
  )
}

export default page
