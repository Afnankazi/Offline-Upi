package com.offline_upi.offline_upi.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;

import com.offline_upi.offline_upi.model.Encryption;
import com.offline_upi.offline_upi.model.Transaction;
import com.offline_upi.offline_upi.service.impl.TransactionServiceImpl;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@RequestMapping("/api/transactions")
@RestController
public class TransactionController {

    @Autowired
    private TransactionServiceImpl transactionServiceImpl;

    @PostMapping("/initiate")
    public ResponseEntity<Transaction> initiateTransaction(@RequestBody Transaction transaction) {
        return new ResponseEntity<>(transactionServiceImpl.initiateTransaction(transaction), HttpStatus.CREATED);
    }
    @PostMapping("/einitiate")
    public ResponseEntity<Transaction> Transaction(@RequestBody Encryption transaction) {
        return new ResponseEntity<>(transactionServiceImpl.encryptedTransaction(transaction.getEncryptedData()), HttpStatus.CREATED);
    }

    // ... rest of the code ...
}
