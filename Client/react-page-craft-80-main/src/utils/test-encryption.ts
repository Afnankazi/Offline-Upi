import { compressAndEncrypt, decryptAndDecompress } from './encryption';

// Test JSON string
const testJson = `{
    "sender": {
        "upiId": "afu@sbi"
    },
    "receiverUpi": "afnan@axl",
    "amount": 500.00,
    "transactionType": "DEBIT"
}`;

// Compress and encrypt
const encrypted = compressAndEncrypt(testJson);
console.log("Encrypted output:");
console.log(encrypted);

// Decrypt and decompress to verify
const decrypted = decryptAndDecompress(encrypted);
console.log("\nDecrypted output (should match original):");
console.log(decrypted);

// Verify they match
console.log("\nVerification:", testJson === decrypted ? "SUCCESS" : "FAILED"); 