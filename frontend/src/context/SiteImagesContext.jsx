import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const SiteImagesContext = createContext({ images: {}, loading: true, refresh: () => {} });

export function SiteImagesProvider({ children }) {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    fetch(`${API_BASE}/images`)
      .then((r) => r.json())
      .then((list) => {
        const byKey = {};
        list.forEach((img) => { byKey[img.key] = img; });
        setImages(byKey);
      })
      .catch(() => setImages({}))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  return (
    <SiteImagesContext.Provider value={{ images, loading, refresh }}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImages() {
  return useContext(SiteImagesContext);
}
