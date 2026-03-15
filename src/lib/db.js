import Dexie from 'dexie';

export const db = new Dexie('MamaMaryPOS');

db.version(7).stores({
  products: 'id, name, barcode, category, is_best_seller, stock',
  sales: '++id, timestamp, storeId, status',
  sync_queue: '++id, table, operation, data, timestamp',
  users: 'email, role, pin, name, language',
  stores: 'id, name, address',
  config: 'key, value',
  daily_checks: '++id, date, userId, storeId, type'
});

export const initLocalDB = async (initialProducts = []) => {
  // Config Seed
  const cCount = await db.config.count();
  if (cCount === 0) {
    await db.config.add({ key: 'reportEmail', value: 'admin@mamamary.io' });
  }

  // Products Seed
  const pCount = await db.products.count();
  if (pCount === 0 && initialProducts.length > 0) {
    await db.products.bulkAdd(initialProducts);
  }

  // Stores Seed
  const sCount = await db.stores.count();
  if (sCount === 0) {
    await db.stores.bulkAdd([
      { id: 'roma_centro', name: 'MamaMary Roma Centro', address: 'Via del Corso, 1' },
      { id: 'roma_trastevere', name: 'MamaMary Trastevere', address: 'Via della Lungaretta, 12' },
      { id: 'roma_monti', name: 'MamaMary Monti', address: 'Via dei Serpenti, 5' }
    ]);
  }

  // Developer Seed
  const uCount = await db.users.count();
  if (uCount === 0) {
    await db.users.add({
      email: 'dev@mamamary.io',
      pin: '070380',
      role: 'developer',
      name: 'Sviluppatore Sistema',
      language: 'it'
    });
  }
};
