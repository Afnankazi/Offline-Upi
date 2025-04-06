package com.offline_upi.offline_upi.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.offline_upi.offline_upi.model.Transaction;
import com.offline_upi.offline_upi.model.User;
import com.offline_upi.offline_upi.repository.UserRepository;
import com.offline_upi.offline_upi.exception.TransactionException;
import com.offline_upi.offline_upi.util.AESUtil;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class TwilioService {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // Twilio phone number
    private static final String TWILIO_PHONE_NUMBER = "+19152683408";

   

    public void receiveSms(String from, String body) {
        try {
            System.out.println("Original encrypted message: " + body);
            
            // Decrypt the message
            String decryptedBody = AESUtil.decrypt(body);
            System.out.println("Decrypted message: " + decryptedBody);
            
            // Clean the message body
            String cleanedBody = decryptedBody
                .replaceAll("[^\\x20-\\x7E]", "") // Remove all non-ASCII characters
                .replaceAll("\\s+", " ")          // Replace multiple spaces with single space
                .replaceAll("\\s*,\\s*", ",")     // Remove spaces around commas
                .replaceAll("\\s*:\\s*", ":")     // Remove spaces around colons
                .trim();
            
            System.out.println("Cleaned message: " + cleanedBody);
            
            // Only add closing brace if it's not already there
            if (!cleanedBody.matches(".*\"upiId\":\"[^\"]+\"}.*")) {
                cleanedBody = cleanedBody.replaceAll("\"upiId\":\"([^\"]+)\"", "\"upiId\":\"$1\"}");
            }
            
            // Ensure the JSON is properly formatted
            if (!cleanedBody.endsWith("}")) {
                cleanedBody += "}";
            }
            
            // Fix any missing quotes around property names
            cleanedBody = cleanedBody.replaceAll("([{,]\s*)([a-zA-Z0-9]+)(\s*:)", "$1\"$2\"$3");
            
            System.out.println("Final JSON: " + cleanedBody);
            
            // Parse the JSON message into a Transaction object
            Transaction transaction = objectMapper.readValue(cleanedBody, Transaction.class);
            System.out.println("successfully parsed the json");
            
            // Validate sender exists
            User sender = userRepository.findByUpiId(transaction.getSender().getUpiId())
                .orElseThrow(() -> new TransactionException("Sender not found"));
            
            // Set additional transaction details
            transaction.setSender(sender);
            transaction.setStatus(Transaction.TransactionStatus.PENDING);
            transaction.setIsOfflineTransaction(true);
            transaction.setSmsReference(generateSmsReference());
            
            // Save the transaction
            transactionService.initiateTransaction(transaction);
            
            // Send confirmation SMS
            String confirmationMessage = String.format(
                "Transaction initiated successfully. Reference: %s. Amount: %.2f to %s",
                transaction.getSmsReference(),
                transaction.getAmount(),
                transaction.getReceiverUpi()
            );
            
            // Encrypt the confirmation message before sending
            String encryptedConfirmation = AESUtil.encrypt(confirmationMessage);
      
            
        } catch (Exception e) {
            // Send error message to user
            String errorMessage = "Failed to process transaction: " + e.getMessage();
            try {
                String encryptedError = AESUtil.encrypt(errorMessage);
           
            } catch (Exception ex) {
                throw new RuntimeException("Failed to send error message: " + ex.getMessage(), ex);
            }
            throw new RuntimeException(errorMessage, e);
        }
    }

    private String generateSmsReference() {
        return "SMS" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }
} 