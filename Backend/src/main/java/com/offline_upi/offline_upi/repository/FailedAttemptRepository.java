// package com.offline_upi.offline_upi.repository;

// import com.offline_upi.offline_upi.model.FailedAttempt;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.stereotype.Repository;

// import java.time.LocalDateTime;
// import java.util.List;

// @Repository
// public interface FailedAttemptRepository extends JpaRepository<FailedAttempt, Long> {
//     List<FailedAttempt> findByUpiIdOrderByAttemptedAtDesc(String upiId);
    
//     @Query("SELECT COUNT(f) FROM FailedAttempt f WHERE f.user.upiId = ?1 AND f.attemptedAt > ?2")
//     long countRecentAttempts(String upiId, LocalDateTime timeThreshold);
    
//     List<FailedAttempt> findByAttemptedAtBefore(LocalDateTime timeThreshold);
// } 