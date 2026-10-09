package rw.qiben;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Component
public class LocalMediaStorage implements MediaStorage {
 private final Path root;
 LocalMediaStorage(@Value("${qiben.media-root:./media}") String root){this.root=Path.of(root).toAbsolutePath().normalize();}
 public String save(byte[] bytes)throws Exception{BufferedImage input=ImageIO.read(new ByteArrayInputStream(bytes));if(input==null)throw new IllegalArgumentException("Unsupported image");if(input.getWidth()>10000||input.getHeight()>10000)throw new IllegalArgumentException("Image dimensions are too large");double scale=Math.min(1d,1800d/Math.max(input.getWidth(),input.getHeight()));int w=(int)Math.round(input.getWidth()*scale),h=(int)Math.round(input.getHeight()*scale);BufferedImage output=new BufferedImage(w,h,BufferedImage.TYPE_INT_RGB);Graphics2D g=output.createGraphics();g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,RenderingHints.VALUE_INTERPOLATION_BICUBIC);g.setColor(Color.WHITE);g.fillRect(0,0,w,h);g.drawImage(input,0,0,w,h,null);g.dispose();ByteArrayOutputStream out=new ByteArrayOutputStream();ImageIO.write(output,"jpg",out);String key=UUID.randomUUID()+".jpg";Files.createDirectories(root);Files.write(root.resolve(key),out.toByteArray());return key;}
 public byte[] load(String key)throws Exception{if(!key.matches("[a-f0-9-]{36}\\.jpg"))throw new IllegalArgumentException("Invalid media key");Path file=root.resolve(key).normalize();if(!file.getParent().equals(root))throw new IllegalArgumentException("Invalid media key");return Files.readAllBytes(file);}
}
