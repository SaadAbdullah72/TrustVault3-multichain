import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Languages, Palette, Check, ChevronDown } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

const themes = [
  { id: 'business', name: 'Dark', colors: 'bg-slate-900' },
  { id: 'emerald', name: 'Light', colors: 'bg-emerald-500' },
  { id: 'luxury', name: 'Premium', colors: 'bg-neutral-focus' },
]

export default function SettingsSwitcher() {
  const { t, i18n } = useTranslation()
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'business')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
    localStorage.setItem('theme', currentTheme)
  }, [currentTheme])

  const changeLanguage = (lngCode: string) => {
    i18n.changeLanguage(lngCode)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Language Switcher */}
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 normal-case font-normal border-white/10 hover:bg-white/5">
          <Languages size={16} className="text-white/60" />
          <span className="hidden sm:inline text-white/80">{languages.find(l => l.code === i18n.language.split('-')[0])?.name || 'English'}</span>
          <ChevronDown size={14} className="text-white/40" />
        </label>
        <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-2xl bg-base-200 border border-white/10 rounded-box w-48 mt-2 animate-in fade-in slide-in-from-top-2">
          <li className="menu-title px-4 py-2 text-xs uppercase tracking-wider opacity-50">{t('language')}</li>
          {languages.map((lang) => (
            <li key={lang.code}>
              <button 
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center justify-between hover:bg-white/5 active:bg-primary/20 ${i18n.language.startsWith(lang.code) ? 'text-primary font-bold' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {i18n.language.startsWith(lang.code) && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Theme Switcher */}
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 normal-case font-normal border-white/10 hover:bg-white/5">
          <Palette size={16} className="text-white/60" />
          <span className="hidden sm:inline text-white/80">{themes.find(t => t.id === currentTheme)?.name || 'Theme'}</span>
          <ChevronDown size={14} className="text-white/40" />
        </label>
        <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-2xl bg-base-200 border border-white/10 rounded-box w-48 mt-2 animate-in fade-in slide-in-from-top-2">
          <li className="menu-title px-4 py-2 text-xs uppercase tracking-wider opacity-50">{t('theme')}</li>
          {themes.map((theme) => (
            <li key={theme.id}>
              <button 
                onClick={() => setCurrentTheme(theme.id)}
                className={`flex items-center justify-between hover:bg-white/5 active:bg-primary/20 ${currentTheme === theme.id ? 'text-primary font-bold' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${theme.colors} border border-white/10`}></div>
                  <span>{theme.name}</span>
                </div>
                {currentTheme === theme.id && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
