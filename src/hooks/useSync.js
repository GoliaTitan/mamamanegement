import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { supabase } from '../lib/supabase';

export function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'error'

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync and periodic sync every 5 minutes
    if (isOnline) {
      performFullSync();
    }
    
    const interval = setInterval(() => {
      if (isOnline) performFullSync();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const performFullSync = async () => {
    setSyncStatus('syncing');
    try {
      await Promise.all([
        pushPendingSales(),
        pushPendingChecks(),
        pushUserUpdates(),
        pushProductUpdates(),
        pullLatestData()
      ]);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Sync Error:', error);
      setSyncStatus('error');
    }
  };

  const pushProductUpdates = async () => {
    const products = await db.products.toArray();
    for (const p of products) {
      if (p.needsSync) {
        const { error } = await supabase
          .from('products')
          .update({ 
            on_sale: p.on_sale,
            sale_price: p.sale_price,
            is_best_seller: p.is_best_seller,
            image: p.image,
            stock: p.stock
          })
          .eq('id', p.id);
        
        if (!error) {
          await db.products.update(p.id, { needsSync: false });
        }
      }
    }
  };

  const pushPendingSales = async () => {
    const pending = await db.sales.where('status').equals('pending').toArray();
    for (const sale of pending) {
      const { error } = await supabase.from('sales').insert([sale]);
      if (!error) {
        await db.sales.update(sale.id, { status: 'synced' });
      }
    }
  };

  const pushUserUpdates = async () => {
    // Sync users with pending local changes
    const users = await db.users.toArray();
    for (const user of users) {
      if (user.needsSync) {
        const { error } = await supabase
          .from('users')
          .update({ 
            photo: user.photo, 
            phone: user.phone,
            pin: user.pin,
            role: user.role
          })
          .eq('email', user.email);
        
        if (!error) {
          await db.users.update(user.email, { needsSync: false });
        }
      }
    }
  };

  const pushPendingChecks = async () => {
    const pending = await db.daily_checks.where('status').equals('pending').toArray();
    for (const check of pending) {
      const { error } = await supabase.from('daily_checks').insert([check]);
      if (!error) {
        await db.daily_checks.update(check.id, { status: 'synced' });
      }
    }
  };

  const pullLatestData = async () => {
    // Pull Products
    const { data: products } = await supabase.from('products').select('*');
    if (products) await db.products.bulkPut(products);

    // Pull Users
    const { data: users } = await supabase.from('users').select('*');
    if (users) await db.users.bulkPut(users);

    // Pull Stores
    const { data: stores } = await supabase.from('stores').select('*');
    if (stores) await db.stores.bulkPut(stores);
  };

  return { isOnline, syncStatus, performFullSync };
}
