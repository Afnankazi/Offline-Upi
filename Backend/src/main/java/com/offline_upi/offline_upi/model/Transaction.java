package com.offline_upi.offline_upi.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @ManyToOne
    @JoinColumn(name = "sender_upi", nullable = false)
    private User sender;

    @Column(name = "receiver_upi", nullable = false)
    private String receiverUpi;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @CreationTimestamp
    @Column(name = "initiated_at", updatable = false)
    private LocalDateTime initiatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "sms_reference", unique = true)
    private String smsReference;

    @Column(name = "is_offline_transaction")
    private boolean isOfflineTransaction;

    @Column(name = "sms_message")
    private String smsMessage;

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    public enum TransactionType {
        DEBIT,  // Money going out (payment)
        CREDIT  // Money coming in (receipt)
    }

    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        FAILED,
        OFFLINE_PENDING
    }

    public void setIsOfflineTransaction(boolean isOfflineTransaction) {
        this.isOfflineTransaction = isOfflineTransaction;
    }
} 