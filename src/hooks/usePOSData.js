import { useState, useEffect } from 'react';
import { db, initLocalDB } from '../lib/db';
import initialProducts from '../data/scraped_products.json';

export function usePOSData() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const loadData = async () => {
      setLoading(true);
      try {
        // Initialize Local DB with scraped products if empty
        await initLocalDB(initialProducts.map((p, idx) => ({
          id: idx + 1,
          name: p.name,
          price: parseFloat(p.price) || 0,
          on_sale: p.on_sale || false,
          sale_price: parseFloat(p.sale_price) || 0,
          is_best_seller: idx < 6, // First 6 are best sellers
          stock: 100, // Initial stock
          unit: p.unit || 'un',
          image: p.image || '',
          barcode: '',
          category: p.category || 'FLOWERS',
          type: 'Materia'
        })));

        // Load from Local DB
        const localProducts = await db.products.toArray();
        
        // --- IMAGE MIGRATION ROUTINE ---
        // Se l'utente ha il db con le immagini vecchie (Shopify o Unsplash),
        // questa routine carica le nuove originali salvate nel repo locale.
        let needsMigration = false;
        const migratedProducts = localProducts.map((p) => {
          if (p.image && (p.image.includes('cdn.shopify.com') || p.image.includes('unsplash.com'))) {
            needsMigration = true;
            const fallbackProduct = initialProducts.find(ip => ip.name === p.name);
            p.image = fallbackProduct ? fallbackProduct.image : '/logo.png';
            db.products.put(p); // Update individual product in IDB
          }
          return p;
        });

        setProducts(migratedProducts);
      } catch (error) {
        console.error("Error loading POS data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { 
    products, 
    bestSellers: products.filter(p => p.is_best_seller),
    loading,
    isOnline
  };
}
