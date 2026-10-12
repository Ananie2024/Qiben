import { useState, useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  ArrowUpRight,
  
  Check,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react'
import Header from './header'
import Footer from './footer'

const serviceOptions = [
  'Custom software development',
  'Web & mobile apps',
  'UI/UX design',
  'API development & integration',
  'QA testing & automation',
  'Cloud & DevOps',
]

const budgetOptions = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $30,000',
  '$30,000 – $60,000',
  '$60,000+',
  'Flexible / Not specified',
]

const timelineOptions = [
  'Urgent (< 1 month)',
  '1 – 3 months',
  '3 – 6 months',
  '6+ months',
  'Flexible discovery',
]

export default function ContactPage() {
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    document.title = 'Contact & Get a Quote | Qiben Ltd'
    window.scrollTo(0, 0)
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      subject: formData.get('subject'),
      serviceCategory: formData.get('serviceCategory') || null,
      budget: formData.get('budget') || null,
      timeline: formData.get('timeline') || null,
      message: formData.get('message'),
      website: formData.get('website') || '',
    }

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSubmitted(true)
        form.reset()
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.message || 'We could not send your message. Please try again shortly.')
      }
    } catch {
      setErrorMsg('Network error. Please check your internet connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="wrap section" style={{ paddingTop: '50px' }}>
        {/* Head */}
        <div className="section-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> {t('contact.eyebrow')}
            </div>
            <h2>{t('contact.title')}</h2>
          </div>
          <p className="section-intro">{t('contact.intro')}</p>
        </div>

        {/* Contact Layout: Info + Form */}
        <div className="contact-page-layout">
          {/* Info Side */}
          <aside className="contact-info-panel">
            <div className="contact-card">
              <h3>Direct channels</h3>
              <p>We typically respond within one business day.</p>

              <div className="contact-direct-links">
                <a href="mailto:hello@qiben.rw" className="direct-link-item">
                  <div className="direct-icon">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="direct-label">{t('home.emailLabel')}</span>
                    <b>hello@qiben.rw</b>
                  </div>
                </a>

                <a href="https://wa.me/250780000000" target="_blank" rel="noreferrer" className="direct-link-item">
                  <div className="direct-icon">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="direct-label">{t('home.phoneLabel')}</span>
                    <b>+250 780 000 000</b>
                  </div>
                </a>

                <a href="https://maps.google.com/?q=Kigali+Rwanda" target="_blank" rel="noreferrer" className="direct-link-item">
                  <div className="direct-icon">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="direct-label">{t('home.locationLabel')}</span>
                    <b>Kigali, Rwanda</b>
                  </div>
                </a>
              </div>

              <a href="https://wa.me/250780000000" target="_blank" rel="noreferrer" className="button button-whatsapp">
                <MessageSquare size={16} /> {t('home.whatsappCta')} <ArrowUpRight size={14} />
              </a>
            </div>

            {/* What happens next block */}
            <div className="next-steps-card">
              <div className="eyebrow" style={{ marginBottom: '10px' }}>
                <Sparkles size={13} /> {t('contact.nextSteps')}
              </div>
              <div className="next-steps-list">
                <div className="step-card">
                  <span className="step-num">01</span>
                  <div>
                    <b>Review requirements</b>
                    <p>{t('contact.step1')}</p>
                  </div>
                </div>

                <div className="step-card">
                  <span className="step-num">02</span>
                  <div>
                    <b>Discovery consultation</b>
                    <p>{t('contact.step2')}</p>
                  </div>
                </div>

                <div className="step-card">
                  <span className="step-num">03</span>
                  <div>
                    <b>Transparent scope & roadmap</b>
                    <p>{t('contact.step3')}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Form Side */}
          <div className="contact-form-panel">
            {submitted ? (
              <div className="contact-success-card">
                <div className="success-icon-badge">
                  <Check size={32} />
                </div>
                <h3>{t('contact.success')}</h3>
                <p>
                  Thank you for reaching out to Qiben. An engineering lead has received your enquiry and will be in
                  touch with the next steps shortly.
                </p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setSubmitted(false)}
                  style={{ marginTop: '20px' }}
                >
                  Send another message <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <form className="contact-form-full" onSubmit={handleSubmit}>
                <div className="form-head">
                  <h3>Tell us what you're building</h3>
                  <p>All information is kept strictly confidential under our privacy standards.</p>
                </div>

                {errorMsg && <div className="contact-form-error">{errorMsg}</div>}

                <div className="form-row">
                  <label>
                    {t('contact.nameLabel')} <span className="req">*</span>
                    <input
                      required
                      name="name"
                      autoComplete="name"
                      placeholder="e.g. Marie Uwase"
                      minLength={2}
                      maxLength={120}
                    />
                  </label>
                  <label>
                    {t('contact.emailLabel')} <span className="req">*</span>
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      maxLength={254}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    {t('contact.phoneLabel')}
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+250 788 123 456"
                      maxLength={40}
                    />
                  </label>
                  <label>
                    {t('contact.serviceLabel')}
                    <select name="serviceCategory" defaultValue="">
                      <option value="">{t('contact.selectServicePlaceholder')}</option>
                      {serviceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    {t('contact.budgetLabel')}
                    <select name="budget" defaultValue="">
                      <option value="">{t('contact.selectBudgetPlaceholder')}</option>
                      {budgetOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t('contact.timelineLabel')}
                    <select name="timeline" defaultValue="">
                      <option value="">{t('contact.selectTimelinePlaceholder')}</option>
                      {timelineOptions.map((tl) => (
                        <option key={tl} value={tl}>
                          {tl}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  {t('contact.subjectLabel')} <span className="req">*</span>
                  <input
                    required
                    name="subject"
                    placeholder="e.g. Modernizing our logistics management software"
                    maxLength={180}
                  />
                </label>

                <label>
                  {t('contact.messageLabel')} <span className="req">*</span>
                  <textarea
                    required
                    name="message"
                    rows={6}
                    minLength={10}
                    maxLength={5000}
                    placeholder="Share any context about the project, users, desired outcomes, or questions you have."
                  />
                </label>

                {/* Honeypot field for bot spam prevention */}
                <label className="honeypot" aria-hidden="true">
                  Leave this field blank
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <div className="form-submit-row">
                  <button className="button button-primary" type="submit" disabled={submitting}>
                    {submitting ? t('contact.sending') : t('contact.submit')} <Send size={15} />
                  </button>
                  <div className="form-security-note">
                    <CheckCircle2 size={13} color="var(--primary)" />
                    <span>{t('contact.notice')}</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
