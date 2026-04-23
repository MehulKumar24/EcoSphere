﻿# EcoSphere - Deployment & Performance Guide

## ðŸš€ Pre-Deployment Checklist

### Code Quality
- [x] All HTML validated (W3C standards)
- [x] CSS organized into 5 modular files
- [x] JavaScript organized into 5 page scripts plus 1 worker script
- [x] No console errors or warnings
- [x] Service worker functional
- [x] Manifest valid and configured

### Performance
- [x] Lazy loading enabled for images
- [x] Critical resources preloaded
- [x] Caching strategy implemented
- [x] Gzip compression configured
- [x] Performance monitoring added

### Security
- [x] Content Security Policy configured
- [x] Security headers ready (.htaccess)
- [x] HTTPS recommended
- [x] Form validation implemented
- [x] No sensitive data in source code

### SEO & Accessibility
- [x] JSON-LD structured data on all pages
- [x] Meta descriptions on all pages
- [x] Sitemap.xml created
- [x] robots.txt configured
- [x] WCAG 2.1 Level AA accessible
- [x] Skip link implemented
- [x] Keyboard navigation tested

### Browser Compatibility
- [x] Chrome/Chromium
- [x] Firefox
- [x] Safari
- [x] Edge
- [x] Mobile browsers (iOS Safari, Chrome)

---

## ðŸ“¦ Deployment Steps

### Step 1: Choose Hosting
**Recommended Platforms:**
- Vercel (recommended for static sites)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Traditional shared hosting (Apache/Nginx)

### Step 2: Upload Files
```
Keep the same public file layout:

./
|- *.html
|- service-worker.js
|- manifest.json
|- robots.txt
|- sitemap.xml
|- .htaccess (if Apache)
|- css/
|- js/
`- assets/
```

Keep the root `service-worker.js` in place. It acts as the public entry point so the worker can control the whole site, while the main cache logic stays in `js/service-worker.js`.

The `docs/` and `config/` folders are just project references. They do not need to be served as part of the main website.

### Step 3: Configure Server

**For Apache:**
- Copy .htaccess to root directory
- Enable mod_deflate (gzip)
- Enable mod_expires (caching)
- Enable mod_rewrite (if needed)

**For Nginx:**
- Use config/nginx.conf.example as reference
- Update server block configuration
- Test configuration: `sudo nginx -t`
- Reload: `sudo systemctl reload nginx`

**For Vercel/Netlify:**
- Deploy directly from git repo
- Automatic caching and compression
- HTTP/2 and HTTPS enabled by default

### Step 4: SSL/HTTPS Setup
```bash
# Using Let's Encrypt (free)
sudo certbot certonly --webroot -w /var/www/ecosphere -d ecosphere-sustainability.com

# Apache auto-renewal
sudo certbot --apache -d ecosphere-sustainability.com

# Nginx manual setup
sudo certbot certonly --webroot -w /var/www/ecosphere -d ecosphere-sustainability.com
```

### Step 5: DNS Configuration
```
A Record: ecosphere-sustainability.com â†’ YOUR_IP_ADDRESS
CNAME:    www.ecosphere-sustainability.com â†’ ecosphere-sustainability.com
TXT:      (for domain verification)
```

### Step 6: Monitor & Test

**Test Locally:**
```bash
# Start simple HTTP server
python3 -m http.server 8000

# Or with Python 2
python -m SimpleHTTPServer 8000

