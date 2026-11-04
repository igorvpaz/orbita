'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const ThemeContext = createContext({
  theme: 'light' as Theme,
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => {
    const device = window.matchMedia('(prefers-color-scheme: dark)')
    function sync() {
      let saved: string | null = null
      try {
        saved = localStorage.getItem('orbita_theme')
      } catch {}
      const next =
        saved === 'dark' || saved === 'light'
          ? saved
          : device.matches
            ? 'dark'
            : 'light'
      document.documentElement.dataset.theme = next
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', next === 'dark' ? '#191b18' : '#fcfcfa')
      setTheme(next)
    }
    sync()
    device.addEventListener('change', sync)
    window.addEventListener('storage', sync)
    return () => {
      device.removeEventListener('change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  function toggle() {
    const next =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem('orbita_theme', next)
    } catch {}
    document.documentElement.dataset.theme = next
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#191b18' : '#fcfcfa')
    setTheme(next)
  }
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext)
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Modo escuro"
      aria-pressed={theme === 'dark'}
      title="Alternar entre modo claro e escuro"
    >
      <svg
        className="theme-sun"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </svg>
      <svg
        className="theme-moon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />
      </svg>
      <span className="theme-light-label">Modo claro</span>
      <span className="theme-dark-label">Modo escuro</span>
    </button>
  )
}
