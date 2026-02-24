package org.gymapp.gymapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.GymAdmissionCreateRequest;
import org.gymapp.gymapp.dto.GymAdmissionDTO;
import org.gymapp.gymapp.dto.UserDTO;
import org.gymapp.gymapp.service.PurchaseService;
import org.gymapp.gymapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gym-admissions")
@RequiredArgsConstructor
public class GymAdmissionController {

    private final PurchaseService purchaseService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<GymAdmissionDTO>> getAllAdmissions() {
        return ResponseEntity.ok(purchaseService.getAllAdmissions());
    }

    @PostMapping
    public ResponseEntity<?> createAdmission(@Valid @RequestBody GymAdmissionCreateRequest request) {
        try {
            GymAdmissionDTO admission = purchaseService.createAdmission(
                    request.getUserId(), request.getStartTime(), request.getEndTime());
            return ResponseEntity.ok(admission);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<List<UserDTO>> getClients() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
