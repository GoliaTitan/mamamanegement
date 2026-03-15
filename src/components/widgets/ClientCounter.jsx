import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export default function ClientCounter() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Polling ESP32 endpoint. Replace IP with actual ESP32 IP
    const esp32Ip = localStorage.getItem('esp32_ip') || '192.168.1.100'; 
    const fetchCount = async () => {
      try {
        const response = await fetch(`http://${esp32Ip}/count`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          const data = await response.json();
          setCount(data.count || data.clienti || 0);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
        // Fallback for visual demo purposes so it doesn't look broken if hardware is missing
        setCount(prev => prev > 0 ? prev : 12); // placeholder value 12
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000); // Pool every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-[24px] glass-panel flex flex-col justify-between group hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-white/50">Clienti in Store</span>
        <Users size={16} className="text-white/40" />
      </div>
      <div className="flex items-baseline gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {loading && count === 0 ? '--' : count}
        </h2>
        {error && <span className="text-[10px] text-red-400 font-medium px-2 py-0.5 rounded pl-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse"></span>Offline</span>}
        {!error && !loading && <span className="text-[10px] text-green-400 font-medium px-2 py-0.5 rounded pl-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span>Live ESP32</span>}
      </div>
    </div>
  );
}
