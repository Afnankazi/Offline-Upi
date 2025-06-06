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
        try {
            User createdUser = userService.createUser(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null); // Or a specific error response body
        }
    }

    @PutMapping("/{upiId}")
    public ResponseEntity<User> updateUser(@PathVariable String upiId, @RequestBody User user) {
        // This endpoint might be less useful if UPI ID can be changed via /update-profile
        // Consider if you still need this or how it should behave if UPI ID changes are handled elsewhere.
        // Assuming this updates the user found by the path variable UPI ID with the data from the request body.
        
        // Ensure the UPI ID in the path matches the user object if it's meant to update by path ID
        if (!upiId.equals(user.getUpiId())) {
             // Decide how to handle this inconsistency - maybe return a bad request or throw an exception
             // For now, let's assume the request body's UPI ID is the intended one for update
        }
        
        try {
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
             return ResponseEntity.badRequest().body(null); // Or a specific error response body
        } catch (RuntimeException e) {
            // Catch potential issues from service layer, though service should ideally throw more specific exceptions
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Or a specific error response body
        }
    }

    @DeleteMapping("/{upiId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String upiId) {
        try {
            userService.deleteUser(upiId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            // Handle cases where user might not exist, though deleteById might not throw on not found
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/Balance")
    public ResponseEntity<Map<String, String>> getBalance(
            @RequestParam String upiId,
            @RequestParam String hashedPin) {
        
        try {
            User user = new User();
            user.setUpiId(upiId);
            user.setHashedPin(hashedPin);
            
            String balance = userService.getBalance(user);
            Map<String, String> response = new HashMap<>();
            response.put("balance", balance);
            return new ResponseEntity<>(response, HttpStatus.OK);
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
            System.out.println("Fetching history for UPI ID: " + upiId);
            List<Transaction> transactions = userService.getHistory(upiId, hashedPin);
            System.out.println("Found " + transactions.size() + " transactions");
            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException e) {
            System.out.println("Error fetching history: " + e.getMessage());
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
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        try {
            String currentUpiId = request.get("currentUpiId");
            String newUpiId = request.get("newUpiId");
            String name = request.get("name");

            // Validate required fields
            if (currentUpiId == null || currentUpiId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Current UPI ID is required"
                ));
            }

            // Find existing user
            Optional<User> existingUserOptional = userService.getUserByUpiId(currentUpiId);

            if (existingUserOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "User with current UPI ID not found"
                ));
            }

            User existingUser = existingUserOptional.get();

            // Handle UPI ID change
            if (newUpiId != null && !newUpiId.isEmpty() && !newUpiId.equals(currentUpiId)) {
                // Check if new UPI ID is already taken
                if (userService.getUserByUpiId(newUpiId).isPresent()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "New UPI ID already exists"
                    ));
                }
                // To change the primary key, delete the old entity and save a new one.
                userService.deleteUser(currentUpiId);
                existingUser.setUpiId(newUpiId); // Set the new UPI ID on the existing object
            }

            // Update other fields if provided
            if (name != null && !name.isEmpty()) {
                existingUser.setName(name);
            }

            // Save the updated user (will insert if UPI ID was changed)
            User updatedUser = userService.updateUser(existingUser);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully",
                "user", Map.of(
                    "upiId", updatedUser.getUpiId(),
                    "name", updatedUser.getName(),
                    "email", updatedUser.getEmail(), // Include other relevant fields
                    "phoneNumber", updatedUser.getPhoneNumber()
                )
            ));
        } catch (Exception e) { // Catching generic Exception - consider more specific exceptions if needed
            // Log the error on the server side for debugging
            e.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    // @PostMapping("/{upiId}/verify-pin")
    // public ResponseEntity<Boolean> verifyPin(@PathVariable String upiId, @RequestBody String pin) {
    //     return ResponseEntity.ok(userService.verifyPin(upiId, pin));
    // }
}