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

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
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

    // @PostMapping("/{upiId}/verify-pin")
    // public ResponseEntity<Boolean> verifyPin(@PathVariable String upiId, @RequestBody String pin) {
    //     return ResponseEntity.ok(userService.verifyPin(upiId, pin));
    // }
}