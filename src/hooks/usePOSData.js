import { useState, useEffect } from 'react';
import { db, initLocalDB } from '../lib/db';
import { supabase } from '../lib/supabase';
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
          price: p.price,
          on_sale: idx % 10 === 0, // Simulate some offers
          sale_price: p.price * 0.8,
          is_best_seller: idx < 6, // First 6 are best sellers
          stock: 100, // Initial stock
          unit: p.variants?.[0]?.title || 'un',
          image: p.images?.[0] || '',
          barcode: '',
          category: 'FLOWERS',
          type: 'Materia'
        })));

        // Load from Local DB
        const localProducts = await db.products.toArray();
        setProducts(localProducts);
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
