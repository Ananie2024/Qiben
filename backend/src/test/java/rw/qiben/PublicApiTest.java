package rw.qiben;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ApiController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiErrors.class)
class PublicApiTest {
    @Autowired MockMvc mvc;
    @MockitoBean JdbcTemplate db;
    @MockitoBean PasswordEncoder encoder;
    @MockitoBean JavaMailSender mail;

    @Test
    void contactAcceptsValidSubmissionAndPersistsIt() throws Exception {
        when(db.update(startsWith("INSERT INTO contact_messages"), any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(1);
        mvc.perform(post("/api/public/contact").contentType("application/json").content("""
            {
                "name":"Test Sender",
                "email":"person@example.org",
                "phone":"+250780000000",
                "subject":"A new site",
                "budget":"$5,000 - $10,000",
                "timeline":"3 months",
                "serviceCategory":"Web & mobile apps",
                "message":"We would like to discuss a new website project.",
                "website":""
            }
            """)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("received"));

        verify(db).update(
            startsWith("INSERT INTO contact_messages"),
            eq("Test Sender"),
            eq("person@example.org"),
            eq("+250780000000"),
            eq("A new site"),
            eq("$5,000 - $10,000"),
            eq("3 months"),
            eq("Web & mobile apps"),
            anyString()
        );
    }

    @Test
    void contactRejectsInvalidEmailAndShortMessage() throws Exception {
        mvc.perform(post("/api/public/contact").contentType("application/json").content("""
            {"name":"A","email":"not-an-email","subject":"","message":"short"}
            """)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("validation_error"));

        verify(db, never()).update(startsWith("INSERT INTO contact_messages"), any(Object[].class));
    }

    @Test
    void newsletterSignupIsDuplicateSafe() throws Exception {
        when(db.update(contains("newsletter_subscribers"), any(Object[].class))).thenReturn(1);
        for (int i = 0; i < 2; i++) {
            mvc.perform(post("/api/public/newsletter").contentType("application/json").content("{\"email\":\"Person@Example.org\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("subscribed"));
        }
        verify(db, times(2)).update(contains("ON DUPLICATE KEY UPDATE"), eq("person@example.org"));
    }

    @Test
    void adminCanUpdateAStatistic() throws Exception {
        when(db.update(startsWith("UPDATE statistics"), any(), any(), any(), any(), any(), anyLong())).thenReturn(1);
        mvc.perform(put("/api/admin/statistics/1").contentType("application/json").content("""
            {"label":"Projects delivered","value":12,"suffix":"+","displayOrder":1,"visible":true}
            """)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("saved"));
    }

    @Test
    void adminCanCreateAProductRecord() throws Exception {
        mvc.perform(post("/api/admin/products").contentType("application/json").content("""
            {
                "type":"PRODUCT",
                "name":"Demo",
                "slug":"demo",
                "tagline":"A useful tool",
                "shortDescription":"A product description",
                "longDescription":"Full product details",
                "category":"Qiben product",
                "status":"LIVE",
                "featured":true,
                "accentColor":"#146c66",
                "techStack":["React", "Spring Boot"],
                "displayOrder":1,
                "published":true
            }
            """)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("created"));
    }

    @Test
    void productsSupportsCategoryAndTypeFilter() throws Exception {
        when(db.queryForList(anyString(), any(Object[].class))).thenReturn(List.of(
            Map.of("id", 1L, "name", "Demo Product", "type", "PRODUCT", "slug", "demo-product")
        ));

        mvc.perform(get("/api/public/products").param("type", "PRODUCT").param("category", "Software"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Demo Product"));
    }

    @Test
    void productDetailIncludesGalleryAndTranslation() throws Exception {
        when(db.queryForList(startsWith("SELECT * FROM products WHERE slug=?"), eq("demo"))).thenReturn(List.of(
            Map.of("id", 42L, "name", "Demo", "slug", "demo", "tagline", "English tagline", "short_description", "EN short")
        ));
        when(db.queryForList(contains("FROM product_translations"), eq(42L), eq("fr"))).thenReturn(List.of(
            Map.of("tagline", "Slogan français", "short_description", "Description courte")
        ));
        when(db.queryForList(contains("FROM product_images"), eq(42L))).thenReturn(List.of(
            Map.of("id", 101L, "imageUrl", "/api/public/media/screenshot.jpg", "altText", "Screenshot 1", "displayOrder", 1)
        ));

        mvc.perform(get("/api/public/products/demo").param("lang", "fr"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Demo"))
            .andExpect(jsonPath("$.tagline").value("Slogan français"))
            .andExpect(jsonPath("$.images[0].imageUrl").value("/api/public/media/screenshot.jpg"));
    }
}
