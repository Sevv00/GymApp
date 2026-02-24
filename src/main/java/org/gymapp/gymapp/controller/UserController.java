package org.gymapp.gymapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.UserDTO;
import org.gymapp.gymapp.dto.UserUpdateRequest;
import org.gymapp.gymapp.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(Authentication auth, @RequestParam("file") MultipartFile file) {
        try {
            if (file.getSize() > 2 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plik jest za duży (max 2MB)"));
            }
            userService.uploadAvatar(auth.getName(), file.getBytes());
            return ResponseEntity.ok(Map.of("message", "Avatar zaktualizowany"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me/avatar")
    public ResponseEntity<byte[]> getAvatar(Authentication auth) {
        byte[] avatar = userService.getAvatar(auth.getName());
        if (avatar == null || avatar.length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                .body(avatar);
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<?> deleteAvatar(Authentication auth) {
        try {
            userService.uploadAvatar(auth.getName(), null);
            return ResponseEntity.ok(Map.of("message", "Avatar usunięty"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
