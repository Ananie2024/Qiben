package rw.qiben;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class Startup {
 @Bean ApplicationRunner seedAdmin(JdbcTemplate db, PasswordEncoder encoder, @Value("${qiben.admin-email:}") String email, @Value("${qiben.admin-password:}") String password){
  return args->{ if(email!=null&&!email.isBlank()&&password!=null&&password.length()>=12&&db.queryForObject("SELECT COUNT(*) FROM admin_users",Integer.class)==0) db.update("INSERT INTO admin_users(email,password_hash) VALUES (?,?)",email.toLowerCase(),encoder.encode(password)); };
 }
}
