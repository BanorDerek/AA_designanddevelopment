// services/ImageCache.js
class ImageCache {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
    this.sessionCache = new Map();
  }

  async getImage(key) {
    // Check memory cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Check session storage
    const sessionKey = `image_${key}`;
    const sessionUrl = sessionStorage.getItem(sessionKey);
    if (sessionUrl) {
      this.cache.set(key, sessionUrl);
      return sessionUrl;
    }

    // Prevent duplicate requests
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    // Fetch image
    const promise = this.fetchImage(key);
    this.pending.set(key, promise);

    try {
      const url = await promise;
      this.cache.set(key, url);
      sessionStorage.setItem(sessionKey, url);
      return url;
    } finally {
      this.pending.delete(key);
    }
  }

  async fetchImage(key) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/images/${key}`);
    const data = await response.json();
    return data.url || data.imageUrl;
  }

  clearCache() {
    this.cache.clear();
    this.pending.clear();
    // Don't clear sessionStorage - keep for performance
  }
}

export const imageCache = new ImageCache();