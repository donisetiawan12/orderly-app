// src/utils/api.ts

// Otomatis deteksi cloud Vercel vs Localhost laptop bray
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/api';

export async function customFetch(endpoint: string, options: RequestInit = {}) {
  // Bersihkan slash biar ga double
  const cleanBase = BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const url = `${cleanBase}${cleanEndpoint}`;
  
  // Set default headers jika belum ada
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`❌ Fetch error pada endpoint [${endpoint}]:`, error);
    throw error;
  }
}