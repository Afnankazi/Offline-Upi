package com.offline_upi.offline_upi.service.impl;

import com.offline_upi.offline_upi.model.User;
import com.offline_upi.offline_upi.model.Transaction;
import com.offline_upi.offline_upi.repository.UserRepository;
import com.offline_upi.offline_upi.repository.TransactionRepository;
import com.offline_upi.offline_upi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;


    @Override
    public User createUser(User user) {
        if (user.getUpiId() == null || user.getUpiId().trim().isEmpty()) {
            throw new IllegalArgumentException("UPI ID is required");
        }
        
        if (user.getBalance() == null) {
            user.setBalance(new BigDecimal("10000"));
        }
        
        // Check if user already exists
        if (userRepository.existsByUpiId(user.getUpiId())) {
            throw new IllegalArgumentException("User with UPI ID " + user.getUpiId() + " already exists");
        }
        
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserByUpiId(String upiId) {
        return userRepository.findById(upiId);
    }

    @Override
    public Optional<User> getUserByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    @Override
    public User updateUser(User user) {
       
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String upiId) {
        userRepository.deleteById(upiId);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // @Override
    // public boolean verifyPin(String upiId, String pin) {
    //     return userRepository.findById(upiId)
    //             .map(user -> passwordEncoder.matches(pin, user.getHashedPin()))
    //             .orElse(false);
    // }

    @Override
    public boolean existsByUpiId(String upiId) {
        return userRepository.existsByUpiId(upiId);
    }

    @Override
    public boolean existsByPhoneNumber(String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    @Override
    public String getBalance(User user) {
        User foundUser = userRepository.findByUpiId(user.getUpiId())
                .orElseThrow(() -> new IllegalArgumentException("User with UPI ID " + user.getUpiId() + " not found"));
        
        if (!foundUser.getHashedPin().equals(user.getHashedPin())) {
            throw new IllegalArgumentException("Invalid PIN");
        }
        
        return foundUser.getBalance().toString();
    }
    
    @Override
    public List<Transaction> getHistory(String upiId, String hashedPin) {
        // Validate user exists and PIN is correct
        User user = userRepository.findByUpiId(upiId)
                .orElseThrow(() -> new IllegalArgumentException("User with UPI ID " + upiId + " not found"));
        
        if (!user.getHashedPin().equals(hashedPin)) {
            throw new IllegalArgumentException("Invalid PIN");
        }
        
        // Get all transactions where the user is either the sender or receiver
        List<Transaction> sentTransactions = transactionRepository.findBySenderUpiId(upiId);
        List<Transaction> receivedTransactions = transactionRepository.findByReceiverUpi(upiId);
        
        // Create a new ArrayList to store all transactions
        List<Transaction> allTransactions = new ArrayList<>(sentTransactions);
        allTransactions.addAll(receivedTransactions);
        
        // Sort by initiatedAt in descending order (newest first)
        allTransactions.sort((t1, t2) -> t2.getInitiatedAt().compareTo(t1.getInitiatedAt()));
        
        return allTransactions;
    }
}