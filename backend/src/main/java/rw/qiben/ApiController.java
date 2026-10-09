package rw.qiben;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class ApiController {
    private final JdbcTemplate db;
    private final PasswordEncoder encoder;
    private final JavaMailSender mail;
    private final String secret, inbox, from;
    private final boolean secure;
    private final Map<String, ArrayDeque<Instant>> limits = new ConcurrentHashMap<>();

    ApiController(
        JdbcTemplate db,
        PasswordEncoder encoder,
        JavaMailSender mail,
        @Value("${qiben.jwt-secret:}") String secret,
        @Value("${qiben.inbox}") String inbox,
        @Value("${MAIL_FROM:no-reply@example.com}") String from,
        @Value("${qiben.cookie-secure:false}") boolean secure
    ) {
        this.db = db;
        this.encoder = encoder;
        this.mail = mail;
        this.secret = secret;
        this.inbox = inbox;
        this.from = from;
        this.secure = secure;
    }

    public record Contact(
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @Size(max = 40) String phone,
        @NotBlank @Size(max = 180) String subject,
        @Size(max = 60) String budget,
        @Size(max = 60) String timeline,
        @Size(max = 100) String serviceCategory,
        @NotBlank @Size(min = 10, max = 5000) String message,
        String website
    ) {}

    public record Signup(@NotBlank @Email @Size(max = 254) String email) {}
    public record Login(@NotBlank @Email String email, @NotBlank @Size(min = 12, max = 200) String password) {}
    public record ChangePassword(@NotBlank String currentPassword, @NotBlank @Size(min = 12, max = 200) String newPassword) {}

    @GetMapping("/api/public/products")
    List<Map<String, Object>> products(
        @RequestParam(required = false) Boolean featured,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search
    ) {
        StringBuilder sb = new StringBuilder(
            "SELECT id, type, name, slug, tagline, short_description AS shortDescription, " +
            "long_description AS longDescription, accent_color AS accentColor, logo_url AS logoUrl, " +
            "cover_url AS coverUrl, category, tech_stack AS techStack, public_url AS publicUrl, " +
            "client_name AS clientName, project_year AS year, display_order AS displayOrder " +
            "FROM products WHERE published=TRUE"
        );
        List<Object> params = new ArrayList<>();
        if (Boolean.TRUE.equals(featured)) {
            sb.append(" AND featured=TRUE");
        }
        if (type != null && !type.isBlank()) {
            sb.append(" AND type=?");
            params.add(type.toUpperCase());
        }
        if (category != null && !category.isBlank()) {
            sb.append(" AND category=?");
            params.add(category);
        }
        if (search != null && !search.isBlank()) {
            sb.append(" AND (name LIKE ? OR tagline LIKE ? OR short_description LIKE ?)");
            String s = "%" + search.trim() + "%";
            params.add(s);
            params.add(s);
            params.add(s);
        }
        sb.append(" ORDER BY display_order, id");
        return db.queryForList(sb.toString(), params.toArray());
    }

    @GetMapping("/api/public/products/{slug}")
    Map<String, Object> product(@PathVariable String slug, @RequestParam(required = false) String lang) {
        var rows = db.queryForList("SELECT * FROM products WHERE slug=? AND published=TRUE", slug);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        Map<String, Object> p = new LinkedHashMap<>(rows.get(0));
        long productId = ((Number) p.get("id")).longValue();

        if (lang != null && !lang.isBlank() && !lang.equalsIgnoreCase("en")) {
            var trans = db.queryForList(
                "SELECT tagline, short_description, long_description FROM product_translations WHERE product_id=? AND language=?",
                productId, lang.toLowerCase()
            );
            if (!trans.isEmpty()) {
                var t = trans.get(0);
                if (t.get("tagline") != null) p.put("tagline", t.get("tagline"));
                if (t.get("short_description") != null) p.put("short_description", t.get("short_description"));
                if (t.get("long_description") != null) p.put("long_description", t.get("long_description"));
            }
        }

        var images = db.queryForList(
            "SELECT id, image_url AS imageUrl, alt_text AS altText, display_order AS displayOrder " +
            "FROM product_images WHERE product_id=? ORDER BY display_order, id",
            productId
        );
        p.put("images", images);
        return p;
    }

    @GetMapping("/api/public/statistics")
    List<Map<String, Object>> statistics() {
        return db.queryForList("SELECT id, label, value, suffix FROM statistics WHERE visible=TRUE ORDER BY display_order, id");
    }

    private void rate(HttpServletRequest req, String route, int maximum) {
        String ip = Optional.ofNullable(req.getHeader("X-Forwarded-For")).orElse(req.getRemoteAddr()).split(",")[0].trim();
        String key = route + ":" + ip;
        Instant now = Instant.now();
        var q = limits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && q.peekFirst().isBefore(now.minusSeconds(3600))) q.removeFirst();
            if (q.size() >= maximum) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please try again later");
            q.addLast(now);
        }
    }

    @PostMapping("/api/public/contact")
    Map<String, String> contact(@Valid @RequestBody Contact c, HttpServletRequest req) {
        rate(req, "contact", 5);
        if (c.website() != null && !c.website().isBlank()) return Map.of("status", "received");
        db.update(
            "INSERT INTO contact_messages(name, email, phone, subject, budget, timeline, service_category, message) VALUES (?,?,?,?,?,?,?,?)",
            c.name().trim(),
            c.email().trim().toLowerCase(),
            c.phone() != null && !c.phone().isBlank() ? c.phone().trim() : null,
            c.subject().trim(),
            c.budget() != null && !c.budget().isBlank() ? c.budget().trim() : null,
            c.timeline() != null && !c.timeline().isBlank() ? c.timeline().trim() : null,
            c.serviceCategory() != null && !c.serviceCategory().isBlank() ? c.serviceCategory().trim() : null,
            c.message().trim()
        );
        try {
            var m = new SimpleMailMessage();
            m.setFrom(from);
            m.setTo(inbox);
            m.setReplyTo(c.email());
            m.setSubject("Website enquiry: " + c.subject());
            StringBuilder sb = new StringBuilder("From: ").append(c.name()).append(" <").append(c.email()).append(">\n");
            if (c.phone() != null && !c.phone().isBlank()) sb.append("Phone: ").append(c.phone()).append("\n");
            if (c.serviceCategory() != null && !c.serviceCategory().isBlank()) sb.append("Service: ").append(c.serviceCategory()).append("\n");
            if (c.budget() != null && !c.budget().isBlank()) sb.append("Budget: ").append(c.budget()).append("\n");
            if (c.timeline() != null && !c.timeline().isBlank()) sb.append("Timeline: ").append(c.timeline()).append("\n");
            sb.append("\n").append(c.message());
            m.setText(sb.toString());
            mail.send(m);

            var reply = new SimpleMailMessage();
            reply.setFrom(from);
            reply.setTo(c.email());
            reply.setSubject("We received your message");
            reply.setText("Thank you for contacting Qiben. Our team will get back to you shortly.");
            mail.send(reply);
        } catch (Exception ignored) {}
        return Map.of("status", "received");
    }

    @PostMapping("/api/public/newsletter")
    Map<String, String> subscribe(@Valid @RequestBody Signup s, HttpServletRequest req) {
        rate(req, "newsletter", 8);
        db.update("INSERT INTO newsletter_subscribers(email) VALUES (?) ON DUPLICATE KEY UPDATE active=TRUE", s.email().trim().toLowerCase());
        return Map.of("status", "subscribed");
    }

    @PostMapping("/api/auth/login")
    Map<String, String> login(@Valid @RequestBody Login l, HttpServletRequest req, HttpServletResponse res) {
        rate(req, "login", 8);
        var users = db.queryForList("SELECT id, email, password_hash, failed_logins, locked_until, active FROM admin_users WHERE email=?", l.email().toLowerCase());
        if (users.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        var u = users.get(0);
        Integer failed = (Integer) u.get("failed_logins");
        if (Boolean.FALSE.equals(u.get("active")) || (u.get("locked_until") != null && ((java.sql.Timestamp) u.get("locked_until")).toInstant().isAfter(Instant.now()))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account temporarily locked");
        }
        if (!encoder.matches(l.password(), (String) u.get("password_hash"))) {
            int n = failed + 1;
            db.update("UPDATE admin_users SET failed_logins=?,locked_until=? WHERE id=?", n, n >= 8 ? java.sql.Timestamp.from(Instant.now().plusSeconds(900)) : null, u.get("id"));
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        db.update("UPDATE admin_users SET failed_logins=0,locked_until=NULL WHERE id=?", u.get("id"));
        if (secret.length() < 32) throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "JWT_SECRET must be at least 32 characters");
        String email = (String) u.get("email");
        String access = token(email, "access", 900);
        String refresh = token(email, "refresh", 604800);
        res.addHeader("Set-Cookie", "qiben_refresh=" + refresh + "; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=604800" + (secure ? "; Secure" : ""));
        return Map.of("accessToken", access, "tokenType", "Bearer");
    }

    @PostMapping("/api/auth/refresh")
    Map<String, String> refresh(@CookieValue(value = "qiben_refresh", required = false) String cookie) {
        if (cookie == null || secret.length() < 32) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        try {
            var claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))).build().parseSignedClaims(cookie).getPayload();
            if (!"refresh".equals(claims.get("kind"))) throw new IllegalArgumentException();
            return Map.of("accessToken", token(claims.getSubject(), "access", 900));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }

    private String token(String email, String kind, long seconds) {
        return Jwts.builder()
            .subject(email)
            .claim("role", "ADMIN")
            .claim("kind", kind)
            .issuedAt(new Date())
            .expiration(Date.from(Instant.now().plusSeconds(seconds)))
            .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
            .compact();
    }

    @PostMapping("/api/auth/logout")
    Map<String, String> logout(HttpServletResponse r) {
        r.addHeader("Set-Cookie", "qiben_refresh=; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=0" + (secure ? "; Secure" : ""));
        return Map.of("status", "logged_out");
    }

    @GetMapping("/api/admin/dashboard")
    Map<String, Object> dashboard() {
        return Map.of(
            "messages", db.queryForObject("SELECT COUNT(*) FROM contact_messages", Integer.class),
            "newMessages", db.queryForObject("SELECT COUNT(*) FROM contact_messages WHERE status='NEW'", Integer.class),
            "newThisMonth", db.queryForObject("SELECT COUNT(*) FROM contact_messages WHERE created_at>=DATE_FORMAT(CURRENT_DATE,'%Y-%m-01')", Integer.class),
            "publishedProducts", db.queryForObject("SELECT COUNT(*) FROM products WHERE published=TRUE AND type='PRODUCT'", Integer.class),
            "publishedProjects", db.queryForObject("SELECT COUNT(*) FROM products WHERE published=TRUE AND type='PROJECT'", Integer.class)
        );
    }

    @GetMapping("/api/admin/messages")
    Map<String, Object> messages(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search
    ) {
        int p = Math.max(0, page), s = Math.min(100, Math.max(1, size));
        String filter = " WHERE (? IS NULL OR status=?) AND (? IS NULL OR name LIKE ? OR email LIKE ? OR subject LIKE ?)";
        var rows = db.queryForList(
            "SELECT * FROM contact_messages" + filter + " ORDER BY created_at DESC LIMIT ? OFFSET ?",
            status, status, search, search == null ? null : "%" + search + "%",
            search == null ? null : "%" + search + "%", search == null ? null : "%" + search + "%",
            s, p * s
        );
        Integer total = db.queryForObject(
            "SELECT COUNT(*) FROM contact_messages" + filter,
            Integer.class, status, status, search, search == null ? null : "%" + search + "%",
            search == null ? null : "%" + search + "%", search == null ? null : "%" + search + "%"
        );
        return Map.of("items", rows, "page", p, "size", s, "total", total);
    }

    @PatchMapping("/api/admin/messages/{id}/status")
    Map<String, String> setStatus(@PathVariable long id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "");
        if (!Set.of("NEW", "READ", "REPLIED", "ARCHIVED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
        db.update("UPDATE contact_messages SET status=? WHERE id=?", status, id);
        return Map.of("status", status);
    }

    @PostMapping("/api/admin/messages/{id}/notes")
    Map<String, String> note(@PathVariable long id, @RequestBody Map<String, String> body, Authentication auth) {
        String n = body.getOrDefault("note", "").trim();
        if (n.isBlank() || n.length() > 5000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Note is required");
        String email = auth != null ? auth.getName() : null;
        Long adminId = null;
        if (email != null) {
            var list = db.queryForList("SELECT id FROM admin_users WHERE email=?", Long.class, email.toLowerCase());
            if (!list.isEmpty()) adminId = list.get(0);
        }
        if (adminId == null) {
            adminId = db.queryForObject("SELECT id FROM admin_users ORDER BY id LIMIT 1", Long.class);
        }
        db.update("INSERT INTO message_notes(message_id,admin_user_id,note) VALUES (?,?,?)", id, adminId, n);
        return Map.of("status", "saved");
    }

    @DeleteMapping("/api/admin/messages/{id}")
    Map<String, String> deleteMessage(@PathVariable long id) {
        db.update("DELETE FROM contact_messages WHERE id=?", id);
        return Map.of("status", "deleted");
    }

    @GetMapping("/api/admin/messages/{id}/notes")
    List<Map<String, Object>> notes(@PathVariable long id) {
        return db.queryForList("SELECT n.id, n.note, n.created_at, u.email AS author FROM message_notes n JOIN admin_users u ON u.id=n.admin_user_id WHERE message_id=? ORDER BY n.created_at", id);
    }

    @PostMapping("/api/admin/change-password")
    Map<String, String> changePassword(@Valid @RequestBody ChangePassword body, Authentication auth) {
        if (auth == null || auth.getName() == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var rows = db.queryForList("SELECT id, password_hash FROM admin_users WHERE email=?", auth.getName().toLowerCase());
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var u = rows.get(0);
        if (!encoder.matches(body.currentPassword(), (String) u.get("password_hash"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        db.update("UPDATE admin_users SET password_hash=? WHERE id=?", encoder.encode(body.newPassword()), u.get("id"));
        return Map.of("status", "password_updated");
    }

    @GetMapping("/api/admin/statistics")
    List<Map<String, Object>> adminStats() {
        return db.queryForList("SELECT * FROM statistics ORDER BY display_order, id");
    }

    @PostMapping("/api/admin/statistics")
    Map<String, String> createStat(@RequestBody Map<String, Object> b) {
        db.update("INSERT INTO statistics(label, value, suffix, display_order, visible) VALUES (?,?,?,?,?)",
            b.get("label"), b.getOrDefault("value", 0), b.getOrDefault("suffix", "+"), b.getOrDefault("displayOrder", 0), b.getOrDefault("visible", true));
        return Map.of("status", "created");
    }

    @PutMapping("/api/admin/statistics/{id}")
    Map<String, String> updateStat(@PathVariable long id, @RequestBody Map<String, Object> b) {
        db.update("UPDATE statistics SET label=?, value=?, suffix=?, display_order=?, visible=? WHERE id=?",
            b.get("label"), b.get("value"), b.get("suffix"), b.get("displayOrder"), b.get("visible"), id);
        return Map.of("status", "saved");
    }

    @DeleteMapping("/api/admin/statistics/{id}")
    Map<String, String> deleteStat(@PathVariable long id) {
        db.update("DELETE FROM statistics WHERE id=?", id);
        return Map.of("status", "deleted");
    }

    @GetMapping("/api/admin/products")
    List<Map<String, Object>> adminProducts() {
        return db.queryForList("SELECT * FROM products ORDER BY display_order, id");
    }

    @PostMapping("/api/admin/products")
    Map<String, Object> createProduct(@RequestBody Map<String, Object> b) {
        Object techStack = b.get("techStack");
        String techJson = null;
        if (techStack instanceof String s) {
            techJson = s;
        } else if (techStack instanceof List<?> l) {
            techJson = "[" + String.join(",", l.stream().map(x -> "\"" + x.toString().replace("\"", "\\\"") + "\"").toList()) + "]";
        }
        db.update(
            "INSERT INTO products(type, name, slug, tagline, short_description, long_description, category, status, featured, accent_color, logo_url, cover_url, public_url, client_name, project_year, display_order, published, tech_stack) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            b.get("type"), b.get("name"), b.get("slug"), b.get("tagline"), b.get("shortDescription"), b.get("longDescription"), b.get("category"),
            b.getOrDefault("status", "IN_DEVELOPMENT"), b.getOrDefault("featured", false), b.getOrDefault("accentColor", "#146c66"),
            b.get("logoUrl"), b.get("coverUrl"), b.get("publicUrl"), b.get("clientName"), b.get("year"), b.getOrDefault("displayOrder", 0), b.getOrDefault("published", false), techJson
        );
        return Map.of("status", "created");
    }

    @PutMapping("/api/admin/products/{id}")
    Map<String, String> updateProduct(@PathVariable long id, @RequestBody Map<String, Object> b) {
        Object techStack = b.get("techStack");
        String techJson = null;
        if (techStack instanceof String s) {
            techJson = s;
        } else if (techStack instanceof List<?> l) {
            techJson = "[" + String.join(",", l.stream().map(x -> "\"" + x.toString().replace("\"", "\\\"") + "\"").toList()) + "]";
        }
        db.update(
            "UPDATE products SET type=?, name=?, slug=?, tagline=?, short_description=?, long_description=?, category=?, status=?, featured=?, accent_color=?, logo_url=?, cover_url=?, public_url=?, client_name=?, project_year=?, display_order=?, published=?, tech_stack=? WHERE id=?",
            b.get("type"), b.get("name"), b.get("slug"), b.get("tagline"), b.get("shortDescription"), b.get("longDescription"), b.get("category"),
            b.get("status"), b.get("featured"), b.get("accentColor"), b.get("logoUrl"), b.get("coverUrl"), b.get("publicUrl"), b.get("clientName"), b.get("year"), b.get("displayOrder"), b.get("published"), techJson, id
        );
        return Map.of("status", "saved");
    }

    @DeleteMapping("/api/admin/products/{id}")
    Map<String, String> deleteProduct(@PathVariable long id) {
        db.update("DELETE FROM products WHERE id=?", id);
        return Map.of("status", "deleted");
    }

    @GetMapping("/api/admin/products/{id}/images")
    List<Map<String, Object>> productImages(@PathVariable long id) {
        return db.queryForList("SELECT id, media_id AS mediaId, image_url AS imageUrl, alt_text AS altText, display_order AS displayOrder FROM product_images WHERE product_id=? ORDER BY display_order, id", id);
    }

    @PostMapping("/api/admin/products/{id}/images")
    Map<String, Object> addProductImage(@PathVariable long id, @RequestBody Map<String, Object> b) {
        Object mediaId = b.get("mediaId");
        String imageUrl = (String) b.getOrDefault("imageUrl", "");
        String altText = (String) b.getOrDefault("altText", "");
        int order = b.get("displayOrder") != null ? ((Number) b.get("displayOrder")).intValue() : 0;
        if (imageUrl.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image URL is required");
        db.update("INSERT INTO product_images(product_id, media_id, image_url, alt_text, display_order) VALUES (?,?,?,?,?)", id, mediaId, imageUrl, altText, order);
        return Map.of("status", "added");
    }

    @DeleteMapping("/api/admin/products/{id}/images/{imageId}")
    Map<String, String> deleteProductImage(@PathVariable long id, @PathVariable long imageId) {
        db.update("DELETE FROM product_images WHERE id=? AND id=?", id, imageId);
        return Map.of("status", "deleted");
    }

    @PutMapping("/api/admin/products/{id}/images/reorder")
    Map<String, String> reorderProductImages(@PathVariable long id, @RequestBody List<Map<String, Object>> items) {
        for (var item : items) {
            long imgId = ((Number) item.get("id")).longValue();
            int order = ((Number) item.get("displayOrder")).intValue();
            db.update("UPDATE product_images SET display_order=? WHERE product_id=? AND id=?", order, id, imgId);
        }
        return Map.of("status", "reordered");
    }

    @GetMapping("/api/admin/products/{id}/translations")
    List<Map<String, Object>> productTranslations(@PathVariable long id) {
        return db.queryForList("SELECT language, tagline, short_description AS shortDescription, long_description AS longDescription FROM product_translations WHERE product_id=?", id);
    }

    @PutMapping("/api/admin/products/{id}/translations/{lang}")
    Map<String, String> updateProductTranslation(@PathVariable long id, @PathVariable String lang, @RequestBody Map<String, String> b) {
        String tagline = b.getOrDefault("tagline", "").trim();
        String shortDesc = b.getOrDefault("shortDescription", "").trim();
        String longDesc = b.getOrDefault("longDescription", "").trim();
        db.update(
            "INSERT INTO product_translations(product_id, language, tagline, short_description, long_description) VALUES (?,?,?,?,?) " +
            "ON DUPLICATE KEY UPDATE tagline=VALUES(tagline), short_description=VALUES(short_description), long_description=VALUES(long_description)",
            id, lang.toLowerCase(), tagline, shortDesc, longDesc
        );
        return Map.of("status", "saved");
    }
}
