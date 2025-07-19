package com.offline_upi.offline_upi.util;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class AESUtil {
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";
    
    private static final String SECRET_KEY = "K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=";

    /**
     * Decrypt and decompress data
     */
    public static String decryptAndDecompress(String encryptedText) throws Exception {
        byte[] decryptedBytes = decrypt(encryptedText);
        return decompress(decryptedBytes);
    }

    /**
     * Compress and encrypt data
     */
    public static String compressAndEncrypt(String plainText) throws Exception {
        byte[] compressedBytes = compress(plainText);
        return encrypt(compressedBytes);
    }

    /**
     * Decrypt data
     */
    public static byte[] decrypt(String encryptedText) throws Exception {
        String normalizedBase64 = encryptedText
                .replace('-', '+')
                .replace('_', '/');
        
        int padding = 4 - (normalizedBase64.length() % 4);
        if (padding < 4) {
            normalizedBase64 += "=".repeat(padding);
        }
        
        SecretKeySpec secretKey = new SecretKeySpec(Base64.getDecoder().decode(SECRET_KEY), ALGORITHM);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        
        byte[] encryptedBytes = Base64.getDecoder().decode(normalizedBase64);
        return cipher.doFinal(encryptedBytes);
    }

    /**
     * Decrypt to string 
     */
    public static String decryptToString(String encryptedText) throws Exception {
        return new String(decrypt(encryptedText));
    }

    /**
     * Encrypt data
     */
    public static String encrypt(byte[] data) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(Base64.getDecoder().decode(SECRET_KEY), ALGORITHM);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        
        byte[] encryptedBytes = cipher.doFinal(data);
        
        return Base64.getUrlEncoder().withoutPadding().encodeToString(encryptedBytes);
    }

    /**
     * Encrypt string
     */
    public static String encrypt(String plainText) throws Exception {
        return encrypt(plainText.getBytes());
    }

    /**
     * Compress data using GZIP
     */
    public static byte[] compress(String data) throws Exception {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        try (GZIPOutputStream gzipStream = new GZIPOutputStream(byteStream)) {
            gzipStream.write(data.getBytes());
        }
        return byteStream.toByteArray();
    }

    /**
     * Decompress GZIP data
     */
    public static String decompress(byte[] compressedData) throws Exception {
        ByteArrayInputStream byteStream = new ByteArrayInputStream(compressedData);
        ByteArrayOutputStream resultStream = new ByteArrayOutputStream();
        
        try (GZIPInputStream gzipStream = new GZIPInputStream(byteStream)) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gzipStream.read(buffer)) != -1) {
                resultStream.write(buffer, 0, len);
            }
        }
        
        return resultStream.toString();
    }

}