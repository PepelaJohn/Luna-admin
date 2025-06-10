'use client'
import { useAuth } from '@/context/AuthContext'
import React from 'react'

const page = () => {
    const {user} = useAuth()
    
  return (
    <div>Admin protected route</div>
  )
}

export default page