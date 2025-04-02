// package com.offline_upi.offline_upi.service.impl;

// import com.offline_upi.offline_upi.model.Transaction;
// import com.offline_upi.offline_upi.repository.TransactionRepository;
// import com.offline_upi.offline_upi.service.TransactionService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Optional;
// import java.util.UUID;

// @Service
// @Transactional
// public class TransactionServiceImpl implements TransactionService {

//     @Autowired
//     private TransactionRepository transactionRepository;

//     @Override
//     public Transaction initiateTransaction(Transaction transaction) {
//         transaction.setStatus(Transaction.TransactionStatus.PENDING);
//         transaction.setInitiatedAt(LocalDateTime.now());
//         transaction.setSmsReference(generateSmsReference());
//         return transactionRepository.save(transaction);
//     }

//     @Override
//     public Transaction completeTransaction(Long transactionId) {
//         Transaction transaction = transactionRepository.findById(transactionId)
//                 .orElseThrow(() -> new RuntimeException("Transaction not found"));
//         transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
//         transaction.setCompletedAt(LocalDateTime.now());
//         return transactionRepository.save(transaction);
//     }

//     @Override
//     public Transaction failTransaction(Long transactionId) {
//         Transaction transaction = transactionRepository.findById(transactionId)
//                 .orElseThrow(() -> new RuntimeException("Transaction not found"));
//         transaction.setStatus(Transaction.TransactionStatus.FAILED);
//         transaction.setCompletedAt(LocalDateTime.now());
//         return transactionRepository.save(transaction);
//     }

//     @Override
//     public Optional<Transaction> getTransactionById(Long transactionId) {
//         return transactionRepository.findById(transactionId);
//     }

//     @Override
//     public List<Transaction> getTransactionsByUser(String upiId) {
//         return transactionRepository.findBySenderUpiId(upiId);
//     }

//     @Override
//     public Page<Transaction> getTransactionsByUser(String upiId, Pageable pageable) {
//         return transactionRepository.findBySenderUpiId(upiId, pageable);
//     }

//     @Override
//     public List<Transaction> getTransactionsByStatus(Transaction.TransactionStatus status) {
//         return transactionRepository.findByStatus(status);
//     }

//     @Override
//     public Transaction processSmsTransaction(String encryptedData) {
//         // TODO: Implement SMS transaction processing logic
//         // 1. Decrypt the data
//         // 2. Validate the transaction
//         // 3. Process the payment
//         // 4. Update transaction status
//         throw new UnsupportedOperationException("SMS transaction processing not implemented yet");
//     }

//     @Override
//     public Optional<Transaction> getTransactionBySmsReference(String smsReference) {
//         return transactionRepository.findBySmsReference(smsReference);
//     }

//     private String generateSmsReference() {
//         return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
//     }
// } 