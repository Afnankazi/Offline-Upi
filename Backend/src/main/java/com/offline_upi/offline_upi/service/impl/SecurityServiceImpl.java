// package com.offline_upi.offline_upi.service.impl;

// import com.offline_upi.offline_upi.model.FailedAttempt;
// import com.offline_upi.offline_upi.model.User;
// import com.offline_upi.offline_upi.repository.FailedAttemptRepository;
// import com.offline_upi.offline_upi.repository.UserRepository;
// import com.offline_upi.offline_upi.service.SecurityService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.security.crypto.encrypt.TextEncryptor;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Optional;
// import java.util.UUID;

// @Service
// @Transactional
// public class SecurityServiceImpl implements SecurityService {

//     @Autowired
//     private FailedAttemptRepository failedAttemptRepository;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private TextEncryptor textEncryptor;

//     @Value("${security.failed-attempts.threshold-minutes:30}")
//     private int failedAttemptsThresholdMinutes;

//     @Override
//     public void recordFailedAttempt(String upiId, String reason) {
//         Optional<User> user = userRepository.findById(upiId);
//         if (user.isPresent()) {
//             FailedAttempt attempt = new FailedAttempt();
//             attempt.setUser(user.get());
//             attempt.setReason(reason);
//             attempt.setAttemptedAt(LocalDateTime.now());
//             failedAttemptRepository.save(attempt);
//         }
//     }

//     @Override
//     public List<FailedAttempt> getFailedAttempts(String upiId) {
//         return failedAttemptRepository.findByUpiIdOrderByAttemptedAtDesc(upiId);
//     }

//     @Override
//     public long getRecentFailedAttemptsCount(String upiId, LocalDateTime timeThreshold) {
//         return failedAttemptRepository.countRecentAttempts(upiId, timeThreshold);
//     }

//     @Override
//     public void cleanupOldFailedAttempts(LocalDateTime timeThreshold) {
//         List<FailedAttempt> oldAttempts = failedAttemptRepository.findByAttemptedAtBefore(timeThreshold);
//         failedAttemptRepository.deleteAll(oldAttempts);
//     }

//     @Override
//     public String encryptData(String data) {
//         return textEncryptor.encrypt(data);
//     }

//     @Override
//     public String decryptData(String encryptedData) {
//         return textEncryptor.decrypt(encryptedData);
//     }

//     @Override
//     public String generateNonce() {
//         return UUID.randomUUID().toString();
//     }

//     @Override
//     public boolean verifySignature(String data, String signature, String nonce) {
//         // TODO: Implement signature verification logic
//         // This should verify that the signature was generated using the data and nonce
//         throw new UnsupportedOperationException("Signature verification not implemented yet");
//     }
// } 