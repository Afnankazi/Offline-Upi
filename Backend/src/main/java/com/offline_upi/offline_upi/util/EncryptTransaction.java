// package com.offline_upi.offline_upi.util;

// public class EncryptTransaction {
//     public static void main(String[] args) {
//         try {
//             // Original JSON message
//             String json = "{\"sender\":{\"upiId\":\"testuser123\"},\"receiverUpi\":\"testuser@upi\",\"amount\":500.00,\"transactionType\":\"DEBIT\"}";
            
//             System.out.println("Original JSON:");
//             System.out.println(json);
//             System.out.println("\nSecret Key (used for encryption/decryption):");
//             System.out.println("K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=");
            
//             // Encrypt the JSON
//             String encrypted = AESUtil.encrypt(json);
//             System.out.println("\nEncrypted message:");
//             System.out.println(encrypted);
            
//             // Decrypt to verify
//             String decrypted = AESUtil.decrypt(encrypted);
//             System.out.println("\nDecrypted message (should match original):");
//             System.out.println(decrypted);
            
//         } catch (Exception e) {
//             e.printStackTrace();
//         }
//     }
// } 