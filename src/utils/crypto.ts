const stringToBuffer = (str: string): ArrayBuffer => {
  return new TextEncoder().encode(str).buffer;
};

const bufferToBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generate random salt
export const generateSalt = (): string => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return bufferToBase64(salt);
};

// Derive encryption key from passphrase
export const deriveKey = async (
  passphrase: string,
  salt: string
): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    stringToBuffer(passphrase),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBuffer(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

// Encrypt a test value to verify passphrase
export const createEncryptedTest = async (
  key: CryptoKey
): Promise<string> => {
  const testValue = "passphrase_verified";
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    stringToBuffer(testValue)
  );

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return bufferToBase64(combined);
};

// Verify passphrase by trying to decrypt test value
export const verifyPassphrase = async (
  key: CryptoKey,
  encryptedTest: string
): Promise<boolean> => {
  try {
    const combined = new Uint8Array(base64ToBuffer(encryptedTest));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    const testValue = new TextDecoder().decode(decrypted);
    return testValue === "passphrase_verified";
  } catch {
    return false;
  }
};

// Generate IV as base64 string
export const generateIV = (): string => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return bufferToBase64(iv);
};

// Encrypt text to base64
export const encryptText = async (
  text: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> => {
  const iv = new Uint8Array(base64ToBuffer(ivBase64));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    stringToBuffer(text)
  );
  return bufferToBase64(encrypted);
};

// Decrypt base64 to text
export const decryptText = async (
  encryptedBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> => {
  const iv = new Uint8Array(base64ToBuffer(ivBase64));
  const encryptedBuffer = base64ToBuffer(encryptedBase64);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedBuffer
  );
  return new TextDecoder().decode(decrypted);
};