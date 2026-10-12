import { useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Cloud,
  Layers3,
  PenTool,
  ShieldCheck,
  Smartphone,
  Workflow,
} from 'lucide-react'
import { type CSSProperties, type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './header'
import Footer from './footer'

type Item = {
  id: number
  name: string
  slug: string
  tagline: string
  shortDescription: string
  accentColor: string
  type: 'PRODUCT' | 'PROJECT'
  publicUrl?: string
}

type Stat = {
  id: number
  label: string
  value: number
  suffix: string
}

const serviceItems = [
  { icon: Code2, key: 's1' },
  { icon: Smartphone, key: 's2' },
  { icon: PenTool, key: 's3' },
  { icon: Workflow, key: 's4' },
  { icon: ShieldCheck, key: 's5' },
  { icon: Cloud, key: 's6' },
]

const steps = ['Discover', 'Design', 'Build', 'Test', 'Launch', 'Support']
const techStack = ['React', 'TypeScript', 'Java', 'Spring Boot', 'PostgreSQL', 'MariaDB', 'AWS', 'Docker']

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error('Could not load content')
  return r.json()
}

function CookieNotice() {
  const [choice, setChoice] = useState(localStorage.getItem('qiben-analytics-consent') || '')
  useEffect(() => {
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
    if (choice === 'yes' && domain && !document.querySelector('[data-qiben-analytics]')) {
      const s = document.createElement('script')
      s.defer = true
      s.dataset.domain = domain
      s.dataset.qibenAnalytics = 'true'
      s.src = 'https://plausible.io/js/script.js'
      document.head.append(s)
    }
  }, [choice])

  if (choice) return null
  return (
    <aside className="cookie-notice">
      <div>
        <b>Your privacy matters.</b>
        <span>Optional, privacy-friendly site analytics helps us improve. No advertising cookies.</span>
      </div>
      <button
        onClick={() => {
          localStorage.setItem('qiben-analytics-consent', 'yes')
          setChoice('yes')
        }}
      >
        Allow analytics
      </button>
      <button
        className="cookie-essential"
        onClick={() => {
          localStorage.setItem('qiben-analytics-consent', 'no')
          setChoice('no')
        }}
      >
        Essential only
      </button>
    </aside>
  )
}

