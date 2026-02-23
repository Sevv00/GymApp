package org.gymapp.gymapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.AnnouncementCreateRequest;
import org.gymapp.gymapp.dto.AnnouncementDTO;
import org.gymapp.gymapp.service.AnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<AnnouncementDTO>> getAnnouncements() {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements());
    }

    @GetMapping("/all")
    public ResponseEntity<List<AnnouncementDTO>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @PostMapping
    public ResponseEntity<?> createAnnouncement(@Valid @RequestBody AnnouncementCreateRequest request, Authentication auth) {
        try {
            AnnouncementDTO dto = announcementService.createAnnouncement(request, auth.getName());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnnouncement(@PathVariable Long id, @Valid @RequestBody AnnouncementCreateRequest request) {
        try {
            AnnouncementDTO dto = announcementService.updateAnnouncement(id, request);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        try {
            announcementService.deleteAnnouncement(id);
            return ResponseEntity.ok(Map.of("message", "Ogłoszenie dezaktywowane"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
