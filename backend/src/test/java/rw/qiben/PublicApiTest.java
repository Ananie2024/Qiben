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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers=ApiController.class)
@AutoConfigureMockMvc(addFilters=false)
@Import(ApiErrors.class)
class PublicApiTest {
 @Autowired MockMvc mvc;
 @MockitoBean JdbcTemplate db;
 @MockitoBean PasswordEncoder encoder;
 @MockitoBean JavaMailSender mail;
 @Test void contactAcceptsValidSubmissionAndPersistsIt() throws Exception {
  when(db.update(startsWith("INSERT INTO contact_messages"),any(),any(),any(),any())).thenReturn(1);
  mvc.perform(post("/api/public/contact").contentType("application/json").content("""
   {"name":"Test Sender","email":"person@example.org","subject":"A new site","message":"We would like to discuss a new website project.","website":""}
   """)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("received"));
  verify(db).update(startsWith("INSERT INTO contact_messages"),eq("Test Sender"),eq("person@example.org"),eq("A new site"),anyString());
 }
 @Test void contactRejectsInvalidEmailAndShortMessage() throws Exception {
  mvc.perform(post("/api/public/contact").contentType("application/json").content("""
   {"name":"A","email":"not-an-email","subject":"","message":"short"}
   """)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("validation_error"));
  verify(db,never()).update(startsWith("INSERT INTO contact_messages"),any(),any(),any(),any());
 }
 @Test void newsletterSignupIsDuplicateSafe() throws Exception {
  when(db.update(contains("newsletter_subscribers"), any(Object[].class))).thenReturn(1);
  for(int i=0;i<2;i++)mvc.perform(post("/api/public/newsletter").contentType("application/json").content("{\"email\":\"Person@Example.org\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("subscribed"));
  verify(db,times(2)).update(contains("ON DUPLICATE KEY UPDATE"),eq("person@example.org"));
 }
 @Test void adminCanUpdateAStatistic() throws Exception {
  when(db.update(startsWith("UPDATE statistics"),any(),any(),any(),any(),any(),anyLong())).thenReturn(1);
  mvc.perform(put("/api/admin/statistics/1").contentType("application/json").content("""
   {"label":"Projects delivered","value":12,"suffix":"+","displayOrder":1,"visible":true}
   """)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("saved"));
 }
 @Test void adminCanCreateAProductRecord() throws Exception {
  mvc.perform(post("/api/admin/products").contentType("application/json").content("""
   {"type":"PRODUCT","name":"Demo","slug":"demo","tagline":"A useful tool","shortDescription":"A product description","longDescription":"Full product details","category":"Qiben product","status":"LIVE","featured":true,"accentColor":"#146c66","displayOrder":1,"published":true}
   """)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("created"));
 }
}
