const API_BASE = '/api';

export async function generateThumbnails(payload) {
  const res = await fetch(`${API_BASE}/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const err = new Error(data?.message || `Request failed (HTTP ${res.status})`);
    err.code = data?.code;
    throw err;
  }

  return data;
}
