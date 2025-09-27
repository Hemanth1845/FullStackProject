package com.crm.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

public class CryptoUtil {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";

    // Method to create a secret key from a user's pin
    private static SecretKeySpec createKey(String pin) throws Exception {
        MessageDigest sha = MessageDigest.getInstance("SHA-1");
        byte[] key = pin.getBytes(StandardCharsets.UTF_8);
        key = sha.digest(key);
        key = Arrays.copyOf(key, 16); // Use only first 128 bit
        return new SecretKeySpec(key, ALGORITHM);
    }

    // Encrypt a byte array (for files)
    public static byte[] encrypt(String pin, byte[] data) throws Exception {
        SecretKeySpec secretKey = createKey(pin);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        return cipher.doFinal(data);
    }

    // Decrypt a byte array (for files)
    public static byte[] decrypt(String pin, byte[] encryptedData) throws Exception {
        SecretKeySpec secretKey = createKey(pin);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        return cipher.doFinal(encryptedData);
    }

    // Encrypt a string (for chat messages)
    public static String encryptString(String secret, String data) throws Exception {
        SecretKeySpec secretKey = createKey(secret);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        return Base64.getEncoder().encodeToString(cipher.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }

    // Decrypt a string (for chat messages)
    public static String decryptString(String secret, String encryptedData) throws Exception {
        SecretKeySpec secretKey = createKey(secret);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        byte[] original = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(original);
    }
}
