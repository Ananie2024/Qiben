import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Filter, Search } from 'lucide-react'
import Header from './header'
import Footer from './footer'

type ProductItem = {
  id: number
  type: 'PRODUCT' | 'PROJECT'
  name: string
  slug: string
  tagline: string
  shortDescription: string
  longDescription?: string
  accentColor: string
  logoUrl?: string
  coverUrl?: string
  category?: string
  techStack?: string[] | string
  publicUrl?: string
  clientName?: string
  year?: number
  displayOrder: number
}

async function fetchProducts(type?: string): Promise<ProductItem[]> {
  const params = new URLSearchParams()
  if (type && type !== 'ALL') params.set('type', type)
  const res = await fetch(`/api/public/products?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to load products')
  return res.json()
}

export default function ProductsPage() {
  const { t } = useTranslation()
  const [activeType, setActiveType] = useState<'ALL' | 'PRODUCT' | 'PROJECT'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    document.title = 'Products & Work | Qiben Ltd'
    window.scrollTo(0, 0)
  }, [])

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['public-products', activeType],
    queryFn: () => fetchProducts(activeType),
  })

  // Extract available categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim())
      }
    })
    return Array.from(set)
  }, [items])

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      if (!query) return matchesCategory

      const nameMatch = item.name.toLowerCase().includes(query)
      const taglineMatch = item.tagline?.toLowerCase().includes(query)
      const descMatch = item.shortDescription?.toLowerCase().includes(query)
      const stack = Array.isArray(item.techStack)
        ? item.techStack.join(' ').toLowerCase()
        : typeof item.techStack === 'string'
        ? item.techStack.toLowerCase()
        : ''
      const stackMatch = stack.includes(query)

      return matchesCategory && (nameMatch || taglineMatch || descMatch || stackMatch)
    })
  }, [items, selectedCategory, searchQuery])

  // Paginated items
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredItems.slice(start, start + itemsPerPage)
  }, [filteredItems, currentPage])

  const handleTypeChange = (type: 'ALL' | 'PRODUCT' | 'PROJECT') => {
    setActiveType(type)
    setCurrentPage(1)
  }

  return (
    <>
      <Header />
      <main className="wrap section" style={{ paddingTop: '50px' }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> {t('work.eyebrow')}
            </div>
            <h2>{t('work.title')}</h2>
          </div>
          <p className="section-intro">{t('work.intro')}</p>
        </div>

        {/* Filter and Search Bar */}
        <div className="products-filter-bar">
          <div className="filter-type-group">
            <button
              className={`filter-tab-btn ${activeType === 'ALL' ? 'active' : ''}`}
              onClick={() => handleTypeChange('ALL')}
            >
              {t('work.all')}
            </button>
            <button
              className={`filter-tab-btn ${activeType === 'PRODUCT' ? 'active' : ''}`}
              onClick={() => handleTypeChange('PRODUCT')}
            >
              {t('work.products')}
            </button>
            <button
              className={`filter-tab-btn ${activeType === 'PROJECT' ? 'active' : ''}`}
              onClick={() => handleTypeChange('PROJECT')}
            >
              {t('work.projects')}
            </button>
          </div>

          <div className="filter-search-group">
            {categories.length > 0 && (
              <div className="category-select-wrapper">
                <Filter size={14} className="filter-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="category-dropdown"
                >
                  <option value="ALL">{t('work.filterByCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder={t('work.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Results grid */}
        {isLoading && <div className="loading">Loading portfolio & products…</div>}

        {isError && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <p>Could not load work at this moment. Please refresh shortly.</p>
          </div>
        )}

        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="empty-work-state">
            <p>{t('work.empty')}</p>
            {(searchQuery || selectedCategory !== 'ALL' || activeType !== 'ALL') && (
              <button
                className="text-link"
                style={{ marginTop: '12px' }}
                onClick={() => {
                  setActiveType('ALL')
                  setSelectedCategory('ALL')
                  setSearchQuery('')
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && paginatedItems.length > 0 && (
          <div className="work-grid" style={{ marginBottom: '50px' }}>
            {paginatedItems.map((item) => {
              const techList = Array.isArray(item.techStack)
                ? item.techStack
                : typeof item.techStack === 'string'
                ? JSON.parse(item.techStack || '[]')
                : []

              return (
                <article
                  className="work-card"
                  key={item.id}
                  style={{ '--card-accent': item.accentColor || '#146c66' } as CSSProperties}
                >
                  <div className="work-visual">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="work-symbol">{item.name.slice(0, 1)}</div>
                    )}
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

                  {techList.length > 0 && (
                    <div className="work-card-stack">
                      {techList.slice(0, 3).map((tag: string) => (
                        <span key={tag}>{tag}</span>
                      ))}
                      {techList.length > 3 && <span>+{techList.length - 3}</span>}
                    </div>
                  )}

                  <div className="work-card-footer">
                    <Link to={`/products/${item.slug}`} className="work-detail-btn">
                      {t('work.viewWork')} <ArrowRight size={13} />
                    </Link>
                    {item.publicUrl && (
                      <a
                        href={item.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="work-external-link"
                        title={t('work.viewProduct')}
                      >
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="page-btn"
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}

        {/* Bottom CTA band */}
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
      </main>
      <Footer />
    </>
  )
}
