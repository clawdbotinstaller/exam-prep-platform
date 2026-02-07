async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBytes = salt ?? crypto.getRandomValues(new Uint8Array(16));
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    256
  );
  const toHex = (bytes) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return { saltHex: toHex(saltBytes), hashHex: toHex(new Uint8Array(bits)) };
}

hashPassword('test123').then(r => console.log(r.saltHex + ':' + r.hashHex));
