import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, CheckCircle2, Cloud, Code2, PenTool, ShieldCheck, Smartphone, Workflow } from 'lucide-react'
import Header from './header'
import Footer from './footer'

const detailedServices = [
  {
    id: 'custom-software',
    icon: Code2,
    key: 's1',
    outcomes: ['Tailored business logic', 'Eliminates repetitive manual workflows', 'Built to scale with your team'],
    deliverables: ['Custom web dashboards', 'Internal workflow engines', 'Relational database systems'],
  },
  {
    id: 'web-mobile',
    icon: Smartphone,
    key: 's2',
    outcomes: ['Intuitive mobile experience', 'High performance on low-bandwidth networks', 'Fast load times'],
    deliverables: ['Progressive Web Apps (PWA)', 'iOS & Android mobile apps', 'Customer-facing portals'],
  },
  {
    id: 'ui-ux',
    icon: PenTool,
    key: 's3',
    outcomes: ['User-tested interfaces', 'Cohesive design systems', 'Reduced user onboarding friction'],
    deliverables: ['Figma design systems', 'Interactive high-fidelity prototypes', 'Usability audit reports'],
  },
  {
    id: 'api-integrations',
    icon: Workflow,
    key: 's4',
    outcomes: ['Unified data between disparate platforms', 'Secure data exchange', 'Automated synching'],
    deliverables: ['RESTful & GraphQL API gateways', 'Payment integration (M-Pesa, MTN Mobile Money)', 'CRM & ERP connectors'],
  },
  {
    id: 'qa-testing',
    icon: ShieldCheck,
    key: 's5',
    outcomes: ['Zero unexpected regression bugs', 'Predictable release cadence', 'Verified security and load limits'],
    deliverables: ['Automated test suites', 'Performance & load testing', 'Security vulnerability audits'],
  },
  {
    id: 'cloud-devops',
    icon: Cloud,
    key: 's6',
    outcomes: ['99.9% application uptime', 'Automated zero-downtime deployments', 'Cost-effective server infrastructure'],
    deliverables: ['Dockerized container orchestration', 'CI/CD automated pipelines', 'Cloud infrastructure setup (AWS/VPS)'],
  },
]

const techStack = ['React', 'TypeScript', 'Java', 'Spring Boot', 'PostgreSQL', 'MariaDB', 'Docker', 'AWS', 'Tailwind', 'Nginx']

export default function ServicesPage() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = 'Services | Qiben Ltd'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header />
      <main className="wrap section" style={{ paddingTop: '50px' }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> {t('services.eyebrow')}
            </div>
            <h2>{t('services.title')}</h2>
          </div>
          <p className="section-intro">{t('services.intro')}</p>
        </div>

        <div className="services-grid" style={{ marginBottom: '60px' }}>
          {detailedServices.map((s, i) => {
            const title = t(`services.${s.key}_title` as any)
            const desc = t(`services.${s.key}_desc` as any)
            return (
              <article className="service-card" key={s.id}>
                <div className="service-top">
                  <span className="service-icon">
                    <s.icon size={22} />
                  </span>
                  <span className="card-index">0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div style={{ marginTop: '14px', display: 'grid', gap: '6px' }}>
                  {s.outcomes.map((out) => (
                    <div key={out} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: 'var(--ink)' }}>
                      <CheckCircle2 size={13} color="var(--primary)" />
                      <span>{out}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--line)', fontSize: '10px', color: 'var(--muted)' }}>
                  <b>Typical Deliverables:</b> {s.deliverables.join(' · ')}
                </div>
              </article>
            )
          })}
        </div>

        <section className="tech-band" style={{ marginBottom: '60px' }}>
          <div className="tech-inner" style={{ width: '100%' }}>
            <span>THE RIGHT TOOLS<br /><b>FOR THE JOB</b></span>
            <div className="tech-list">
              {techStack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band" style={{ borderRadius: '6px', marginBottom: '40px' }}>
          <div className="cta-inner">
            <div>
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-line" /> {t('contact.eyebrow')}
              </div>
              <h2>{t('hero.ctaPrimary')}</h2>
            </div>
            <Link className="button button-light" to="/contact">
              {t('nav.talk')} <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
