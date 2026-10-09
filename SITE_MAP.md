# Qiben Ltd — Site Map & Wireframe Guide

## 1. Site Map (one page)

| Route | Page | Primary purpose | Admin route |
|-------|------|-----------------|-------------|
| `/` | Home | Hero → Who we are → 6 services → own products showcase → why Qiben + stats → process → technologies → selected projects → trusted by → testimonials → final CTA → contact → footer | N/A |
| `/services` | Services | Service overview + detailed section per service + CTA | N/A |
| `/products` | Products & Work | Browse all published products & client projects, filter by type/category | N/A |
| `/products/:slug` | Product/Project detail | Full product page generated at build time from published content | N/A |
| `/about` | About | Story, values, team, location + CTA | N/A |
| `/contact` | Contact | Quote form + contact details + map | N/A |
| `/privacy` / `/terms` | Privacy & Terms | Single simple legal page (merged) | N/A |
| `/admin/login` | Admin login | Email/password only, no registration | — |
| `/admin/*` | Admin workspace | Dashboard, messages, products/projects, statistics (protected) | Noindex, not in sitemap |

## 2. Wireframe Descriptions — Public Pages

### 2.1 Home (`/`)
**In order, top to bottom:**

1. **Sticky header** — logo (left), nav (Services · Products & Work · About · Contact), "Get a Quote" primary button, theme toggle, language toggle (desktop); hamburger menu on mobile.
2. **Hero** — headline "We build software that moves your business forward.", one-sentence subhead, two CTA buttons ("Get Started" → contact; "Our Products" → /products), three proof chips ("Rwanda-rooted", "East Africa-focused", "Global standards").
3. **Who we are** — purpose statement, three outcome bullets ("Faster time to market", "Lower total cost of ownership", "Software that fits your workflows"), one image (authentic Kigali/Rwanda context or team working).
4. **Services (6 cards)** — Custom Software Development, Web & Mobile Apps, UI/UX Design, API Development & Integration, QA Testing & Automation, Cloud & DevOps. Each with icon, title, short description.
5. **Our products** — featured products from the database as branded cards: logo, name, tagline, accent color, short description, "View product" button.
6. **Why Qiben + statistics strip** — 3–4 differentiators (small senior team, stays close to goals, Rwanda-rooted with global standards, transparent process), animated counters (projects delivered, clients served, years of experience, products launched) loaded from database.
7. **Process** — Discover → Design → Build → Test → Launch → Support as a six-step horizontal flow, collapsing to a stack on mobile.
8. **Technologies** — horizontal strip of tech logos (React, TypeScript, Java, Spring, PostgreSQL/MariaDB, Docker, AWS).
9. **Selected projects** — 3–4 featured client projects from database with cover image, name, tagline, category, "View" link.
10. **Trusted by** — client/partner logo row (clearly marked placeholder row).
11. **Testimonials** — small carousel (placeholder quotes, clearly marked until real feedback arrives).
12. **Final CTA band** — "Tell us what you're building." + "Let's make it happen" button.
13. **Contact block** — short form (name, email, subject, message), email, phone/WhatsApp button, map link.
14. **Footer** — nav links, social links, legal link, "© Qiben Ltd" + privacy link.
### 2.2 Services (`/services`)
1. Header.
2. Hero bar — title "Services we offer", short lead, "Get a quote" CTA.
3. Service grid — 6 service cards with icons and one-sentence descriptions (same cards as homepage, linked).
4. Service detail rows — accordion or dedicated section per service: what it covers, when it's useful, typical outcomes, example deliverables.
5. Technologies used across services.
6. CTA band + footer.

### 2.3 Products & Work (`/products`)
1. Header.
2. Filter bar — type (All / Products / Projects), category, search by name.
3. Results grid — card per published item: cover image, accent-colored type chip, name, tagline, short description, "View" button.
4. Pagination controls.
5. CTA band + footer.

### 2.4 Product / Project Detail (`/products/:slug`)
Built from published database records + translations:
1. Brand-colored hero bar (accent from record) — product type chip, logo, name, tagline.
2. Key details side panel: status, category, year, client (optional), public link, tech stack tags, display order.
3. Main content: short + long description (localized).
4. Screenshot gallery (from `product_images`).
5. "View product" button (public link if set).
6. Related items (3 similar products/projects).
7. CTA band + footer.

### 2.5 About (`/about`)
1. Header.
2. Story — founder narrative / how Qiben started, Rwanda-rooted context.
3. Values — 4–5 core values with short explanations.
4. Team — team member cards (photo placeholder + name + role + bio); placeholders marked until supplied.
5. Location — Kigali office context, working across Rwanda/East Africa; map placeholder.
6. CTA band + footer.

### 2.6 Contact (`/contact`)
1. Header.
2. Quote form — name, email, subject, message (+ optional budget, service of interest, project timeline). Validation + honeypot + rate limit; saved to DB; auto-reply email.
3. Contact details — email, phone/WhatsApp, office address with map link.
4. What happens next — 3 short steps (we review → we reply → we schedule).
5. Footer.

### 2.7 Privacy & Terms (`/privacy`)
Single page with two anchor sections: Privacy Policy and Terms of Use (simple, plain language, placeholders for address, email, analytics provider). No index on admin, no login required.

## 3. Wireframe Descriptions — Admin Screens

### 3.1 Admin login (`/admin/login`)
- Brand mark, "Private team area" eyebrow, email/password fields, error message, link back to website. No registration. First admin seeded from environment at server start.

### 3.2 Dashboard (`/admin`)
Sidebar (Overview, Messages, Products & projects, Statistics, Settings) + main panel:
- KPI cards: total messages, new this month, published products, published projects.
- Quick stats table: recent messages.

### 3.3 Messages (`/admin/messages`)
- Search input + status filter (All / New / Read / Replied / Archived).
- Table: ID, name, email, subject, status chip, created date, unread badge column.
- Row click opens message view in a drawer: full message, sender details, update-status dropdown, internal notes list + add note form, delete button, export CSV.

### 3.4 Products & Projects (`/admin/products`)
- Table: type chip, name, slug, status chip, featured, published, display order, actions (edit, delete).
- "Add work" button opens editor drawer.
- Editor fields: type (product/project), name, slug, tagline, short desc, long desc, category, status (live/in development/archived), featured, accent color picker, logo upload, cover upload, screenshot gallery (drag-drop, reorder, delete), tech stack tags, public URL, client name, year, display order, publish toggle, translations EN/FR tabs, save.

### 3.5 Statistics (`/admin/statistics`)
- Table of homepage counters: label, value, suffix, display order, visible.
- Add/edit rows inline (no external library): label, numeric value, suffix, order, visible checkbox, save.

### 3.6 Settings (`/admin/settings`)
- Environment-managed settings summary: site URL, inbox email, media root, cookie security, first-admin credentials (change password hint). No live editing of secrets; link to README deployment guide.

## 4. Navigation & Footer Links

- **Primary nav:** Services · Products & Work · About · Contact + "Get a Quote" CTA.
- **Footer nav:** Services, Products & Work, About, Contact, Privacy & Terms.
- **Footer social:** LinkedIn, Instagram placeholders.
- **Admin:** only reachable by known URL `/admin/*`, excluded from sitemap, marked `noindex`.