# Or with Node.js
npx http-server
```

**Performance Testing:**
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- WebPageTest: https://www.webpagetest.org
- GTmetrix: https://gtmetrix.com
- PageSpeed Insights: https://pagespeed.web.dev

**PWA Testing:**
- Open DevTools â†’ Application â†’ Service Workers
- Check: "Offline"
- Refresh page - should work offline
- Check Manifest tab for manifest.json details

---

## ðŸ”§ Server Configuration Commands

### Apache Enable Modules
```bash
a2enmod deflate      # Gzip compression
a2enmod expires      # Browser caching
a2enmod headers      # Security headers
a2enmod rewrite      # URL rewrites
sudo systemctl restart apache2
```

### Nginx Log Rotation (logrotate)
```bash
# /etc/logrotate.d/nginx-ecosphere
/var/log/nginx/ecosphere_access.log /var/log/nginx/ecosphere_error.log {
  daily
  rotate 7
  compress
  delaycompress
  notifempty
  create 0640 www-data adm
  sharedscripts
  postrotate
    systemctl reload nginx > /dev/null 2>&1 || true
  endscript
}
```

---

## ðŸ“Š Performance Metrics - Expected Values

### Before Optimization
- Initial Load: ~3.5s
- JS Bundle: ~50 KB
- CSS Bundle: ~35 KB
- Total Size: ~210 KB

### After Deployment (with compression)
- Initial Load: ~1.5s (60% faster)
- JS Bundle: ~15 KB (about 71% reduction)
- CSS Bundle: ~9 KB (about 75% reduction)
- Total Size: ~60 KB (about 71% reduction)

### Repeat Visits (with service worker)
- Load Time: ~0.5s (85% faster)
- Network: ~2 KB (cache headers only)
- Data Saved: ~58 KB per visit

---

## ðŸ” Monitoring & Analytics

### Set Up Analytics
```html
<!-- Google Analytics (add to each page) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID', {
    'page_path': location.pathname,
    'send_page_view': true
  });
</script>
```

### Core Web Vitals Monitoring
- Google Analytics 4 (GA4)
- Vercel Analytics
- LogRocket
- Sentry (error tracking)

### Setup Alerts
- 404 errors
- JavaScript errors
- Performance degradation
- Service worker failures

---

## ðŸ“‹ Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] All links work (test 404)
- [ ] Images load correctly
- [ ] Forms submit successfully
- [ ] Service worker registers
- [ ] Offline mode works
- [ ] Install prompt shows (mobile)
- [ ] Lighthouse score â‰¥ 90
- [ ] URLs are clean and SEO-friendly
- [ ] Sitemap submitted to Google Search Console
- [ ] robots.txt accessible
- [ ] SSL certificate valid
- [ ] Redirects working (http to https)
- [ ] Mobile responsive tested
- [ ] Touch-friendly on mobile
- [ ] Database/backend (if any) connected
- [ ] Email notifications working
- [ ] Analytics tracking active
- [ ] Error monitoring active
- [ ] CDN caching working

---

## ðŸ” Security Hardening

### Add Security Headers
Already configured in .htaccess and nginx.conf:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: configured
- Referrer-Policy: no-referrer-when-downgrade

### SSL/TLS Configuration
```bash
# Test SSL configuration
openssl s_client -connect ecosphere-sustainability.com:443

# Or use online tool
https://www.ssllabs.com/ssltest/
```

### Regular Security Audits
- OWASP Top 10 check
- Dependency scanning
- Automated security testing
- Manual penetration testing (quarterly)

---

## ðŸ†˜ Troubleshooting

### Service Worker Not Registering
```javascript
// Check in DevTools Console
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('SW Registrations:', regs))
```

Note: keep the public registration path pointed at `/service-worker.js`. That root file loads `js/service-worker.js` and preserves full-site scope.

### HTTPS Mixed Content Warning
- Check all resource URLs (http â†’ https)
- Update manifest.json URLs
- Check CSS @import statements

### Cache Not Clearing
```bash
# Hard refresh browser
Ctrl+Shift+R (Chrome/Firefox)
Cmd+Shift+R (Mac)

# Or clear from DevTools
Application â†’ Service Workers â†’ Unregister
Application â†’ Storage â†’ Clear Site Data
```

### 404 Errors on Refresh
- Ensure server rewrites to index.html
- Check .htaccess or nginx rewrite rules

### Lighthouse Scoring Issues
- Run audit in Incognito mode
- Disable extensions
- Check network throttling settings

---

## ðŸ“ž Support & Resources

**Documentation:**
- MDN Web Docs: https://developer.mozilla.org
- Web.dev: https://web.dev
- PWA Documentation: https://web.dev/progressive-web-apps/

**Tools:**
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- webpagetest.org: https://www.webpagetest.org
- GTmetrix: https://gtmetrix.com

**Community:**
- Stack Overflow
- GitHub Discussions
- CSS-Tricks
- Dev.to

---

**Last Updated:** APRIL 2026
**Project:** EcoSphere Sustainability Hub
**Status:** Production Ready
