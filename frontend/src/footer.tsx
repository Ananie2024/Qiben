import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

function Newsletter() {
  const [done, setDone] = useState(false)
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    const email = new FormData(f).get('email')
    const r = await fetch('/api/public/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (r.ok) {
      setDone(true)
      f.reset()
    }
  }

  return (
    <form className="newsletter" onSubmit={send}>
      <label htmlFor="newsletter-email">
        {done ? 'Thanks for staying in touch.' : 'Occasional updates from Qiben.'}
      </label>
      <div>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          maxLength={254}
          placeholder="Your email address"
        />
        <button aria-label="Subscribe to updates">
          <ArrowRight size={15} />
        </button>
      </div>
    </form>
  )
}

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="footer">
      <div className="wrap footer-main">
        <Link className="brand brand-footer" to="/" aria-label="Qiben home">
          <span className="brand-mark">q</span>
          <span>
            qiben<span className="brand-dot">.</span>
          </span>
        </Link>
        <p>{t('footer.tagline')}</p>
        <div className="footer-nav">
          <Link to="/services">{t('nav.services')}</Link>
          <Link to="/products">{t('nav.work')}</Link>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/contact">{t('nav.contact')}</Link>
        </div>
        <div className="footer-social">
          <span>FOLLOW ALONG</span>
          <a href="https://www.linkedin.com/company/qiben" target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={13} />
          </a>
          <a href="https://instagram.com/qiben" target="_blank" rel="noreferrer">
            Instagram <ArrowUpRight size={13} />
          </a>
        </div>
        <Newsletter />
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Qiben Ltd. {t('footer.rights')}</span>
        <Link to="/privacy">{t('footer.privacy')}</Link>
        <Link to="/admin">{t('footer.teamSignIn')}</Link>
        <span>
          {t('footer.kigali')} <span className="footer-heart">✳</span>
        </span>
      </div>
    </footer>
  )
}
