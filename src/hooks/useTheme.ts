'use client'

import { useState, useEffect } from 'react'
import { useThemeContext } from '../components/ThemeProvider'

export function useTheme() {
  const { theme, setTheme } = useThemeContext()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    setTheme,
    toggleTheme
  }
}