import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Lock, ShieldCheck } from 'lucide-react'
import Header from './header'
import Footer from './footer'

export default function LegalPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')

  useEffect(() => {
    document.title = 'Privacy Policy & Terms of Use | Qiben Ltd'
    if (location.pathname.includes('terms') || location.hash === '#terms') {
      setActiveTab('terms')
      const el = document.getElementById('terms')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      setActiveTab('privacy')
      const el = document.getElementById('privacy')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.pathname, location.hash])

  return (
    <>
      <Header />
      <main className="wrap section" style={{ paddingTop: '50px' }}>
        <div className="section-head" style={{ marginBottom: '32px' }}>
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> LEGAL & TRANSPARENCY
            </div>
            <h2>Privacy & Terms</h2>
          </div>
          <p className="section-intro">{t('legal.lastUpdated')}</p>
        </div>

        {/* Anchor selector tabs */}
        <div className="legal-nav-tabs">
          <a
            href="#privacy"
            className={`legal-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Lock size={15} /> {t('legal.privacyTitle')}
          </a>
          <a
            href="#terms"
            className={`legal-tab ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            <FileText size={15} /> {t('legal.termsTitle')}
          </a>
        </div>

        <div className="legal-content-card">
          {/* Section 1: Privacy Policy */}
          <section id="privacy" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-tag">
                <ShieldCheck size={14} /> PRIVACY
              </span>
              <h3>{t('legal.privacyTitle')}</h3>
            </div>

            <p className="legal-intro">{t('legal.privacyIntro')}</p>

            <article className="legal-block">
              <h4>{t('legal.dataSectionTitle')}</h4>
              <p>{t('legal.dataSectionText')}</p>
            </article>

            <article className="legal-block">
              <h4>{t('legal.analyticsSectionTitle')}</h4>
              <p>{t('legal.analyticsSectionText')}</p>
            </article>

            <article className="legal-block">
              <h4>{t('legal.securitySectionTitle')}</h4>
              <p>{t('legal.securitySectionText')}</p>
            </article>

            <article className="legal-block">
              <h4>{t('legal.rightsSectionTitle')}</h4>
              <p>{t('legal.rightsSectionText')}</p>
            </article>
          </section>

          <div className="legal-divider" />

          {/* Section 2: Terms of Use */}
          <section id="terms" className="legal-section">
            <div className="legal-section-header">
              <span className="legal-tag">
                <FileText size={14} /> TERMS
              </span>
              <h3>{t('legal.termsTitle')}</h3>
            </div>

            <p className="legal-intro">{t('legal.termsIntro')}</p>

            <article className="legal-block">
              <h4>{t('legal.ipSectionTitle')}</h4>
              <p>{t('legal.ipSectionText')}</p>
            </article>

            <article className="legal-block">
              <h4>{t('legal.servicesSectionTitle')}</h4>
              <p>{t('legal.servicesSectionText')}</p>
            </article>

            <article className="legal-block">
              <h4>{t('legal.liabilitySectionTitle')}</h4>
              <p>{t('legal.liabilitySectionText')}</p>
            </article>

            <article className="legal-block">
              <h4>{t('legal.jurisdictionSectionTitle')}</h4>
              <p>{t('legal.jurisdictionSectionText')}</p>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
