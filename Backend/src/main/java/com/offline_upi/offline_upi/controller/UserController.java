package com.offline_upi.offline_upi.controller;

import com.offline_upi.offline_upi.model.User;
import com.offline_upi.offline_upi.model.Transaction;
import com.offline_upi.offline_upi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
    "http://localhost:5173", 
    "http://192.168.0.6:5173", 
    "http://127.0.0.1:5173",
    "https://c137-203-194-96-188.ngrok-free.app",
    "https://offline-upi-cleint.vercel.app",
    "https://abc123def456.ngrok.io"
}, allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{upiId}")
    public ResponseEntity<User> getUserByUpiId(@PathVariable String upiId) {
        return userService.getUserByUpiId(upiId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return new ResponseEntity<>(userService.createUser(user), HttpStatus.CREATED);
    }

    @PutMapping("/{upiId}")
    public ResponseEntity<User> updateUser(@PathVariable String upiId, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(user));
    }

    @DeleteMapping("/{upiId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String upiId) {
        userService.deleteUser(upiId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/Balance")
    public ResponseEntity<Map<String, String>> getBalance(
            @RequestParam String upiId,
            @RequestParam String hashedPin) {
        
        User user = new User();
        user.setUpiId(upiId);
        user.setHashedPin(hashedPin);
        
        String balance = userService.getBalance(user);
        Map<String, String> response = new HashMap<>();
        response.put("balance", balance);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateUser(@RequestBody Map<String, String> credentials) {
        String upiId = credentials.get("upiId");
        String hashedPin = credentials.get("hashedPin");
        
        if (upiId == null || hashedPin == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UPI ID and hashed PIN are required");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
        
        return userService.getUserByUpiId(upiId)
                .map(user -> {
                    if (user.getHashedPin().equals(hashedPin)) {
                        // Create a response without sensitive information
                        Map<String, Object> response = new HashMap<>();
                        response.put("upiId", user.getUpiId());
                        response.put("name", user.getName());
                        response.put("email", user.getEmail());
                        response.put("phoneNumber", user.getPhoneNumber());
                        response.put("balance", user.getBalance());
                        return ResponseEntity.ok(response);
                    } else {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Invalid PIN");
                        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
                    }
                })
                .orElseGet(() -> {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "User not found");
                    return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
                });
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestParam String upiId,
            @RequestParam String hashedPin) {
        
        try {
            List<Transaction> transactions = userService.getHistory(upiId, hashedPin);
            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            
            if (e.getMessage().contains("Invalid PIN")) {
                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
            } else if (e.getMessage().contains("not found")) {
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "User API is working correctly");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updateData) {
        try {
            String currentUpiId = updateData.get("currentUpiId");
            String newUpiId = updateData.get("newUpiId");
            String name = updateData.get("name");

            // Validate required fields
            if (currentUpiId == null || newUpiId == null || name == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "All fields are required");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            // Validate UPI ID format
            if (!newUpiId.contains("@")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid UPI ID format");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            // Check if current user exists
            Optional<User> currentUser = userService.getUserByUpiId(currentUpiId);
            if (currentUser.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
            }

            // Check if new UPI ID is already taken (if different from current)
            if (!currentUpiId.equals(newUpiId)) {
                Optional<User> existingUser = userService.getUserByUpiId(newUpiId);
                if (existingUser.isPresent()) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "UPI ID already exists");
                    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
                }
            }

            // Update user profile
            User user = currentUser.get();
            user.setUpiId(newUpiId);
            user.setName(name);
            
            User updatedUser = userService.updateUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update profile");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // @PostMapping("/{upiId}/verify-pin")
    // public ResponseEntity<Boolean> verifyPin(@PathVariable String upiId, @RequestBody String pin) {
    //     return ResponseEntity.ok(userService.verifyPin(upiId, pin));
    // }
}