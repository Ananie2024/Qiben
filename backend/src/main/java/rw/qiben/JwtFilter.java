package rw.qiben;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
 private final String secret;
 public JwtFilter(@Value("${qiben.jwt-secret:}") String secret){this.secret=secret;}
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  String h=request.getHeader("Authorization");
  if(h!=null&&h.startsWith("Bearer ")&&secret.length()>=32)try{var c=Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))).build().parseSignedClaims(h.substring(7)).getPayload();if(!"access".equals(c.get("kind")))throw new IllegalArgumentException("Not access token");var a=new UsernamePasswordAuthenticationToken(c.getSubject(),null,List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));SecurityContextHolder.getContext().setAuthentication(a);}catch(Exception ignored){}
  chain.doFilter(request,response);
 }
}
