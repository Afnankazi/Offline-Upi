package com.offline_upi.offline_upi.service.impl;

import com.offline_upi.offline_upi.exception.TransactionException;
import com.offline_upi.offline_upi.model.Transaction;
import com.offline_upi.offline_upi.model.User;
import com.offline_upi.offline_upi.repository.TransactionRepository;
import com.offline_upi.offline_upi.repository.UserRepository;
import com.offline_upi.offline_upi.service.TransactionService;
import com.offline_upi.offline_upi.util.SmsTransactionParser;
import com.offline_upi.offline_upi.util.AESUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;
    
    @Override
    public Transaction encryptedTransaction(String encryptedData) {
        try {
            System.out.println("Received encrypted data: " + encryptedData);
            
            // Decrypt the data
            byte[] decryptedBytes = AESUtil.decrypt(encryptedData);
            String decryptedData = new String(decryptedBytes);
            System.out.println("Decrypted data: " + decryptedData);
            
            // Clean the decrypted data
            String cleanedData = decryptedData
                .replaceAll("[^\\x20-\\x7E]", "") // Remove all non-ASCII characters
                .replaceAll("\\s+", " ")          // Replace multiple spaces with single space
                .replaceAll("\\s*,\\s*", ",")     // Remove spaces around commas
                .replaceAll("\\s*:\\s*", ":")     // Remove spaces around colons
                .trim();
            
            System.out.println("Cleaned data: " + cleanedData);
            
            // Parse the JSON into a Transaction object
            Transaction transaction = objectMapper.readValue(cleanedData, Transaction.class);
            System.out.println("Successfully parsed transaction: " + transaction);
            
            // Set additional transaction details
            transaction.setStatus(Transaction.TransactionStatus.PENDING);
            transaction.setInitiatedAt(LocalDateTime.now());
            transaction.setIsOfflineTransaction(true);
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
        
        return transactionRepository.save(transaction);
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