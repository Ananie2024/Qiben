import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  HeartHandshake,
  MapPin,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import Header from './header'
import Footer from './footer'

const teamMembers = [
  {
    id: 1,
    name: 'Senior Architect Placeholder',
    roleKey: 'member1Role',
    bioKey: 'member1Bio',
    avatarChar: 'A',
    accent: '#146c66',
  },
  {
    id: 2,
    name: 'Lead Designer Placeholder',
    roleKey: 'member2Role',
    bioKey: 'member2Bio',
    avatarChar: 'D',
    accent: '#f0a85b',
  },
  {
    id: 3,
    name: 'DevOps Engineer Placeholder',
    roleKey: 'member3Role',
    bioKey: 'member3Bio',
    avatarChar: 'O',
    accent: '#2b6cb0',
  },
  {
    id: 4,
    name: 'QA Specialist Placeholder',
    roleKey: 'member4Role',
    bioKey: 'member4Bio',
    avatarChar: 'Q',
    accent: '#805ad5',
  },
]

export default function AboutPage() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = 'About Us | Qiben Ltd'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header />
      <main className="wrap section" style={{ paddingTop: '50px' }}>
        {/* Page Head */}
        <div className="section-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> {t('about.eyebrow')}
            </div>
            <h2>{t('about.title')}</h2>
          </div>
          <p className="section-intro">{t('about.intro')}</p>
        </div>

        {/* Narrative & Story Section */}
        <section className="about-story-section">
          <div className="about-story-grid">
            <div className="about-story-copy">
              <div className="eyebrow" style={{ marginBottom: '14px' }}>
                <Compass size={14} /> OUR ORIGINS
              </div>
              <h3>{t('about.storyTitle')}</h3>
              <p>{t('about.story1')}</p>
              <p>{t('about.story2')}</p>

              <div className="story-highlights">
                <div className="story-highlight-item">
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>{t('home.outcome1')}</span>
                </div>
                <div className="story-highlight-item">
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>{t('home.outcome2')}</span>
                </div>
                <div className="story-highlight-item">
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>{t('home.outcome3')}</span>
                </div>
              </div>
            </div>

            <div className="about-story-visual">
              <div className="story-stat-card">
                <div className="story-badge">KIGALI, RWANDA</div>
                <h4>Engineering with regional insight and global standards.</h4>
                <div className="story-stat-chips">
                  <span>Rwanda-Rooted</span>
                  <span>East Africa-Focused</span>
                  <span>Global Standards</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="about-values-section">
          <div className="section-head" style={{ marginBottom: '36px' }}>
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> {t('about.valuesTitle')}
              </div>
              <h2>Built on principles, measured by outcomes.</h2>
            </div>
            <p className="section-intro">
              How we approach every partnership, line of code, and release milestone.
            </p>
          </div>

          <div className="values-grid">
            <article className="value-card">
              <div className="value-icon-box">
                <Cpu size={22} />
              </div>
              <h4>{t('about.v1Title')}</h4>
              <p>{t('about.v1Desc')}</p>
            </article>

            <article className="value-card">
              <div className="value-icon-box">
                <Users size={22} />
              </div>
              <h4>{t('about.v2Title')}</h4>
              <p>{t('about.v2Desc')}</p>
            </article>

            <article className="value-card">
              <div className="value-icon-box">
                <Shield size={22} />
              </div>
              <h4>{t('about.v3Title')}</h4>
              <p>{t('about.v3Desc')}</p>
            </article>

            <article className="value-card">
              <div className="value-icon-box">
                <HeartHandshake size={22} />
              </div>
              <h4>{t('about.v4Title')}</h4>
              <p>{t('about.v4Desc')}</p>
            </article>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team-section">
          <div className="section-head" style={{ marginBottom: '30px' }}>
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> {t('about.teamTitle')}
              </div>
              <h2>The minds behind the work.</h2>
            </div>
            <p className="section-intro">{t('about.teamNotice')}</p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member) => (
              <article key={member.id} className="team-card">
                <div className="team-avatar-box" style={{ background: member.accent }}>
                  <span>{member.avatarChar}</span>
                  <div className="team-placeholder-badge">
                    <Sparkles size={11} /> Team Placeholder
                  </div>
                </div>
                <div className="team-card-info">
                  <h4>{member.name}</h4>
                  <span className="team-role">{t(`about.${member.roleKey}` as any)}</span>
                  <p>{t(`about.${member.bioKey}` as any)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Kigali Location Section */}
        <section className="about-location-section">
          <div className="location-card">
            <div className="location-info">
              <div className="eyebrow">
                <span className="eyebrow-line" /> HEADQUARTERS
              </div>
              <h3>{t('about.locationTitle')}</h3>
              <p>{t('about.locationText')}</p>

              <div className="location-meta-list">
                <div className="location-meta-item">
                  <MapPin size={16} />
                  <span>{t('about.locationAddress')}</span>
                </div>
                <div className="location-meta-item">
                  <Clock size={16} />
                  <span>{t('about.locationHours')}</span>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Kigali+Rwanda"
                target="_blank"
                rel="noreferrer"
                className="button button-primary"
                style={{ marginTop: '22px' }}
              >
                {t('about.viewMap')} <ArrowUpRight size={15} />
              </a>
            </div>

            <div className="location-map-placeholder">
              <div className="map-grid-pattern" />
              <div className="map-pin-pulse">
                <MapPin size={24} color="var(--primary)" />
                <b>Kigali, Rwanda</b>
              </div>
              <span className="map-coord-caption">1.9441° S, 30.0619° E</span>
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="cta-band" style={{ borderRadius: '6px', marginTop: '60px', marginBottom: '40px' }}>
          <div className="cta-inner">
            <div>
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-line" /> {t('home.ctaEyebrow')}
              </div>
              <h2>{t('home.ctaTitle')}</h2>
            </div>
            <Link className="button button-light" to="/contact">
              {t('nav.talk')} <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
