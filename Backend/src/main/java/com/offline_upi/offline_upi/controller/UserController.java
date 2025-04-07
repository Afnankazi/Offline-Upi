package com.offline_upi.offline_upi.controller;

import com.offline_upi.offline_upi.model.User;
import com.offline_upi.offline_upi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
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
    public ResponseEntity<Map<String, String>> getBalance(@RequestBody User user) {
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

    // @PostMapping("/{upiId}/verify-pin")
    // public ResponseEntity<Boolean> verifyPin(@PathVariable String upiId, @RequestBody String pin) {
    //     return ResponseEntity.ok(userService.verifyPin(upiId, pin));
    // }
}