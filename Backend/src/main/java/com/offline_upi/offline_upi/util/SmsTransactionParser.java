package com.offline_upi.offline_upi.util;

import com.offline_upi.offline_upi.model.Transaction;
import com.offline_upi.offline_upi.model.User;
import com.offline_upi.offline_upi.exception.TransactionException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;

public class SmsTransactionParser {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static Transaction parseSmsToTransaction(String jsonMessage, User sender) {
        try {
            // Parse the JSON message
            Transaction transaction = objectMapper.readValue(jsonMessage, Transaction.class);
            
            // Set additional fields
            transaction.setSender(sender);
           
            transaction.setStatus(Transaction.TransactionStatus.OFFLINE_PENDING);
            
            return transaction;
        } catch (Exception e) {
            throw new TransactionException("Could not parse transaction from JSON: " + jsonMessage, e);
        }
    }
} 