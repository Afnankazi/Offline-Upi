import CryptoJS from 'crypto-js';

// Constants matching the Java implementation
const ALGORITHM = 'AES';
const SECRET_KEY = 'K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=';

/**
 * Compress a string using a simple compression algorithm
 * This is a simplified version of GZIP compression
 */
export const compress = (data: string): string => {
  // Simple compression: replace repeated characters with count
  let compressed = '';
  let count = 1;
  let currentChar = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] === currentChar && count < 9) {
      count++;
    } else {
      compressed += count + currentChar;
      currentChar = data[i];
      count = 1;
    }
  }
  
  // Add the last group
  compressed += count + currentChar;
  
  return compressed;
};

/**
 * Decompress a string that was compressed with the compress function
 */
export const decompress = (compressedData: string): string => {
  let decompressed = '';
  
  for (let i = 0; i < compressedData.length; i += 2) {
    const count = parseInt(compressedData[i]);
    const char = compressedData[i + 1];
    
    for (let j = 0; j < count; j++) {
      decompressed += char;
    }
  }
  
  return decompressed;
};

/**
 * Encrypt data using AES
 */
export const encrypt = (data: string): string => {
  // Convert the Base64 secret key to WordArray
  const key = CryptoJS.enc.Base64.parse(SECRET_KEY);
  
  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // Return URL-safe Base64 without padding
  return encrypted.toString()
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Decrypt data using AES
 */
export const decrypt = (encryptedText: string): string => {
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
  
  return decrypted.toString(CryptoJS.enc.Utf8);
};

/**
 * Compress and encrypt data
 */
export const compressAndEncrypt = (plainText: string): string => {
  // First compress
  const compressed = compress(plainText);
  
  // Then encrypt
  return encrypt(compressed);
};

/**
 * Decrypt and decompress data
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