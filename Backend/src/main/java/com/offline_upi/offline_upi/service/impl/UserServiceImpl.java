package com.offline_upi.offline_upi.service.impl;

import com.offline_upi.offline_upi.model.User;
import com.offline_upi.offline_upi.repository.UserRepository;
import com.offline_upi.offline_upi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;


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
} 