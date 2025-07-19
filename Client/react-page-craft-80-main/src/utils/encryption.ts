import CryptoJS from 'crypto-js';
import pako from 'pako';

// Constants matching the Java implementation
const ALGORITHM = 'AES';
const TRANSFORMATION = 'AES/ECB/PKCS5Padding';
const SECRET_KEY = 'K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=';

/**
 * Compress data using GZIP (matching Java's GZIPOutputStream)
 */
export const compress = (data: string): Uint8Array => {
  // Convert string to Uint8Array
  const textEncoder = new TextEncoder();
  const dataBytes = textEncoder.encode(data);
  
  // Compress using pako (GZIP)
  return pako.gzip(dataBytes);
};

/**
 * Decompress GZIP data (matching Java's GZIPInputStream)
 */
export const decompress = (compressedData: Uint8Array): string => {
  // Decompress using pako (GZIP)
  const decompressedBytes = pako.ungzip(compressedData);
  
  // Convert back to string
  const textDecoder = new TextDecoder();
  return textDecoder.decode(decompressedBytes);
};

/**
 * Encrypt data using AES (matching Java's AES/ECB/PKCS5Padding)
 */
export const encrypt = (data: Uint8Array): string => {
  // Convert the Base64 secret key to WordArray
  const key = CryptoJS.enc.Base64.parse(SECRET_KEY);
  
  // Convert Uint8Array to WordArray
  const wordArray = CryptoJS.lib.WordArray.create(data);
  
  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // Return URL-safe Base64 without padding (matching Java's Base64.getUrlEncoder().withoutPadding())
  return encrypted.toString()
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Decrypt data using AES (matching Java's AES/ECB/PKCS5Padding)
 */
export const decrypt = (encryptedText: string): Uint8Array => {
  // Convert the Base64 secret key to WordArray
  const key = CryptoJS.enc.Base64.parse(SECRET_KEY);
  
  // Convert from URL-safe Base64 back to normal
  const normalizedBase64 = encryptedText
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Add padding if needed
  let paddedBase64 = normalizedBase64;
  const padding = 4 - (normalizedBase64.length % 4);
  if (padding < 4) {
    paddedBase64 += '='.repeat(padding);
  }
  
  // Decrypt the data
  const decrypted = CryptoJS.AES.decrypt(paddedBase64, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // Convert WordArray to Uint8Array
  const words = decrypted.words;
  const sigBytes = decrypted.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  
  for (let i = 0; i < sigBytes; i++) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    u8[i] = byte;
  }
  
  return u8;
};

/**
 * Compress and encrypt data (matching Java's compressAndEncrypt)
 */
export const compressAndEncrypt = (plainText: string): string => {
  // First compress
  const compressed = compress(plainText);
  
  // Then encrypt
  return encrypt(compressed);
};

/**
 * Decrypt and decompress data (matching Java's decryptAndDecompress)
 */
export const decryptAndDecompress = (encryptedText: string): string => {
  // First decrypt
  const decrypted = decrypt(encryptedText);
  
  // Then decompress
  return decompress(decrypted);
};

/**
 * Check if compressed and encrypted JSON will fit in SMS
 */
export const willFitInSms = (jsonString: string): boolean => {
  const compressed = compressAndEncrypt(jsonString);
  // Add 10 characters for JSON wrapping {"e":"..."}
  return (compressed.length + 10) <= 160;
}; 

function generateNonce(): string {
  const array = new Uint8Array(8);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // fallback for environments without window.crypto
    for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.create(array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function getTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

function calculateHmac(data: string, key: string): string {
  const keyWordArray = CryptoJS.enc.Base64.parse(key);
  const dataWordArray = CryptoJS.enc.Utf8.parse(data);
  const hmac = CryptoJS.HmacSHA256(dataWordArray, keyWordArray);
  return CryptoJS.enc.Base64.stringify(hmac)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Compress, encrypt, and wrap with timestamp, nonce, and HMAC for SMS
 */
export const createSecureSmsPayload = (plainText: string): string => {
  // Compress and encrypt
  const encryptedData = compressAndEncrypt(plainText);
  // Generate timestamp and nonce
  const timestamp = getTimestamp();
  const nonce = generateNonce();
  // HMAC is over the encrypted data (string)
  const hmac = calculateHmac(encryptedData, SECRET_KEY);
  // Format: timestamp:nonce:hmac:encryptedData
  return `${timestamp}:${nonce}:${hmac}:${encryptedData}`;
}; 