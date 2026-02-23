package org.gymapp.gymapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.UserDTO;
import org.gymapp.gymapp.dto.UserUpdateRequest;
import org.gymapp.gymapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        try {
            UserDTO user = userService.getCurrentUser(auth.getName());
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication auth, @Valid @RequestBody UserUpdateRequest request) {
        try {
            UserDTO user = userService.updateCurrentUser(auth.getName(), request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deactivateAccount(Authentication auth) {
        try {
            userService.deactivateAccount(auth.getName());
            return ResponseEntity.ok(Map.of("message", "Konto zostało dezaktywowane"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
