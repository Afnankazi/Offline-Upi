package com.offline_upi.offline_upi.repository;

import com.offline_upi.offline_upi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByUpiId(String upiId);
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<User> findByUpiId(String upiId);
} 