package org.gymapp.gymapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.OfferCreateRequest;
import org.gymapp.gymapp.dto.OfferDTO;
import org.gymapp.gymapp.service.OfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @GetMapping
    public ResponseEntity<List<OfferDTO>> getOffers() {
        return ResponseEntity.ok(offerService.getActiveOffers());
    }

    @GetMapping("/all")
    public ResponseEntity<List<OfferDTO>> getAllOffers() {
        return ResponseEntity.ok(offerService.getAllOffers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOffer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(offerService.getOfferById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOffer(@Valid @RequestBody OfferCreateRequest request, Authentication auth) {
        try {
            OfferDTO offer = offerService.createOffer(request, auth.getName());
            return ResponseEntity.ok(offer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOffer(@PathVariable Long id, @Valid @RequestBody OfferCreateRequest request) {
        try {
            OfferDTO offer = offerService.updateOffer(id, request);
            return ResponseEntity.ok(offer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOffer(@PathVariable Long id) {
        try {
            offerService.deleteOffer(id);
            return ResponseEntity.ok(Map.of("message", "Oferta dezaktywowana"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
