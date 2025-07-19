package com.offline_upi.offline_upi.service.impl;

import com.offline_upi.offline_upi.exception.TransactionException;
import com.offline_upi.offline_upi.model.Transaction;
import com.offline_upi.offline_upi.model.User;
import com.offline_upi.offline_upi.repository.TransactionRepository;
import com.offline_upi.offline_upi.repository.UserRepository;
import com.offline_upi.offline_upi.service.TransactionService;
import com.offline_upi.offline_upi.util.SmsTransactionParser;
import com.offline_upi.offline_upi.util.AESUtil;
import com.offline_upi.offline_upi.util.MailUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.HashSet;
import java.util.Set;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
@Transactional
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MailUtil mailUtil;
    
    private static final String SECRET_KEY = "K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=";
    private static final Set<String> usedNonces = new HashSet<>();

    @Override
    public Transaction encryptedTransaction(String smsPayload) {
        try {
            System.out.println("Received SMS payload: " + smsPayload);
            // Parse format: timestamp:nonce:hmac:encryptedData
            String[] parts = smsPayload.split(":", 4);
            if (parts.length != 4) {
                throw new TransactionException("Invalid SMS format. Expected timestamp:nonce:hmac:encryptedData");
            }
            String timestampStr = parts[0];
            String nonce = parts[1];
            String hmac = parts[2];
            String encryptedData = parts[3];
            System.out.println(encryptedData);

            // 1. Validate timestamp (5 min window)
            long timestamp = Long.parseLong(timestampStr);
            long now = Instant.now().getEpochSecond();
            if (Math.abs(now - timestamp) > 300) {
                throw new TransactionException("SMS timestamp is too old or in the future");
            }

            // 2. Validate nonce (in-memory, not persistent)
            synchronized (usedNonces) {
                if (usedNonces.contains(nonce)) {
                    throw new TransactionException("Nonce already used - possible replay attack");
                }
                usedNonces.add(nonce);
                // Optionally clean up old nonces if set grows too large
                if (usedNonces.size() > 10000) usedNonces.clear();
            }

            // 3. Validate HMAC
            String expectedHmac = calculateHmac(encryptedData, SECRET_KEY);
            if (!hmac.equals(expectedHmac)) {
                throw new TransactionException("HMAC verification failed - data integrity compromised");
            }

            // 4. Decrypt the data
            String decryptedData = AESUtil.decryptAndDecompress(encryptedData);

            // 5. Clean the decrypted data
            String cleanedData = decryptedData
                .replaceAll("[^\\x20-\\x7E]", "")
                .replaceAll("\\s+", " ")
                .replaceAll("\\s*,\\s*", ",")
                .replaceAll("\\s*:\\s*", ":")
                .trim();

            System.out.println("Cleaned data: " + cleanedData);

            // 6. Parse the JSON into a Transaction object
            Transaction transaction = objectMapper.readValue(cleanedData, Transaction.class);
            System.out.println("Successfully parsed transaction: " + transaction);

            // Set additional transaction details
            transaction.setStatus(Transaction.TransactionStatus.PENDING);
            transaction.setInitiatedAt(LocalDateTime.now());
            transaction.setSmsReference(generateSmsReference());

            // Initiate the transaction
            return initiateTransaction(transaction);
        } catch (Exception e) {
            throw new TransactionException("Failed to process encrypted transaction: " + e.getMessage(), e);
        }
    }
    
    private String generateSmsReference() {
        return "SMS" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }

    private static String calculateHmac(String data, String base64Key) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(Base64.getDecoder().decode(base64Key), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(secretKey);
        byte[] hmacBytes = mac.doFinal(data.getBytes("UTF-8"));
        return Base64.getEncoder().withoutPadding().encodeToString(hmacBytes)
            .replace('+', '-')
            .replace('/', '_');
    }

    @Override
    public Transaction initiateTransaction(Transaction transaction) {
        // Validate sender exists
        User sender = userRepository.findById(transaction.getSender().getUpiId())
                .orElseThrow(() -> new TransactionException("Sender not found"));
        transaction.setSender(sender);
        if(!sender.getHashedPin().equals(transaction.getSender().getHashedPin())){
                throw new TransactionException("Invalid sender pin");
        }

        // Validate receiver exists
        User receiver =userRepository.findById(transaction.getReceiverUpi())
        .orElseThrow(() -> new TransactionException("Receiver not found"));

        // Validate sufficient balance for DEBIT transactions
        if (transaction.getTransactionType() == Transaction.TransactionType.DEBIT) {
            if (sender.getBalance().compareTo(transaction.getAmount()) < 0) {
                throw new TransactionException("Insufficient balance");
            }
            // Deduct amount from sender's balance
            sender.setBalance(sender.getBalance().subtract(transaction.getAmount()));
            receiver.setBalance(receiver.getBalance().add(transaction.getAmount()));
            userRepository.save(sender);
        }

        // Set initial transaction details
        transaction.setStatus(Transaction.TransactionStatus.PENDING);
        transaction.setInitiatedAt(LocalDateTime.now());
        transaction.setType(transaction.getType());
        System.out.println(transaction.getType());
        // Save transaction first to get the ID
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // Send notifications after saving
        mailUtil.sendCreditNotification(receiver.getEmail(), sender.getUpiId(), savedTransaction.getAmount().toString(), savedTransaction.getTransactionId().toString());
        mailUtil.sendTransactionConfirmation(sender.getEmail(), savedTransaction.getTransactionId().toString(), savedTransaction.getAmount().toString(), receiver.getUpiId());
        
        // Update transaction status to COMPLETED after sending emails
        savedTransaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        savedTransaction.setCompletedAt(LocalDateTime.now());
        
        // Save the updated transaction
        return transactionRepository.save(savedTransaction);
    }

    @Override
    public Transaction completeTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionException("Transaction not found"));

        // Validate transaction is in PENDING state
        if (transaction.getStatus() != Transaction.TransactionStatus.PENDING) {
            throw new TransactionException("Transaction is not in PENDING state");
        }

        // Update transaction status
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        transaction.setCompletedAt(LocalDateTime.now());

        // For CREDIT transactions, add amount to receiver's balance
        if (transaction.getTransactionType() == Transaction.TransactionType.CREDIT) {
            User receiver = userRepository.findById(transaction.getReceiverUpi())
                    .orElseThrow(() -> new TransactionException("Receiver not found"));
            receiver.setBalance(receiver.getBalance().add(transaction.getAmount()));
            userRepository.save(receiver);
        }

        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction failTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionException("Transaction not found"));

        // Validate transaction is in PENDING state
        if (transaction.getStatus() != Transaction.TransactionStatus.PENDING) {
            throw new TransactionException("Transaction is not in PENDING state");
        }

        // For DEBIT transactions, refund the amount to sender
        if (transaction.getTransactionType() == Transaction.TransactionType.DEBIT) {
            User sender = userRepository.findById(transaction.getSender().getUpiId())
                    .orElseThrow(() -> new TransactionException("Sender not found"));
            sender.setBalance(sender.getBalance().add(transaction.getAmount()));
            userRepository.save(sender);
        }

        // Update transaction status
        transaction.setStatus(Transaction.TransactionStatus.FAILED);
        transaction.setCompletedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    // @Override
    // public Optional<Transaction> getTransactionBySmsReference(String smsReference) {
    //     return transactionRepository.findBySmsReference(smsReference);
    // }

    @Override
    public Page<Transaction> getTransactionsByUser(String upiId, Pageable pageable) {
        return transactionRepository.findBySenderUpiId(upiId, pageable);
    }

    @Override
    public List<Transaction> getTransactionsByStatus(Transaction.TransactionStatus status) {
        return transactionRepository.findByStatus(status);
    }

    @Override
    public Transaction processSmsTransaction(String encryptedData) {
        // TODO: Decrypt the data using your encryption method
        // String decryptedData = decryptData(encryptedData);
        
        // // Extract sender UPI from the SMS (you'll need to implement this based on your SMS format)
        // String senderUpi = extractSenderUpi(decryptedData);
        
        // // Get sender user
        // User sender = userRepository.findById(senderUpi)
        //         .orElseThrow(() -> new TransactionException("Sender not found"));
        
        // // Parse SMS and create transaction
        // Transaction transaction = SmsTransactionParser.parseSmsToTransaction(decryptedData, sender);
        
        // // // Set SMS reference
        // // transaction.setSmsReference(generateSmsReference());
        
        // // Save and return the transaction
        // return transactionRepository.save(transaction);
        return null;
    }
    
 
    

    
    @Override
    public List<Transaction> getTransactionsByUser(String upiId) {
        return transactionRepository.findBySenderUpiId(upiId);
    }

    @Override
    public Optional<Transaction> getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId);
    }

    @Override
    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    // ... other methods ...
} 