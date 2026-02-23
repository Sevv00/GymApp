package org.gymapp.gymapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.PurchaseCreateRequest;
import org.gymapp.gymapp.dto.PurchaseDTO;
import org.gymapp.gymapp.service.PurchaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<?> createPurchase(@Valid @RequestBody PurchaseCreateRequest request, Authentication auth) {
        try {
            PurchaseDTO dto = purchaseService.createPurchase(request, auth.getName());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/guest")
    public ResponseEntity<?> createGuestPurchase(@Valid @RequestBody PurchaseCreateRequest request) {
        try {
            PurchaseDTO dto = purchaseService.createGuestPurchase(request);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<PurchaseDTO>> getMyPurchases(Authentication auth) {
        return ResponseEntity.ok(purchaseService.getMyPurchases(auth.getName()));
    }

    @GetMapping("/admissions")
    public ResponseEntity<?> getMyAdmissions(Authentication auth) {
        return ResponseEntity.ok(purchaseService.getMyAdmissions(auth.getName()));
    }
}
