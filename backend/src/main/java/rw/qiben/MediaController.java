package rw.qiben;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import static org.springframework.http.HttpStatus.*;

@RestController
public class MediaController {
 private final MediaStorage storage;private final JdbcTemplate db;
 MediaController(MediaStorage storage,JdbcTemplate db){this.storage=storage;this.db=db;}
 @PostMapping(value="/api/admin/media",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) Map<String,Object> upload(@RequestPart("file") MultipartFile file){if(file.isEmpty()||file.getSize()>8L*1024*1024)throw new ResponseStatusException(BAD_REQUEST,"Image must be under 8 MB");if(!java.util.Set.of("image/jpeg","image/png").contains(file.getContentType()))throw new ResponseStatusException(UNSUPPORTED_MEDIA_TYPE,"Upload a JPEG or PNG image");try{String key=storage.save(file.getBytes());db.update("INSERT INTO media(original_name,storage_key,content_type,size_bytes) VALUES (?,?,?,?)",file.getOriginalFilename(),key,"image/jpeg",file.getSize());return Map.of("storageKey",key,"url","/api/public/media/"+key,"contentType","image/jpeg");}catch(IllegalArgumentException e){throw new ResponseStatusException(BAD_REQUEST,e.getMessage());}catch(Exception e){throw new ResponseStatusException(INTERNAL_SERVER_ERROR,"Could not store image");}}
 @GetMapping(value="/api/public/media/{key}",produces="image/jpeg") ResponseEntity<byte[]> get(@PathVariable String key){try{return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).cacheControl(CacheControl.maxAge(365,TimeUnit.DAYS).cachePublic()).body(storage.load(key));}catch(Exception e){throw new ResponseStatusException(NOT_FOUND);}}
}
