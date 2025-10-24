import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FulltimeHoursInput from './components/FulltimeHoursInput.jsx'

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">Teilzeitausbildungsrechner</h1>
      <FulltimeHoursInput />
    </main>
  );
}

