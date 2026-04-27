const API_BASE = '/api';

export async function generateThumbnails(payload) {
  const res = await fetch(`${API_BASE}/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  // Read as text first so we can produce a useful error when the response isn't
  // JSON — e.g. when Render is serving the static site without the API service,
  // or the backend cold-started and returned a plain "Not Found" from the edge.
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const snippet = text.slice(0, 140).trim();
    const err = new Error(
      `Server returned a non-JSON response (HTTP ${res.status} ${res.statusText || 'error'}). ` +
      `This usually means the backend is not reachable. ` +
      (snippet ? `Response started with: "${snippet}"` : '')
    );
    err.code = 'BAD_RESPONSE';
    throw err;
  }

  if (!res.ok || data?.error) {
    const err = new Error(data?.message || `Request failed (HTTP ${res.status})`);
    err.code = data?.code;
    throw err;
  }

  return data;
}
