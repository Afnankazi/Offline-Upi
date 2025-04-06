package com.offline_upi.offline_upi.util;

public class AESUtilTest {
    public static void main(String[] args) {
        try {
            String json = "{\"sender\":{\"upiId\":\"testuser123\"},\"receiverUpi\":\"testuser@upi\",\"amount\":500.00,\"transactionType\":\"DEBIT\"}";
            
            // Encrypt the JSON
            String encrypted = AESUtil.encrypt(json);
            System.out.println("Original JSON: " + json);
            System.out.println("Encrypted: " + encrypted);
            
            // Decrypt to verify
            String decrypted = AESUtil.decrypt(encrypted);
            System.out.println("Decrypted: " + decrypted);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
} 