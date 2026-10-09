# Qiben Ltd

Qiben’s marketing site and private team admin are delivered as a small monorepo: a React/Vite frontend and Spring Boot API backed by MariaDB.

## Local development

Requirements: Node 20+, Java 17+, Docker Compose.

1. Copy `.env.example` to `.env` and set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, and SMTP settings.
2. Start MariaDB and the API: `docker compose up -d --build db api` (API on 8080; MariaDB on 3306).
3. In `frontend`, run `npm install` and `npm run dev` (site on 5173; Vite proxies `/api`). For the containerized site, build static assets after the API is up, then run `docker compose build web` and `docker compose up -d web`.

Flyway creates the schema and placeholder public content on API startup. The first admin is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD` at startup; no registration endpoint exists. Change the seed password after first login.

## Environment

See `.env.example`. Set `SITE_URL` to the public canonical origin. Configure SMTP to deliver inbox notifications and sender auto-replies. Contact submissions remain saved when mail delivery is unavailable. Media is stored on the mounted `MEDIA_ROOT` volume; `MediaStorage` is the seam for a future S3 implementation.

## Production

Build the frontend with `PRERENDER_API_URL=http://localhost:8080 SITE_URL=https://your-domain.example npm run build` after the API is available. This writes product pages, sitemap and metadata from published content to `frontend/dist`; the static Docker image then serves those prerendered files. Rebuild the assets and web image after changing published content. The build also includes crawlable homepage content. A sample reverse proxy is in `deploy/nginx.conf`.

The app sets security headers and uses BCrypt, short-lived JWT access tokens, an HTTP-only refresh cookie, login throttling, form throttling, validation and a honeypot. Use HTTPS in production; secure cookie behavior is enabled by `COOKIE_SECURE`.

### VPS and Nginx deployment

Point the domain A/AAAA records at the VPS, install Docker Compose, Nginx and Certbot, then obtain a certificate with `certbot certonly --nginx -d qiben.example -d www.qiben.example`. Replace the example domains and certificate paths in `deploy/nginx.conf`, enable the file in Nginx, and reload it. Copy this repository to the server and configure `.env` with production secrets and `COOKIE_SECURE=true`. Start the database/API with `docker compose up -d --build db api`; build published pages from the VPS with the command above, then run `docker compose build web && docker compose up -d web`. The frontend and API bind to localhost ports 8088 and 8080; MariaDB is not exposed publicly. Nginx terminates TLS and forwards browser traffic. Back up the `qiben-db` and `qiben-media` Docker volumes regularly.

## API

OpenAPI UI is at `/swagger-ui.html`. Public APIs: `GET /api/public/products`, `GET /api/public/statistics`, `POST /api/public/contact`, `POST /api/public/newsletter`. Admin APIs are under `/api/admin/**`; authentication uses `/api/auth/login`, `/api/auth/refresh`, and `/api/auth/logout`. Admin product/message/statistics endpoints use pagination where applicable.

## Sitemap and wireframes

| Route | Page / wireframe |
|---|---|
| `/` | Hero + primary CTA → six service cards → featured own products → differentiators and statistics → six-step process → technologies → selected projects → partner placeholders → testimonial placeholders → CTA → contact form → footer. |
| `/products/:slug` | Product/project cover and brand → tagline/description → stack and gallery → public link → contact CTA. Built from published database records. |
| `/#contact` | Contact details (explicit placeholders) → quote form → location/map link placeholder → footer, as the final section of the homepage. |
| `/admin/login` | Email/password form and validation. |
| `/admin` | Sidebar; dashboard counts; messages table/search/status, message view/notes/CSV; products/projects editor with publish/reorder/media fields; statistics editor. |

Admin is authenticated, excluded from sitemap and marked noindex. Public content uses canonical URLs, Open Graph/Twitter tags and JSON-LD. Product pages include Product or CreativeWork data. Language defaults to English with French translations and a language switch.

## Design system

- Ink `#102A43`, primary `#146C66`, accent `#F0A85B`, paper `#F7F8F6`, slate `#64748B`.
- Inter/system sans; display 56/48/36/28px, body 16/18px, small 13px; 8px spacing base.
- Components: pill navigation, solid/outline buttons, bordered cards, section eyebrow, status chips, form fields, toast, responsive table and sidebar.

## Data model (ERD summary)

```text
admin_users 1──* contact_messages (reviewed_by)
contact_messages 1──* message_notes
products 1──* product_images
products 1──* product_translations (EN/FR)
media 1──* product_images (asset reference)
newsletter_subscribers (unique email)
statistics
```

Flyway migrations are under `backend/src/main/resources/db/migration`. Tables cover admin users, messages and internal notes, newsletter subscribers, products/projects, translations, gallery images, statistics, and media.

## Before launch: Qiben must supply

- Logo and approved brand colors; real tagline and service copy.
- Product/project names, approved descriptions, links, logo/cover/gallery screenshots, year, client permission, tech tags and translated EN/FR copy.
- Real statistics, team photos/bios, client/partner logos and written testimonials with approval.
- Business email, phone/WhatsApp, office address and map link.
- Privacy policy, cookie/legal text, domain, SMTP credentials, first admin email and strong password.
- Analytics provider/site ID (optional; the site includes a privacy-friendly analytics integration placeholder).

All unprovided identities, metrics, testimonials, contact details, and brands are marked placeholders in the UI; none are represented as verified claims. The supplied launch preference is English-only; product translation storage supports English and French for a later bilingual launch.
