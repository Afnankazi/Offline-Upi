package com.offline_upi.offline_upi.repository;

import com.offline_upi.offline_upi.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySenderUpiId(String senderUpiId);
    Page<Transaction> findBySenderUpiId(String senderUpiId, Pageable pageable);
    List<Transaction> findByStatus(Transaction.TransactionStatus status);
    List<Transaction> findBySenderUpiIdAndStatus(String senderUpiId, Transaction.TransactionStatus status);
} 