'use client'

import { createContext, useContext } from 'react'

interface DashboardTheme {
  isLight: boolean
  toggleTheme: () => void
}

export const DashboardThemeContext = createContext<DashboardTheme>({
  isLight: false,
  toggleTheme: () => {},
})

export const useDashboardTheme = () => useContext(DashboardThemeContext)
