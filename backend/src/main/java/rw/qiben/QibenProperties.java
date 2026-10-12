package rw.qiben;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "qiben")
public class QibenProperties {
    private String adminEmail;
    private String adminPassword;
    private String jwtSecret;
    private boolean cookieSecure;
    private String siteUrl;
    private String frontendOrigin;
    private String mediaRoot;
    private String inbox;

    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

    public String getAdminPassword() { return adminPassword; }
    public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }

    public String getJwtSecret() { return jwtSecret; }
    public void setJwtSecret(String jwtSecret) { this.jwtSecret = jwtSecret; }

    public boolean isCookieSecure() { return cookieSecure; }
    public void setCookieSecure(boolean cookieSecure) { this.cookieSecure = cookieSecure; }

    public String getSiteUrl() { return siteUrl; }
    public void setSiteUrl(String siteUrl) { this.siteUrl = siteUrl; }

    public String getFrontendOrigin() { return frontendOrigin; }
    public void setFrontendOrigin(String frontendOrigin) { this.frontendOrigin = frontendOrigin; }

    public String getMediaRoot() { return mediaRoot; }
    public void setMediaRoot(String mediaRoot) { this.mediaRoot = mediaRoot; }

    public String getInbox() { return inbox; }
    public void setInbox(String inbox) { this.inbox = inbox; }
}