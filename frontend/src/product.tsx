import { useState, useEffect, type CSSProperties } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Globe,
  Layers,
  Sparkles,
  Tag,
  UserCheck,
  X,
} from 'lucide-react'
import Header from './header'
import Footer from './footer'

type GalleryImage = {
  id: number
  imageUrl: string
  altText: string
  displayOrder: number
}

type ProductDetail = {
  id: number
  type: 'PRODUCT' | 'PROJECT'
  name: string
  slug: string
  tagline: string
  short_description?: string
  shortDescription?: string
  long_description?: string
  longDescription?: string
  accent_color?: string
  accentColor?: string
  logo_url?: string
  logoUrl?: string
  cover_url?: string
  coverUrl?: string
  category?: string
  tech_stack?: string[] | string
  techStack?: string[] | string
  public_url?: string
  publicUrl?: string
  client_name?: string
  clientName?: string
  project_year?: number
  year?: number
  status: string
  images?: GalleryImage[]
}

type RelatedItem = {
  id: number
  type: 'PRODUCT' | 'PROJECT'
  name: string
  slug: string
  tagline: string
  shortDescription: string
  accentColor: string
}

async function fetchProductDetail(slug: string, lang: string): Promise<ProductDetail> {
  const langParam = lang.startsWith('fr') ? '?lang=fr' : ''
  const res = await fetch(`/api/public/products/${slug}${langParam}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

async function fetchRelatedWork(): Promise<RelatedItem[]> {
  const res = await fetch('/api/public/products')
  if (!res.ok) return []
  return res.json()
}

export default function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const [activeImage, setActiveImage] = useState<string | null>(null)

  const lang = i18n.language || 'en'

  const { data, isLoading, error } = useQuery({
    queryKey: ['product-detail', slug, lang],
    queryFn: () => fetchProductDetail(slug, lang),
  })

  const { data: allWork = [] } = useQuery({
    queryKey: ['public-products-all'],
    queryFn: fetchRelatedWork,
  })

  const related = allWork.filter((item) => item.slug !== slug).slice(0, 3)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    if (data) {
      const title = `${data.name} | Qiben Ltd`
      document.title = title
      const shortDesc = data.short_description || data.shortDescription || data.tagline
      document.querySelector('meta[name="description"]')?.setAttribute('content', shortDesc)
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${window.location.origin}/products/${data.slug}`)
    }
  }, [data])

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="loading" style={{ minHeight: '60vh' }}>
          Loading work details…
        </div>
        <Footer />
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <main className="wrap section" style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '80px' }}>
          <Link to="/products" className="text-link" style={{ marginBottom: '24px' }}>
            <ArrowLeft size={16} /> {t('productDetail.backToWork')}
          </Link>
          <h1 style={{ marginTop: '20px' }}>{t('productDetail.notFoundTitle')}</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{t('productDetail.notFoundDesc')}</p>
          <Link to="/" className="button button-primary">
            {t('productDetail.backHome')}
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const accent = data.accent_color || data.accentColor || '#146c66'
  const shortDesc = data.short_description || data.shortDescription || ''
  const longDesc = data.long_description || data.longDescription || ''
  const publicUrl = data.public_url || data.publicUrl
  const clientName = data.client_name || data.clientName
  const year = data.project_year || data.year || new Date().getFullYear()

  const rawTech = data.tech_stack || data.techStack
  const techList: string[] = Array.isArray(rawTech)
    ? rawTech
    : typeof rawTech === 'string'
    ? JSON.parse(rawTech || '[]')
    : []

  const gallery = data.images || []

  return (
    <>
      <Header />
      <main className="product-page wrap">
        <Link to="/products" className="text-link" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> {t('productDetail.backToWork')}
        </Link>

        {/* Product Hero Banner */}
        <div className="product-hero" style={{ '--card-accent': accent } as CSSProperties}>
          <span>{data.type === 'PRODUCT' ? t('work.productType') : t('work.projectType')}</span>
          <div>{data.name.slice(0, 1)}</div>
        </div>

        {/* Detail Layout: Main Content + Sidebar */}
        <div className="product-detail-layout">
          {/* Main Column */}
          <article className="product-main-content">
            <div className="eyebrow">
              <span className="eyebrow-line" /> {data.type === 'PRODUCT' ? t('work.eyebrow') : t('work.projectType')}
            </div>
            <h1>{data.name}</h1>
            <h2>{data.tagline}</h2>

            <div className="product-lead-box">
              <p>{shortDesc}</p>
            </div>

            {longDesc && (
              <div className="product-long-description">
                {longDesc.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Gallery Section */}
            {gallery.length > 0 && (
              <section className="product-gallery-section">
                <h3>{t('productDetail.gallery')}</h3>
                <div className="product-gallery-grid">
                  {gallery.map((img) => (
                    <div
                      key={img.id}
                      className="gallery-thumbnail-card"
                      onClick={() => setActiveImage(img.imageUrl)}
                      role="button"
                      tabIndex={0}
                    >
                      <img src={img.imageUrl} alt={img.altText || data.name} />
                      <div className="gallery-hover-overlay">
                        <Sparkles size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Action buttons */}
            <div className="product-actions-strip">
              {publicUrl && (
                <a className="button button-primary" href={publicUrl} target="_blank" rel="noreferrer">
                  {t('productDetail.visitProject')} <ArrowUpRight size={16} />
                </a>
              )}
              <Link className="button button-outline" to="/contact">
                {t('productDetail.discussSimilar')} <ArrowRight size={16} />
              </Link>
            </div>
          </article>

          {/* Sidebar Panel */}
          <aside className="product-sidebar">
            <div className="product-sidebar-card">
              <h4>{t('productDetail.specifications')}</h4>

              <div className="spec-row">
                <span className="spec-label">
                  <Tag size={13} /> {t('productDetail.category')}
                </span>
                <span className="spec-value">{data.category || (data.type === 'PRODUCT' ? 'Software Product' : 'Client Solution')}</span>
              </div>

              <div className="spec-row">
                <span className="spec-label">
                  <Layers size={13} /> {t('productDetail.status')}
                </span>
                <span className="spec-value">
                  <span className={`status-pill status-${data.status.toLowerCase()}`}>
                    {data.status.replace('_', ' ')}
                  </span>
                </span>
              </div>

              {clientName && (
                <div className="spec-row">
                  <span className="spec-label">
                    <UserCheck size={13} /> {t('productDetail.client')}
                  </span>
                  <span className="spec-value">{clientName}</span>
                </div>
              )}

              <div className="spec-row">
                <span className="spec-label">
                  <Calendar size={13} /> {t('productDetail.year')}
                </span>
                <span className="spec-value">{year}</span>
              </div>

              {publicUrl && (
                <div className="spec-row">
                  <span className="spec-label">
                    <Globe size={13} /> {t('productDetail.visitProject')}
                  </span>
                  <span className="spec-value">
                    <a href={publicUrl} target="_blank" rel="noreferrer" className="spec-link">
                      Visit URL <ExternalLink size={12} />
                    </a>
                  </span>
                </div>
              )}

              {techList.length > 0 && (
                <div className="spec-tech-block">
                  <span className="spec-label">{t('productDetail.techStack')}</span>
                  <div className="spec-tech-chips">
                    {techList.map((tag) => (
                      <span key={tag} className="tech-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Related Items Section */}
        {related.length > 0 && (
          <section className="related-work-section">
            <div className="section-head" style={{ marginBottom: '30px' }}>
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> {t('work.eyebrow')}
                </div>
                <h2>{t('productDetail.relatedTitle')}</h2>
              </div>
              <Link to="/products" className="text-link">
                {t('work.all')} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="work-grid">
              {related.map((item) => (
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
                    <Link to={`/products/${item.slug}`}>
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                  <p>{item.shortDescription}</p>
                </article>
              ))}
            </div>
          </section>
        )}

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
              {t('home.ctaButton')} <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>

        {/* Lightbox Modal */}
        {activeImage && (
          <div className="lightbox-modal-backdrop" onClick={() => setActiveImage(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close-btn" onClick={() => setActiveImage(null)}>
                <X size={20} />
              </button>
              <img src={activeImage} alt="Enlarged screenshot" />
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Structured JSON-LD Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': data.type === 'PRODUCT' ? 'Product' : 'CreativeWork',
            name: data.name,
            description: shortDesc,
            url: `${window.location.origin}/products/${data.slug}`,
            brand: {
              '@type': 'Organization',
              name: 'Qiben Ltd',
            },
          }),
        }}
      />
    </>
  )
}
