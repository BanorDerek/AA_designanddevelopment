// utils/imagePreloader.js - FIXED: No fetch, just preload images directly
const HERO_KEYS = ['home-hero-1', 'home-hero-2', 'home-hero-3', 'home-hero-4', 'home-hero-5'];

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Preload a single image using the API endpoint directly
const preloadImage = (key) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = `${API_BASE}/images/${key}`;
    
    img.onload = () => {
      console.log(`✅ Preloaded: ${key}`);
      resolve(true);
    };
    
    img.onerror = () => {
      console.log(`❌ Failed to preload: ${key}`);
      resolve(false); // Resolve anyway, don't reject
    };
    
    // This uses the API endpoint, which redirects to R2
    // The Image object handles redirects differently than fetch
    img.src = url;
  });
};

// Preload all hero images
export const preloadHomeImages = async (progressCallback) => {
  const total = HERO_KEYS.length;
  let loaded = 0;
  
  console.log('🔄 Starting image preload...');
  
  const preloadPromises = HERO_KEYS.map(async (key) => {
    const result = await preloadImage(key);
    loaded++;
    if (progressCallback) {
      progressCallback(loaded / total);
    }
    return result;
  });
  
  const results = await Promise.all(preloadPromises);
  console.log('✅ All images preloaded');
  return results;
};

// Get image URL - only used if absolutely needed
export const getImageUrl = async (key) => {
  // Just return the API endpoint URL directly
  // Don't fetch it, just return the URL for the img tag
  return `${API_BASE}/images/${key}`;
};

// Get cached image URLs (just returns the API endpoints)
export const getCachedImageUrls = async () => {
  return HERO_KEYS.reduce((acc, key) => {
    acc[key] = `${API_BASE}/images/${key}`;
    return acc;
  }, {});
};