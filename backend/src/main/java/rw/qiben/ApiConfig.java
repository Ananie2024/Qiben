package rw.qiben;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class ApiConfig {
    @Bean PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(12); }
    @Bean CorsConfigurationSource cors(@Value("${qiben.frontend-origin}") String origin){
        var c=new CorsConfiguration(); c.setAllowedOrigins(List.of(origin)); c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS")); c.setAllowedHeaders(List.of("Authorization","Content-Type")); c.setAllowCredentials(true);
        var s=new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**",c); return s;
    }
    @Bean SecurityFilterChain security(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        return http.csrf(csrf->csrf.disable()).cors(Customizer.withDefaults()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).exceptionHandling(e->e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))).headers(h->h.frameOptions(f->f.deny()).contentTypeOptions(Customizer.withDefaults()).httpStrictTransportSecurity(x->x.includeSubDomains(true).maxAgeInSeconds(31536000))).authorizeHttpRequests(a->a.requestMatchers("/api/public/**","/api/auth/**","/swagger-ui/**","/swagger-ui.html","/v3/api-docs/**","/error").permitAll().requestMatchers(HttpMethod.OPTIONS,"/**").permitAll().anyRequest().hasRole("ADMIN")).addFilterBefore(jwtFilter,UsernamePasswordAuthenticationFilter.class).httpBasic(b->b.disable()).formLogin(f->f.disable()).build();
    }
}
