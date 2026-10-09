import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Globe, Menu, Moon, Sun, X } from 'lucide-react'

export default function Header() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [dark, setDark] = useState(() => localStorage.getItem('qiben-theme') === 'dark')
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('qiben-theme', dark ? 'dark' : 'light')
  }, [dark])

  // Close mobile menu on route change
  useEffect(() => {
    setMenu(false)
  }, [location.pathname])

  const toggleLang = () => {
    const next = i18n.language.startsWith('fr') ? 'en' : 'fr'
    i18n.changeLanguage(next)
    localStorage.setItem('qiben-lang', next)
    document.documentElement.lang = next
  }

  return (
    <header className="header">
      <Link className="brand" to="/" aria-label="Qiben home">
        <span className="brand-mark">q</span>
        <span>
          qiben<span className="brand-dot">.</span>
        </span>
      </Link>
      <nav className={menu ? 'nav open' : 'nav'}>
        <Link to="/services">{t('nav.services')}</Link>
        <Link to="/products">{t('nav.work')}</Link>
        <Link to="/about">{t('nav.about')}</Link>
        <Link to="/contact">{t('nav.contact')}</Link>
        <Link className="nav-cta" to="/contact">
          {t('nav.talk')} <ArrowUpRight size={15} />
        </Link>
      </nav>
      <div className="head-actions">
        <button
          className="icon-btn lang-btn"
          onClick={toggleLang}
          aria-label="Switch language"
          title={`Language: ${i18n.language.toUpperCase()}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
        >
          <Globe size={16} />
          <span>{i18n.language.startsWith('fr') ? 'FR' : 'EN'}</span>
        </button>
        <button
          className="icon-btn theme-btn"
          onClick={() => setDark(!dark)}
          aria-label="Toggle light or dark theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="icon-btn menu-btn"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle navigation"
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
