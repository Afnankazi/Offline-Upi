package com.offline_upi.offline_upi.service;

import com.offline_upi.offline_upi.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TransactionService {
    Transaction initiateTransaction(Transaction transaction);
    Transaction completeTransaction(Long transactionId);
    Transaction failTransaction(Long transactionId);
    Optional<Transaction> getTransactionById(Long transactionId);
    List<Transaction> getTransactionsByUser(String upiId);
    Page<Transaction> getTransactionsByUser(String upiId, Pageable pageable);
    List<Transaction> getTransactionsByStatus(Transaction.TransactionStatus status);
    Transaction processSmsTransaction(String encryptedData);
    // Optional<Transaction> getTransactionBySmsReference(String smsReference);
    Transaction saveTransaction(Transaction transaction);
} 