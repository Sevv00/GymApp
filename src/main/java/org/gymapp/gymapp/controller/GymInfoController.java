package org.gymapp.gymapp.controller;

import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.GymInfoDTO;
import org.gymapp.gymapp.dto.GymInfoUpdateRequest;
import org.gymapp.gymapp.service.GymInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gym-info")
@RequiredArgsConstructor
public class GymInfoController {

    private final GymInfoService gymInfoService;

    @GetMapping
    public ResponseEntity<GymInfoDTO> getGymInfo() {
        return ResponseEntity.ok(gymInfoService.getGymInfo());
    }

    @PutMapping
    public ResponseEntity<?> updateGymInfo(@RequestBody GymInfoUpdateRequest request, Authentication auth) {
        try {
            GymInfoDTO dto = gymInfoService.updateGymInfo(request, auth.getName());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