export default function Site() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)

  useEffect(() => {
    document.title = 'Qiben Ltd | Software That Moves Your Business Forward'
  }, [])

  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => getJson<Item[]>('/api/public/products?featured=true'),
  })

  const stats = useQuery({
    queryKey: ['statistics'],
    queryFn: () => getJson<Stat[]>('/api/public/statistics'),
  })

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const r = await fetch('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (r.ok) {
      setSent(true)
      form.reset()
    } else {
      alert('We could not send your message. Please try again shortly.')
    }
  }

  const productItems = products.data?.length ? products.data : []

  return (
    <>
      <Header />
      <main id="top">
        {/* Hero Section */}
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> {t('hero.eyebrow')}
            </div>
            <h1>
              We build software that moves your business <span>forward.</span>
            </h1>
            <p className="hero-lede">{t('hero.lede')}</p>
            <div className="hero-actions">
              <Link to="/contact" className="button button-primary">
                {t('hero.ctaPrimary')} <ArrowRight size={17} />
              </Link>
              <Link to="/services" className="text-link">
                {t('hero.ctaSecondary')} <ArrowDown size={15} />
              </Link>
            </div>
            <div className="hero-note">
              <span className="signal-dot" /> {t('hero.note')}
            </div>
          </div>
          <div className="hero-art" aria-label="Abstract illustration of connected ideas">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-card card-back">
              <span className="mini-tag">IDEA</span>
              <div className="art-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="art-card card-front">
              <div className="card-window">
                <b />
                <b />
                <b />
              </div>
              <div className="code-lines">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="art-check">
                <Check size={22} />
              </div>
            </div>
            <div className="art-star">✳</div>
            <span className="art-label label-one">thoughtful by design</span>
            <span className="art-label label-two">built to work</span>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="trust-strip">
          <div className="wrap trust-inner">
            <span>
              LOCAL UNDERSTANDING.
              <br />
              <b>GLOBAL STANDARDS.</b>
            </span>
            <div className="trust-rule" />
            <span>Built in Rwanda, for ambitious teams everywhere.</span>
            <div className="trust-circles">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        {/* Who We Are & Services Section */}
        <section id="services" className="section wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> {t('services.eyebrow')}
              </div>
              <h2>{t('services.title')}</h2>
            </div>
            <p className="section-intro">{t('services.intro')}</p>
          </div>
          <div className="services-grid">
            {serviceItems.map((s, i) => {
              const title = t(`services.${s.key}_title` as any)
              const text = t(`services.${s.key}_desc` as any)
              return (
                <article className="service-card" key={s.key}>
                  <div className="service-top">
                    <span className="service-icon">
                      <s.icon size={20} />
                    </span>
                    <span className="card-index">0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link to="/services" aria-label={`Ask about ${title}`}>
                    <ArrowUpRight size={18} />
                  </Link>
                </article>
              )
            })}
          </div>
        </section>

        {/* Our Products & Work Section */}
        <section id="products" className="section section-tint">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> {t('work.eyebrow')}
                </div>
                <h2>{t('work.title')}</h2>
              </div>
              <p className="section-intro">{t('work.intro')}</p>
            </div>
            <div className="work-grid">
              {productItems.length ? (
                productItems.slice(0, 3).map((item) => (
                  <article
                    className="work-card"
                    key={item.id}
                    style={{ '--card-accent': item.accentColor || '#146c66' } as CSSProperties}
                  >
                    <div className="work-visual">
                      <div className="work-symbol">{item.name.slice(0, 1)}</div>
                      <span className="work-type">
                        {item.type === 'PRODUCT' ? t('work.productType') : t('work.projectType')}
                      </span>
                    </div>
                    <div className="work-meta">
                      <div>
                        <h3>{item.name}</h3>
                        <span className="work-tagline">{item.tagline}</span>
                      </div>
                      <Link to={`/products/${item.slug}`} aria-label={`View ${item.name}`}>
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                    <p>{item.shortDescription}</p>
                  </article>
                ))
              ) : (
                <article className="work-card placeholder-card">
                  <div className="work-visual">
                    <div className="work-symbol">✳</div>
                    <span className="work-type">PRODUCT PLACEHOLDER</span>
                  </div>
                  <div className="work-meta">
                    <div>
                      <h3>Product name to come</h3>
                      <span className="work-tagline">A short, clear product promise</span>
                    </div>
                    <ArrowUpRight size={18} />
                  </div>
                  <p>Finished product showcase. Add approved product branding and details in the Qiben admin.</p>
                </article>
              )}
            </div>
            <div className="center-link">
              <Link className="text-link" to="/products">
                {t('work.all')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Qiben & Approach */}
        <section id="about" className="section wrap why-section">
          <div className="why-visual">
            <div className="why-shape shape-large" />
            <div className="why-shape shape-small" />
            <div className="why-quote">
              <span>“</span>
              <p>{t('home.approachQuote')}</p>
              <i>{t('home.approachSubtitle')}</i>
            </div>
            <span className="why-cross">✳</span>
          </div>
          <div className="why-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> {t('home.whyEyebrow')}
            </div>
            <h2>{t('home.whyTitle')}</h2>
            <p>{t('home.whyIntro')}</p>
            <ul className="benefit-list">
              <li>
                <Check size={17} /> {t('home.benefit1')}
              </li>
              <li>
                <Check size={17} /> {t('home.benefit2')}
              </li>
              <li>
                <Check size={17} /> {t('home.benefit3')}
              </li>
              <li>
                <Check size={17} /> {t('home.benefit4')}
              </li>
            </ul>
          </div>
        </section>

        {/* Statistics Band */}
        <section className="stats-band">
          <div className="wrap stats-inner">
            {stats.data?.length ? (
              stats.data.slice(0, 4).map((s) => (
                <div className="stat" key={s.id}>
                  <strong>
                    {s.value}
                    <em>{s.suffix}</em>
                  </strong>
                  <span>{s.label}</span>
                </div>
              ))
            ) : (
              <div className="stats-placeholder">
                <span>{t('home.statsTrackRecord')}</span>
                <p>{t('home.statsPlaceholder')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Six-step Process */}
        <section className="section wrap process-section">
          <div className="section-head">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> {t('home.processEyebrow')}
              </div>
              <h2>{t('home.processTitle')}</h2>
            </div>
            <p className="section-intro">{t('home.processIntro')}</p>
          </div>
          <div className="process-row">
            {steps.map((s, i) => (
              <div className="process-step" key={s}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <b>{s}</b>
                {i < steps.length - 1 && <div className="process-connector" />}
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="tech-band">
          <div className="wrap tech-inner">
            <span>
              THE RIGHT TOOLS
              <br />
              <b>FOR THE JOB</b>
            </span>
            <div className="tech-list">
              {techStack.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Projects */}
        <section className="section wrap projects-section">
          <div className="section-head">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> {t('home.projectsEyebrow')}
              </div>
              <h2>{t('home.projectsTitle')}</h2>
            </div>
            <p className="section-intro">{t('home.projectsIntro')}</p>
          </div>
          <div className="project-placeholder">
            <Layers3 size={22} />
            <span>{t('home.projectsPlaceholder')}</span>
            <Link to="/contact">
              {t('home.discussProject')} <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* Partners & In Good Company */}
        <section className="partners-band">
          <div className="wrap partners-inner">
            <span>{t('home.partnersEyebrow')}</span>
            <div className="partner-placeholders">
              <span>Partner logo placeholder</span>
              <span>Client logo placeholder</span>
              <span>Partner logo placeholder</span>
              <span>Client logo placeholder</span>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section wrap quote-section">
          <div className="eyebrow">
            <span className="eyebrow-line" /> {t('home.testimonialsEyebrow')}
          </div>
          <div className="quote-placeholder">
            <span className="quote-mark">“</span>
            <p>{t('home.testimonialQuote')}</p>
            <div>
              <b>{t('home.testimonialAuthor')}</b>
              <span>{t('home.testimonialRole')}</span>
            </div>
            <div className="quote-dots">
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        {/* Final CTA Band */}
        <section className="cta-band">
          <div className="wrap cta-inner">
            <div>
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-line" /> {t('home.ctaEyebrow')}
              </div>
              <h2>{t('home.ctaTitle')}</h2>
            </div>
            <Link className="button button-light" to="/contact">
              {t('home.ctaButton')} <ArrowUpRight size={17} />
            </Link>
            <span className="cta-spark">✳</span>
          </div>
        </section>

        {/* Contact Form Section on Home */}
        <section id="contact" className="section wrap contact-section">
          <div className="contact-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> {t('home.contactEyebrow')}
            </div>
            <h2>{t('home.contactTitle')}</h2>
            <p>{t('home.contactIntro')}</p>
            <div className="contact-details">
              <div>
                <span>{t('home.emailLabel')}</span>
                <a href="mailto:hello@qiben.rw">hello@qiben.rw</a>
              </div>
              <div>
                <span>{t('home.phoneLabel')}</span>
                <a href="https://wa.me/250780000000">+250 780 000 000</a>
              </div>
              <div>
                <span>{t('home.locationLabel')}</span>
                <a href="https://maps.google.com/?q=Kigali+Rwanda" target="_blank" rel="noreferrer">
                  Rwanda · office address placeholder <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
            <a className="whatsapp" href="https://wa.me/250780000000" target="_blank" rel="noreferrer">
              {t('home.whatsappCta')} <ArrowUpRight size={15} />
            </a>
          </div>

          <form className="contact-form" onSubmit={submit}>
            <div className="form-row">
              <label>
                {t('contact.nameLabel')}
                <input required name="name" autoComplete="name" placeholder="Name" minLength={2} maxLength={120} />
              </label>
              <label>
                {t('contact.emailLabel')}
                <input required name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} />
              </label>
            </div>
            <label>
              {t('contact.subjectLabel')}
              <input required name="subject" placeholder="What would you like to work on?" maxLength={180} />
            </label>
            <label>
              {t('contact.messageLabel')}
              <textarea
                required
                name="message"
                placeholder="A little context helps us get back to you with the right questions."
                rows={5}
                minLength={10}
                maxLength={5000}
              />
            </label>
            <label className="honeypot" aria-hidden="true">
              Leave this field empty
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="form-submit">
              <button className="button button-primary" type="submit">
                {t('contact.submit')} <ArrowRight size={17} />
              </button>
              <small>{sent ? t('contact.success') : t('contact.notice')}</small>
            </div>
          </form>
        </section>
      </main>

      <Footer />
      <CookieNotice />
    </>
  )
}
