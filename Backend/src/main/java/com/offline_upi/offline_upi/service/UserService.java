package com.offline_upi.offline_upi.service;

import com.offline_upi.offline_upi.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(User user);
    Optional<User> getUserByUpiId(String upiId);
    Optional<User> getUserByPhoneNumber(String phoneNumber);
    User updateUser(User user);
    void deleteUser(String upiId);
    List<User> getAllUsers();
    // boolean verifyPin(String upiId, String pin);
    boolean existsByUpiId(String upiId);
    boolean existsByPhoneNumber(String phoneNumber);
} 