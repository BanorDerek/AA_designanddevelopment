import { useEffect } from 'react';

export default function SiteMetaTags({ settings }) {
  useEffect(() => {
    if (!settings) return;

    // Get values from settings with fallbacks
    const brandName = settings.brandName || 'AA Designs and Development';
    const tagline = settings.tagline || 'Architecture & Interior Design';
    const logoUrl = settings.logoUrl || '';
    const faviconUrl = settings.faviconUrl || '';
    const siteUrl = settings.siteUrl || 'https://www.aadesigndev.com';

    // 1. Update page title
    document.title = `${brandName} | ${tagline}`;
    console.log('✅ Title updated to:', document.title);

    // 2. Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = tagline;

    // 3. Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = document.title;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.content = tagline;

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.content = siteUrl;

    if (logoUrl) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = logoUrl;
    }

    // 4. Update Twitter Card tags
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twTitle) {
      twTitle = document.createElement('meta');
      twTitle.name = 'twitter:title';
      document.head.appendChild(twTitle);
    }
    twTitle.content = document.title;

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twDesc) {
      twDesc = document.createElement('meta');
      twDesc.name = 'twitter:description';
      document.head.appendChild(twDesc);
    }
    twDesc.content = tagline;

    let twCard = document.querySelector('meta[name="twitter:card"]');
    if (!twCard) {
      twCard = document.createElement('meta');
      twCard.name = 'twitter:card';
      twCard.content = 'summary_large_image';
      document.head.appendChild(twCard);
    }

    if (logoUrl) {
      let twImage = document.querySelector('meta[name="twitter:image"]');
      if (!twImage) {
        twImage = document.createElement('meta');
        twImage.name = 'twitter:image';
        document.head.appendChild(twImage);
      }
      twImage.content = logoUrl;
    }

    // 5. Update favicon
    if (faviconUrl) {
      const faviconLinks = document.querySelectorAll("link[rel*='icon']");
      if (faviconLinks.length > 0) {
        faviconLinks.forEach(link => {
          link.href = faviconUrl;
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
      }
    }

    // 6. Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = siteUrl;

    console.log('✅ SiteMetaTags applied:', {
      title: document.title,
      description: tagline,
      logo: logoUrl,
      favicon: faviconUrl
    });

  }, [settings]);

  return null;
}