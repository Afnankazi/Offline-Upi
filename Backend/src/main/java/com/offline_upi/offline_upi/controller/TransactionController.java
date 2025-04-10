package com.offline_upi.offline_upi.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.offline_upi.offline_upi.model.Encryption;
import com.offline_upi.offline_upi.model.Transaction;
import com.offline_upi.offline_upi.service.impl.TransactionServiceImpl;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@RequestMapping("/api/transactions")
@RestController
@CrossOrigin(origins = {
    "http://localhost:5173", 
    "http://192.168.0.6:5173", 
    "http://127.0.0.1:5173",
    "https://c137-203-194-96-188.ngrok-free.app",
    "https://offline-e0zat60ic-afnankazis-projects.vercel.app"
}, allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class TransactionController {

    @Autowired
    private TransactionServiceImpl transactionServiceImpl;

    @PostMapping("/initiate")
    public ResponseEntity<Transaction> initiateTransaction(@RequestBody Transaction transaction) {
        return new ResponseEntity<>(transactionServiceImpl.initiateTransaction(transaction), HttpStatus.CREATED);
    }
    @PostMapping("/einitiate")
    public ResponseEntity<Transaction> Transaction(@RequestBody Encryption transaction) {
        return new ResponseEntity<>(transactionServiceImpl.encryptedTransaction(transaction.getE()), HttpStatus.CREATED);
    }
    @GetMapping("/getAllTransactionById/{upiId}")   
    public ResponseEntity<List<Transaction>> getAllTransactionById(@PathVariable String upiId) {
        return ResponseEntity.ok(transactionServiceImpl.getTransactionsByUser(upiId));
    }
    

    // ... rest of the code ...
}
