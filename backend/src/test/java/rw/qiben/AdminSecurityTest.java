package rw.qiben;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers=ApiController.class,properties="qiben.jwt-secret=0123456789abcdef0123456789abcdef")
@Import({ApiConfig.class,JwtFilter.class,ApiErrors.class})
class AdminSecurityTest {
 @Autowired MockMvc mvc;
 @MockitoBean JdbcTemplate db;
 @MockitoBean PasswordEncoder encoder;
 @MockitoBean JavaMailSender mail;
 private String token(){return Jwts.builder().subject("admin@example.org").claim("kind","access").issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+60_000)).signWith(Keys.hmacShaKeyFor("0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.UTF_8))).compact();}
 @Test void adminEndpointsRejectRequestsWithoutAccessToken() throws Exception {mvc.perform(get("/api/admin/dashboard")).andExpect(status().isUnauthorized());}
 @Test void adminEndpointsAcceptAValidAdminAccessToken() throws Exception {
  when(db.queryForObject("SELECT COUNT(*) FROM contact_messages",Integer.class)).thenReturn(2);
  when(db.queryForObject("SELECT COUNT(*) FROM contact_messages WHERE status='NEW'",Integer.class)).thenReturn(1);
  when(db.queryForObject("SELECT COUNT(*) FROM contact_messages WHERE created_at>=DATE_FORMAT(CURRENT_DATE,'%Y-%m-01')",Integer.class)).thenReturn(1);
  when(db.queryForObject("SELECT COUNT(*) FROM products WHERE published=TRUE AND type='PRODUCT'",Integer.class)).thenReturn(1);
  when(db.queryForObject("SELECT COUNT(*) FROM products WHERE published=TRUE AND type='PROJECT'",Integer.class)).thenReturn(0);
  mvc.perform(get("/api/admin/dashboard").header("Authorization","Bearer "+token())).andExpect(status().isOk());
 }
}
