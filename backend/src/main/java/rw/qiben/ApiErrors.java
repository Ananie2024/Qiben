package rw.qiben;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String,Object>> invalid(MethodArgumentNotValidException e){String detail=e.getBindingResult().getFieldErrors().stream().findFirst().map(FieldError::getDefaultMessage).orElse("Request validation failed");return ResponseEntity.badRequest().body(Map.of("timestamp",Instant.now().toString(),"status",400,"error","validation_error","message",detail));}
 @ExceptionHandler(ResponseStatusException.class) ResponseEntity<Map<String,Object>> status(ResponseStatusException e){int s=e.getStatusCode().value();return ResponseEntity.status(e.getStatusCode()).body(Map.of("timestamp",Instant.now().toString(),"status",s,"error",e.getStatusCode().toString(),"message",e.getReason()==null?"Request failed":e.getReason()));}
 @ExceptionHandler(Exception.class) ResponseEntity<Map<String,Object>> unexpected(Exception e){return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("timestamp",Instant.now().toString(),"status",500,"error","internal_error","message","An unexpected error occurred"));}
}
