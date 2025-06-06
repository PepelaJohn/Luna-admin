import Image from 'next/image'
import { Button } from './ui/button'
import { Headphones, ShoppingBag, Play, Calendar, Users, Clock, Award, Star, ChevronRight, Volume2 } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background with multiple visual elements */}
      <div className="absolute inset-0">
        <Image
          src="/image.png"
          alt="Background Image"
          fill
          priority
          className="object-cover object-center opacity-60"
        />
        {/* Rich gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/90 to-black"></div>
        
        {/* Visual pattern overlay */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-center opacity-10"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-red-600/20 blur-xl"></div>
      <div className="absolute right-20 top-40 h-40 w-40 rounded-full bg-orange-500/10 blur-xl"></div>
      <div className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-red-700/20 blur-xl"></div>
      
      {/* Audio wave animation - top */}
      <div className="absolute left-0 right-0 top-12 flex justify-center opacity-20">
        <div className="flex space-x-1">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="h-8 w-1 animate-pulse rounded-full bg-red-500"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.8 + Math.random() * 1}s`,
                height: `${10 + Math.random() * 20}px`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Content container */}
      <div className="container relative z-10 mx-auto grid min-h-screen grid-cols-1 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Main content - left column */}
        <div className="flex flex-col justify-center">
          {/* Logo and badge */}
          <div className="mb-6 flex items-center">
            <div className="relative mr-4">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-red-400 to-red-700 opacity-75 blur"></div>
              <Image
                src="/image.png"
                alt="Iko Nini Podcast Logo"
                width={100}
                height={100}
                className="relative rounded-full border-2 border-white/30 shadow-2xl"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center rounded-full bg-red-600/20 px-3 py-1 text-xs font-medium text-red-300">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Top-Rated Podcast in Kenya
              </div>
              <h2 className="text-sm font-semibold text-white/70">EST. 2023</h2>
            </div>
          </div>
          
          {/* Main headline */}
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">Iko Nini</span>
            <span className="block bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Podcast
            </span>
          </h1>
          
          <p className="mb-6 max-w-md text-lg text-white/80 sm:text-xl">
            Kenya's premier podcast exploring culture, politics, and everyday life with engaging conversations and unique perspectives.
          </p>
          
          {/* Stats row */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Calendar, label: "500+ Episodes" },
              { icon: Users, label: "1M+ Listeners" },
              { icon: Award, label: "Award Winning" },
              { icon: Star, label: "4.9★ Rating" }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="flex items-center rounded-lg bg-white/5 p-3 backdrop-blur-sm"
              >
                <stat.icon className="mr-2 h-4 w-4 text-red-400" />
                <p className="text-sm font-medium text-white/90">{stat.label}</p>
              </div>
            ))}
          </div>
          
          {/* CTA buttons */}
          <div className="mb-8 flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-red-600 px-6 py-5 text-base font-medium text-white transition-all hover:bg-red-700"
            >
              <span className="relative z-10 flex items-center">
                <Headphones className="mr-2 h-5 w-5" />
                Listen Now
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 -translate-y-full bg-gradient-to-b from-white/20 to-transparent transition-transform group-hover:translate-y-0"></span>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 px-6 py-5 text-base font-medium text-white backdrop-blur-sm hover:border-white hover:bg-white/10"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Shop Merch
            </Button>
          </div>
          
          {/* Platforms */}
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-white/60">
              Available on:
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "Spotify", "Apple Podcasts", "Google Podcasts", "YouTube"
              ].map((platform, index) => (
                <div 
                  key={index} 
                  className="flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
                >
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right column - featured episodes and visual elements */}
        <div className="mt-10 flex items-center lg:mt-0">
          <div className="w-full space-y-4">
            {/* "Now Playing" element */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-md">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/20 blur-xl"></div>
              <div className="p-5">
                <div className="mb-3 flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-400">NOW STREAMING</p>
                    <h3 className="text-lg font-bold text-white">Latest Episode</h3>
                  </div>
                </div>
                
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <div className="aspect-video overflow-hidden rounded-lg bg-gray-900">
                    <Image
                      src="/placeholder.svg?height=400&width=700"
                      alt="Episode Cover"
                      width={700}
                      height={400}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                        <Play className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="mb-2 text-xl font-bold text-white">
                  Exploring Kenyan Music Evolution
                </h3>
                <p className="mb-4 text-sm text-white/80">
                  Join us as we dive into the rich history and exciting future of Kenyan music with special guest artist Nyashinski.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-white/60">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>45 min</span>
                    </div>
                    <span>•</span>
                    <div>Apr 28, 2025</div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-red-600/80 text-white hover:bg-red-600"
                  >
                    Play Now
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Episode playlist */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
              <h3 className="mb-4 text-lg font-bold text-white">Popular Episodes</h3>
              <div className="space-y-3">
                {[
                  {
                    title: "The Future of Tech in Kenya",
                    duration: "38 min",
                    date: "Apr 21, 2025"
                  },
                  {
                    title: "Kenyan Cuisine Around the World",
                    duration: "42 min",
                    date: "Apr 14, 2025"
                  },
                  {
                    title: "Political Landscape Analysis",
                    duration: "55 min", 
                    date: "Apr 7, 2025"
                  }
                ].map((episode, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3 backdrop-blur-sm hover:bg-white/10">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                        <Play className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{episode.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-white/60">
                          <span>{episode.duration}</span>
                          <span>•</span>
                          <span>{episode.date}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-white hover:bg-white/20">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio wave animation - bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-30">
        <div className="flex space-x-1">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="h-12 w-1 animate-pulse rounded-full bg-red-600"
              style={{ 
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${0.6 + Math.random() * 1.2}s`,
                height: `${8 + Math.random() * 24}px`
              }}
            ></div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero