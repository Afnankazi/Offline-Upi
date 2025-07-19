package com.offline_upi.offline_upi.exception;

public class TransactionException extends RuntimeException {
    public TransactionException(String message) {
        super(message);
    }
    
    public TransactionException(String message, Throwable cause) {
        super(message, cause);
    }
} 