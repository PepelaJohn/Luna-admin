'use client'
import { ThemeProvider } from "@/components/theme-provider";



export default function Home() {
  return (
    <ThemeProvider>
    
    <div className="flex min-h-screen justify-center items-center flex-col">
    
    <h1 className="text-lg">Welcome to the admin dashboard for Luna</h1>
    </div>
    </ThemeProvider>
  )
}
