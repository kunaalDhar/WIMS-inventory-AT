'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import Image from 'next/image'
import logo from '@/public/wims-logo.png' // ✅ rename & place your uploaded PNG in /public

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] flex items-center justify-center flex-col px-6">
      {/* Background Mesh Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-[800px] h-[800px] bg-purple-300 rounded-full blur-[200px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-300 rounded-full blur-[180px] opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Intro + Logo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center space-y-6"
      >
        <Image
          src={logo}
          alt="WIMS Logo"
          width={100}
          height={100}
          className="mx-auto rounded-full shadow-lg"
        />
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-600 text-transparent bg-clip-text">
          WIMS
        </h1>
        <p className="text-lg text-gray-700 font-medium">
          Warehouse Inventory Management System
        </p>

        {!showLogin && (
          <motion.button
            onClick={() => setShowLogin(true)}
            className="mt-6 px-8 py-3 text-lg font-semibold rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Click to Explore
          </motion.button>
        )}
      </motion.div>

      {/* Login Panel Reveal */}
      {showLogin && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mt-10 w-full max-w-xl"
        >
          
        </motion.div>
      )}
    </div>
  )
}
