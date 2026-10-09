import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, FileText, Image as ImageIcon, LayoutDashboard, LogOut, Package, Plus, Search, Settings, Trash2, Upload, X } from 'lucide-react'
import './admin.css'

type Row = Record<string, any>

async function api(path: string, token: string, init: RequestInit = {}) {
  const send = (access: string) => fetch('/api' + path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access}`,
      ...init.headers,
    },
  })
  let r = await send(token)
  if (r.status === 401) {
    const renewal = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
    if (renewal.ok) {
      const fresh = await renewal.json()
      token = fresh.accessToken
      sessionStorage.setItem('qiben-token', token)
      r = await send(token)
    } else {
      sessionStorage.removeItem('qiben-token')
      location.reload()
    }
  }
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.message || 'Request failed')
  }
  return r.status === 204 ? null : r.json()
}

async function uploadMedia(file: File, token: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/admin/media', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to upload image')
  }
  const data = await res.json()
  return data.url
}

export default function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem('qiben-token') || '')
  const [section, setSection] = useState('Overview')
  const [rows, setRows] = useState<Row[]>([])
  const [dashboard, setDashboard] = useState<Row>({})
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<Row | null>(null)
  const [notes, setNotes] = useState<Row[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(false)
  const [tab, setTab] = useState<'details' | 'translations' | 'gallery'>('details')
  const [gallery, setGallery] = useState<Row[]>([])
  const [edit, setEdit] = useState<Row>({
    type: 'PRODUCT',
    name: '',
    slug: '',
    tagline: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    status: 'IN_DEVELOPMENT',
    featured: false,
    accentColor: '#146c66',
    displayOrder: 0,
    published: false,
    techStackText: '',
    clientName: '',
    year: new Date().getFullYear(),
    publicUrl: '',
    logoUrl: '',
    coverUrl: '',
    taglineFr: '',
    shortDescriptionFr: '',
    longDescriptionFr: '',
  })

  // Settings password state
  const [currPass, setCurrPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passMsg, setPassMsg] = useState('')

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.append(meta)
    return () => meta.remove()
  }, [])

  const refresh = async () => {
    if (!token) return
    try {
      if (section === 'Overview') setDashboard(await api('/admin/dashboard', token))
      if (section === 'Messages') {
        const d = await api(`/admin/messages?size=50&search=${encodeURIComponent(search)}&status=${status || ''}`, token)
        setRows(d.items || [])
      }
      if (section === 'Products & projects') setRows(await api('/admin/products', token))
      if (section === 'Statistics') setRows(await api('/admin/statistics', token))
    } catch {
      setError('Could not load this section. Check your connection and try again.')
    }
  }

  useEffect(() => {
    refresh()
  }, [token, section, status])

  // Load message notes when a message is selected
  useEffect(() => {
    if (selected && token) {
      api(`/admin/messages/${selected.id}/notes`, token)
        .then(setNotes)
        .catch(() => setNotes([]))
    } else {
      setNotes([])
    }
  }, [selected, token])

  // Load gallery and translations when product editor is opened
  useEffect(() => {
    if (form && edit.id && token) {
      api(`/admin/products/${edit.id}/images`, token)
        .then(setGallery)
        .catch(() => setGallery([]))
      api(`/admin/products/${edit.id}/translations`, token)
        .then((transList: Row[]) => {
          const fr = transList.find((x) => x.language === 'fr')
          if (fr) {
            setEdit((prev) => ({
              ...prev,
              taglineFr: fr.tagline || '',
              shortDescriptionFr: fr.shortDescription || '',
              longDescriptionFr: fr.longDescription || '',
            }))
          }
        })
        .catch(() => {})
    }
  }, [form, edit.id, token])

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const f = new FormData(e.currentTarget)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
      })
      if (!r.ok) throw new Error()
      const d = await r.json()
      sessionStorage.setItem('qiben-token', d.accessToken)
      setToken(d.accessToken)
    } catch {
      setError('Sign in failed. Check your email and password.')
    }
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const techStack = (edit.techStackText || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)

      const payload = {
        ...edit,
        techStack,
      }

      if (edit.id) {
        await api(`/admin/products/${edit.id}`, token, { method: 'PUT', body: JSON.stringify(payload) })
        // Save French translation if provided
        if (edit.taglineFr || edit.shortDescriptionFr || edit.longDescriptionFr) {
          await api(`/admin/products/${edit.id}/translations/fr`, token, {
            method: 'PUT',
            body: JSON.stringify({
              tagline: edit.taglineFr || edit.tagline,
              shortDescription: edit.shortDescriptionFr || edit.shortDescription,
              longDescription: edit.longDescriptionFr || edit.longDescription,
            }),
          })
        }
      } else {
        await api('/admin/products', token, { method: 'POST', body: JSON.stringify(payload) })
      }
      setForm(false)
      refresh()
    } catch (err: any) {
      setError(err.message || 'Could not save product.')
    }
  }

  async function handleFileUpload(file: File, field: 'logoUrl' | 'coverUrl') {
    try {
      const url = await uploadMedia(file, token)
      setEdit((prev) => ({ ...prev, [field]: url }))
    } catch (err: any) {
      alert(err.message || 'Image upload failed')
    }
  }

  async function handleGalleryUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length || !edit.id) return
    const file = e.target.files[0]
    try {
      const url = await uploadMedia(file, token)
      await api(`/admin/products/${edit.id}/images`, token, {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: url,
          altText: `${edit.name} screenshot`,
          displayOrder: gallery.length + 1,
        }),
      })
      const updated = await api(`/admin/products/${edit.id}/images`, token)
      setGallery(updated)
    } catch (err: any) {
      alert(err.message || 'Gallery upload failed')
    }
  }

  async function deleteGalleryImage(imgId: number) {
    if (!edit.id) return
    try {
      await api(`/admin/products/${edit.id}/images/${imgId}`, token, { method: 'DELETE' })
      setGallery(gallery.filter((g) => g.id !== imgId))
    } catch (err: any) {
      alert(err.message || 'Failed to delete gallery image')
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    setPassMsg('')
    setError('')
    if (newPass !== confirmPass) {
      setError('New passwords do not match')
      return
    }
    if (newPass.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }
    try {
      await api('/admin/change-password', token, {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currPass, newPassword: newPass }),
      })
      setPassMsg('Password successfully updated!')
      setCurrPass('')
      setNewPass('')
      setConfirmPass('')
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    }
  }

  if (!token) {
    return (
      <div className="login-screen">
        <Link className="admin-brand" to="/">
          <span>q</span> qiben<span className="brand-dot">.</span>
        </Link>
        <form className="login-card" onSubmit={login}>
          <div className="admin-eyebrow">PRIVATE TEAM AREA</div>
          <h1>Welcome back.</h1>
          <p>Sign in to manage Qiben’s website.</p>
          {error && <div className="admin-error">{error}</div>}
          <label>
            Email address
            <input name="email" required type="email" autoComplete="username" />
          </label>
          <label>
            Password
            <input name="password" required minLength={12} type="password" autoComplete="current-password" />
          </label>
          <button className="admin-primary" type="submit">Sign in</button>
          <Link to="/" className="back-link">
            <ArrowLeft size={14} /> Back to website
          </Link>
        </form>
        <span className="login-foot">Qiben Ltd · Team access only</span>
      </div>
    )
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    sessionStorage.removeItem('qiben-token')
    setToken('')
  }

  const nav = [
    ['Overview', LayoutDashboard],
    ['Messages', FileText],
    ['Products & projects', Package],
    ['Statistics', BarChart3],
    ['Settings', Settings],
  ] as const

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span>q</span> qiben<span className="brand-dot">.</span>
        </Link>
        <div className="sidebar-caption">WORKSPACE</div>
        {nav.map(([name, Icon]) => (
          <button
            key={name}
            className={section === name ? 'side-link active' : 'side-link'}
            onClick={() => { setSection(name); setError('') }}
          >
            <Icon size={17} />
            {name}
            {name === 'Messages' && dashboard.newMessages > 0 && <i>{dashboard.newMessages}</i>}
          </button>
        ))}
        <div className="sidebar-bottom">
          <button className="side-link" onClick={logout}>
            <LogOut size={17} /> Sign out
          </button>
          <div className="team-chip">
            <span>Q</span>
            <div>
              <b>Qiben team</b>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <div className="admin-eyebrow">QIBEN WORKSPACE</div>
            <h1>{section}</h1>
          </div>
          <Link to="/" className="view-site">
            View website <ArrowLeft size={14} />
          </Link>
        </header>
        {error && <div className="admin-error">{error}</div>}

        {section === 'Overview' && (
          <>
            <p className="admin-subtitle">A quick look at what’s happening on your website.</p>
            <div className="dash-cards">
              {[
                ['All messages', dashboard.messages],
                ['New messages', dashboard.newMessages],
                ['New this month', dashboard.newThisMonth],
                ['Published work', (dashboard.publishedProducts || 0) + (dashboard.publishedProjects || 0)],
              ].map(([label, value]) => (
                <div className="dash-card" key={label as string}>
                  <span>{label}</span>
                  <b>{value ?? '—'}</b>
                  <small>
                    {label === 'Published work'
                      ? `${dashboard.publishedProducts || 0} products · ${dashboard.publishedProjects || 0} projects`
                      : 'Updated just now'}
                  </small>
                </div>
              ))}
            </div>
            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent messages</h2>
                  <p>Enquiries from the contact form.</p>
                </div>
                <button onClick={() => setSection('Messages')} className="admin-text-button">
                  See all messages →
                </button>
              </div>
              <button className="empty-message" onClick={() => setSection('Messages')}>
                <FileText />
                <span>Open your message inbox</span>
              </button>
            </section>
            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <h2>Public content</h2>
                  <p>Manage the products and projects visitors see.</p>
                </div>
                <button onClick={() => setSection('Products & projects')} className="admin-text-button">
                  Manage work →
                </button>
              </div>
            </section>
          </>
        )}

        {section === 'Messages' && (
          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>Client messages</h2>
                <p>{dashboard.newMessages || 0} unread enquiries</p>
              </div>
              <button
                className="admin-secondary"
                onClick={() => {
                  fetch('/api/admin/messages?size=500', { headers: { Authorization: `Bearer ${token}` } })
                    .then((r) => r.json())
                    .then((d) => {
                      const csv = [
                        ['Name', 'Email', 'Phone', 'Subject', 'Budget', 'Timeline', 'Service', 'Message', 'Status', 'Received'],
                        ...d.items.map((x: Row) => [
                          x.name,
                          x.email,
                          x.phone || '',
                          x.subject,
                          x.budget || '',
                          x.timeline || '',
                          x.service_category || '',
                          x.message,
                          x.status,
                          x.created_at,
                        ]),
                      ]
                        .map((r) => r.map((v: any) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
                        .join('\n')
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
                      a.download = 'qiben-messages.csv'
                      a.click()
                    })
                }}
              >
                Export CSV ↓
              </button>
            </div>
            <div className="table-tools">
              <label>
                <Search size={15} />
                <input
                  placeholder="Search name, email or subject"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && refresh()}
                />
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                {['NEW', 'READ', 'REPLIED', 'ARCHIVED'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>FROM</th>
                    <th>SUBJECT</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      onClick={() => {
                        setSelected(r)
                        if (r.status === 'NEW') {
                          api(`/admin/messages/${r.id}/status`, token, {
                            method: 'PATCH',
                            body: JSON.stringify({ status: 'READ' }),
                          })
                        }
                      }}
                      key={r.id}
                    >
                      <td>
                        <b>{r.name}</b>
                        <small>{r.email} {r.phone ? `· ${r.phone}` : ''}</small>
                      </td>
                      <td>{r.subject}</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status status-${String(r.status).toLowerCase()}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <div className="table-empty">No messages yet.</div>}
            </div>
          </section>
        )}

        {section === 'Products & projects' && (
          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>Products & projects</h2>
                <p>Manage public work and Qiben products.</p>
              </div>
              <button
                className="admin-primary compact"
                onClick={() => {
                  setTab('details')
                  setGallery([])
                  setEdit({
                    type: 'PRODUCT',
                    name: '',
                    slug: '',
                    tagline: '',
                    shortDescription: '',
                    longDescription: '',
                    category: '',
                    status: 'IN_DEVELOPMENT',
                    featured: false,
                    accentColor: '#146c66',
                    displayOrder: rows.length + 1,
                    published: false,
                    techStackText: '',
                    clientName: '',
                    year: new Date().getFullYear(),
                    publicUrl: '',
                    logoUrl: '',
                    coverUrl: '',
                    taglineFr: '',
                    shortDescriptionFr: '',
                    longDescriptionFr: '',
                  })
                  setForm(true)
                }}
              >
                <Plus size={15} /> Add work
              </button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>TYPE</th>
                    <th>STATUS</th>
                    <th>PUBLIC</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <b>{r.name}</b>
                        <small>/{r.slug}</small>
                      </td>
                      <td>{r.type}</td>
                      <td>{r.status}</td>
                      <td>
                        <span className={`status ${r.published ? 'status-read' : 'status-archived'}`}>
                          {r.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="row-action"
                          onClick={() => {
                            setTab('details')
                            const stackStr = Array.isArray(r.tech_stack)
                              ? r.tech_stack.join(', ')
                              : typeof r.tech_stack === 'string'
                              ? JSON.parse(r.tech_stack || '[]').join(', ')
                              : ''
                            setEdit({
                              ...r,
                              shortDescription: r.short_description || '',
                              longDescription: r.long_description || '',
                              accentColor: r.accent_color || '#146c66',
                              displayOrder: r.display_order || 0,
                              publicUrl: r.public_url || '',
                              logoUrl: r.logo_url || '',
                              coverUrl: r.cover_url || '',
                              clientName: r.client_name || '',
                              year: r.project_year || new Date().getFullYear(),
                              techStackText: stackStr,
                              taglineFr: '',
                              shortDescriptionFr: '',
                              longDescriptionFr: '',
                            })
                            setForm(true)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="row-action danger"
                          onClick={async () => {
                            if (confirm('Delete this entry?')) {
                              await api(`/admin/products/${r.id}`, token, { method: 'DELETE' })
                              refresh()
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <div className="table-empty">No content has been added yet.</div>}
            </div>
          </section>
        )}

        {section === 'Statistics' && (
          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>Homepage statistics</h2>
                <p>Only publish numbers that Qiben has verified.</p>
              </div>
              <button
                className="admin-secondary compact"
                onClick={async () => {
                  await api('/admin/statistics', token, {
                    method: 'POST',
                    body: JSON.stringify({
                      label: 'New counter',
                      value: 0,
                      suffix: '+',
                      displayOrder: rows.length + 1,
                      visible: true,
                    }),
                  })
                  refresh()
                }}
              >
                <Plus size={14} /> Add statistic
              </button>
            </div>
            <div className="stat-editor">
              {rows.map((r) => (
                <form
                  key={r.id}
                  onSubmit={async (e) => {
                    e.preventDefault()
                    await api(`/admin/statistics/${r.id}`, token, {
                      method: 'PUT',
                      body: JSON.stringify({ ...r, displayOrder: r.display_order }),
                    })
                    refresh()
                  }}
                >
                  <label>
                    Label
                    <input
                      value={r.label}
                      onChange={(e) =>
                        setRows(rows.map((x) => (x.id === r.id ? { ...x, label: e.target.value } : x)))
                      }
                    />
                  </label>
                  <label>
                    Value
                    <input
                      type="number"
                      min="0"
                      value={r.value}
                      onChange={(e) =>
                        setRows(rows.map((x) => (x.id === r.id ? { ...x, value: +e.target.value } : x)))
                      }
                    />
                  </label>
                  <label>
                    Suffix
                    <input
                      value={r.suffix}
                      onChange={(e) =>
                        setRows(rows.map((x) => (x.id === r.id ? { ...x, suffix: e.target.value } : x)))
                      }
                    />
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={r.visible}
                      onChange={(e) =>
                        setRows(rows.map((x) => (x.id === r.id ? { ...x, visible: e.target.checked } : x)))
                      }
                    />
                    Visible
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="admin-secondary" type="submit">Save</button>
                    <button
                      type="button"
                      className="row-action danger"
                      onClick={async () => {
                        if (confirm('Delete this counter?')) {
                          await api(`/admin/statistics/${r.id}`, token, { method: 'DELETE' })
                          refresh()
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </section>
        )}

        {section === 'Settings' && (
          <div className="settings-box">
            <section className="settings-form">
              <h3>Change Admin Password</h3>
              <p>Update your seed administrator password with a new strong password.</p>
              {passMsg && <div className="success-msg">{passMsg}</div>}
              <form onSubmit={changePassword}>
                <label>
                  Current password
                  <input
                    type="password"
                    required
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                  />
                </label>
                <label>
                  New password (min 12 characters)
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                </label>
                <button className="admin-primary" style={{ marginTop: '8px' }} type="submit">
                  Update password
                </button>
              </form>
            </section>
            <section className="settings-form">
              <h3>Website & Server Environment</h3>
              <p>System endpoints and security policies configured via environment variables.</p>
              <div style={{ fontSize: '11px', color: '#4d6159', display: 'grid', gap: '6px' }}>
                <div><b>Auth token lifetime:</b> 15 minutes (Access) · 7 days (HTTP-only refresh cookie)</div>
                <div><b>Media storage:</b> Local filesystem mounted volume (scaled up to 1800px)</div>
                <div><b>Rate limiting:</b> 5 enquiries/hr (Contact) · 8 attempts/15 min (Login)</div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Message enquiry detail drawer with notes history */}
      {selected && (
        <div className="drawer-shade" onClick={() => setSelected(null)}>
          <aside className="message-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <span className="admin-eyebrow">CLIENT ENQUIRY</span>
            <h2>{selected.subject}</h2>
            <div className="sender">
              <b>{selected.name}</b>
              <a href={`mailto:${selected.email}`}>{selected.email}</a>
              {selected.phone && <span>Phone: {selected.phone}</span>}
              {selected.service_category && <span>Service: {selected.service_category}</span>}
              {selected.budget && <span>Budget: {selected.budget}</span>}
              {selected.timeline && <span>Timeline: {selected.timeline}</span>}
              <small>{new Date(selected.created_at).toLocaleString()}</small>
            </div>
            <p className="message-body">{selected.message}</p>
            <label className="drawer-label">
              Update status
              <select
                defaultValue={selected.status}
                onChange={async (e) => {
                  await api(`/admin/messages/${selected.id}/status`, token, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: e.target.value }),
                  })
                  setSelected({ ...selected, status: e.target.value })
                  refresh()
                }}
              >
                {['NEW', 'READ', 'REPLIED', 'ARCHIVED'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>

            {/* Existing notes history */}
            <div className="drawer-label">
              Team notes ({notes.length})
              <div className="notes-list">
                {notes.map((n) => (
                  <div key={n.id} className="note-item">
                    <div className="note-item-head">
                      <b>{n.author}</b>
                      <small>{new Date(n.created_at).toLocaleString()}</small>
                    </div>
                    <p>{n.note}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div style={{ fontSize: '10px', color: '#8c9c96', fontStyle: 'italic' }}>
                    No internal notes added yet.
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const noteText = fd.get('note') as string
                if (!noteText?.trim()) return
                await api(`/admin/messages/${selected.id}/notes`, token, {
                  method: 'POST',
                  body: JSON.stringify({ note: noteText }),
                })
                e.currentTarget.reset()
                const updated = await api(`/admin/messages/${selected.id}/notes`, token)
                setNotes(updated)
              }}
            >
              <label className="drawer-label">
                Add internal note
                <textarea
                  name="note"
                  required
                  rows={3}
                  maxLength={5000}
                  placeholder="Only the Qiben team can see this note."
                />
              </label>
              <button className="admin-primary" type="submit">Save note</button>
            </form>
            <button
              className="delete-message"
              onClick={async () => {
                if (confirm('Permanently delete this message?')) {
                  await api(`/admin/messages/${selected.id}`, token, { method: 'DELETE' })
                  setSelected(null)
                  refresh()
                }
              }}
            >
              Delete message
            </button>
          </aside>
        </div>
      )}

      {/* Advanced Product Editor Drawer with tabs, media uploads, and gallery */}
      {form && (
        <div className="drawer-shade" onClick={() => setForm(false)}>
          <aside className="message-drawer editor-drawer" style={{ width: 'min(620px, 100%)' }} onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setForm(false)}>
              <X />
            </button>
            <span className="admin-eyebrow">CONTENT EDITOR</span>
            <h2>{edit.id ? 'Edit work' : 'Add work'}</h2>

            <div className="editor-tabs">
              <button
                type="button"
                className={`editor-tab ${tab === 'details' ? 'active' : ''}`}
                onClick={() => setTab('details')}
              >
                Details & Media
              </button>
              <button
                type="button"
                className={`editor-tab ${tab === 'translations' ? 'active' : ''}`}
                onClick={() => setTab('translations')}
              >
                Français (Translation)
              </button>
              {edit.id && (
                <button
                  type="button"
                  className={`editor-tab ${tab === 'gallery' ? 'active' : ''}`}
                  onClick={() => setTab('gallery')}
                >
                  Gallery ({gallery.length})
                </button>
              )}
            </div>

            {tab === 'details' && (
              <form onSubmit={saveProduct} className="content-form">
                <div className="editor-row">
                  <label>
                    Type
                    <select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>
                      <option value="PRODUCT">Qiben product</option>
                      <option value="PROJECT">Client project</option>
                    </select>
                  </label>
                  <label>
                    Status
                    <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                      <option value="IN_DEVELOPMENT">In Development</option>
                      <option value="LIVE">Live</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </label>
                </div>

                <div className="editor-row">
                  <label>
                    Name
                    <input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
                  </label>
                  <label>
                    Slug
                    <input
                      required
                      pattern="[a-z0-9-]+"
                      value={edit.slug}
                      onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
                    />
                  </label>
                </div>

                <label>
                  Tagline
                  <input required value={edit.tagline} onChange={(e) => setEdit({ ...edit, tagline: e.target.value })} />
                </label>

                <div className="editor-row">
                  <label>
                    Category
                    <input
                      placeholder="e.g. Enterprise Platform"
                      value={edit.category || ''}
                      onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                    />
                  </label>
                  <label>
                    Client Name
                    <input
                      placeholder="e.g. Ministry / Org"
                      value={edit.clientName || ''}
                      onChange={(e) => setEdit({ ...edit, clientName: e.target.value })}
                    />
                  </label>
                </div>

                <div className="editor-row">
                  <label>
                    Project Year
                    <input
                      type="number"
                      value={edit.year || new Date().getFullYear()}
                      onChange={(e) => setEdit({ ...edit, year: +e.target.value })}
                    />
                  </label>
                  <label>
                    Public URL
                    <input
                      placeholder="https://..."
                      value={edit.publicUrl || ''}
                      onChange={(e) => setEdit({ ...edit, publicUrl: e.target.value })}
                    />
                  </label>
                </div>

                <label>
                  Technologies (comma-separated)
                  <input
                    placeholder="React, TypeScript, Spring Boot, MariaDB"
                    value={edit.techStackText || ''}
                    onChange={(e) => setEdit({ ...edit, techStackText: e.target.value })}
                  />
                </label>

                <label>
                  Short description (EN)
                  <textarea
                    required
                    maxLength={500}
                    value={edit.shortDescription}
                    onChange={(e) => setEdit({ ...edit, shortDescription: e.target.value })}
                  />
                </label>

                <label>
                  Long description (EN)
                  <textarea
                    rows={4}
                    value={edit.longDescription || ''}
                    onChange={(e) => setEdit({ ...edit, longDescription: e.target.value })}
                  />
                </label>

                <label>
                  Logo image
                  <div className="upload-row">
                    <input
                      type="text"
                      placeholder="/api/public/media/..."
                      value={edit.logoUrl || ''}
                      onChange={(e) => setEdit({ ...edit, logoUrl: e.target.value })}
                    />
                    <label className="upload-file-btn">
                      <Upload size={13} /> Upload
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logoUrl')}
                      />
                    </label>
                  </div>
                </label>

                <label>
                  Cover image
                  <div className="upload-row">
                    <input
                      type="text"
                      placeholder="/api/public/media/..."
                      value={edit.coverUrl || ''}
                      onChange={(e) => setEdit({ ...edit, coverUrl: e.target.value })}
                    />
                    <label className="upload-file-btn">
                      <Upload size={13} /> Upload
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'coverUrl')}
                      />
                    </label>
                  </div>
                </label>

                <div className="editor-row">
                  <label>
                    Accent color
                    <input
                      type="color"
                      value={edit.accentColor || '#146c66'}
                      onChange={(e) => setEdit({ ...edit, accentColor: e.target.value })}
                    />
                  </label>
                  <label>
                    Display order
                    <input
                      type="number"
                      value={edit.displayOrder || 0}
                      onChange={(e) => setEdit({ ...edit, displayOrder: +e.target.value })}
                    />
                  </label>
                </div>

                <div className="editor-row">
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={!!edit.featured}
                      onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
                    />
                    Featured on homepage
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={!!edit.published}
                      onChange={(e) => setEdit({ ...edit, published: e.target.checked })}
                    />
                    Published
                  </label>
                </div>

                <button className="admin-primary" type="submit">Save work</button>
              </form>
            )}

            {tab === 'translations' && (
              <form onSubmit={saveProduct} className="content-form">
                <p style={{ fontSize: '11px', color: '#687b74', margin: '0 0 10px' }}>
                  Provide localized French copy for this product. If left blank, English copy will be shown.
                </p>
                <label>
                  Slogan (Tagline FR)
                  <input
                    value={edit.taglineFr || ''}
                    placeholder="Slogan du produit en français"
                    onChange={(e) => setEdit({ ...edit, taglineFr: e.target.value })}
                  />
                </label>
                <label>
                  Description courte (FR)
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={edit.shortDescriptionFr || ''}
                    placeholder="Brève description en français"
                    onChange={(e) => setEdit({ ...edit, shortDescriptionFr: e.target.value })}
                  />
                </label>
                <label>
                  Description complète (FR)
                  <textarea
                    rows={5}
                    value={edit.longDescriptionFr || ''}
                    placeholder="Détails complets en français"
                    onChange={(e) => setEdit({ ...edit, longDescriptionFr: e.target.value })}
                  />
                </label>
                <button className="admin-primary" type="submit">Save French translation</button>
              </form>
            )}

            {tab === 'gallery' && (
              <div className="gallery-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: '12px' }}>Screenshots & Product Images</b>
                  <label className="upload-file-btn">
                    <ImageIcon size={13} /> Add screenshot
                    <input type="file" accept="image/png,image/jpeg" onChange={handleGalleryUpload} />
                  </label>
                </div>
                <div className="gallery-grid">
                  {gallery.map((g) => (
                    <div key={g.id} className="gallery-card">
                      <img src={g.imageUrl || g.image_url} alt={g.altText || g.alt_text || 'Screenshot'} />
                      <button type="button" onClick={() => deleteGalleryImage(g.id)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                {gallery.length === 0 && (
                  <div style={{ padding: '24px 0', textAlign: 'center', fontSize: '11px', color: '#7a8c85' }}>
                    No screenshots attached yet. Upload JPEG or PNG files above.
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
