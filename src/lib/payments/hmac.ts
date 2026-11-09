// Browser-safe HMAC helpers using WebCrypto where available; in Edge Functions use Deno crypto.
// For unit tests / node, we provide a simple constant-time compare.
export async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder()
  // @ts-ignore global crypto subtle may exist
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign'])
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
    return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('')
  }
  throw new Error('WebCrypto unavailable')
}
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0; for (let i=0;i<a.length;i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff===0
}
export async function verifyHmacSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!secret || !signature) return false
  try { const expected = await hmacSha256Hex(secret, payload); return timingSafeEqual(expected, signature.toLowerCase()) } catch { return false }
}
// Re-export shim used by types.ts (sync placeholder replaced by async verify above in adapters)
export function createHmac(){ throw new Error('Use hmacSha256Hex') }
