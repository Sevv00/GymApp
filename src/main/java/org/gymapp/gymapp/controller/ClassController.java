package org.gymapp.gymapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.ClassCreateRequest;
import org.gymapp.gymapp.dto.ClassDTO;
import org.gymapp.gymapp.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public ResponseEntity<List<ClassDTO>> getClasses() {
        return ResponseEntity.ok(classService.getAllClasses());
    }

    @PostMapping
    public ResponseEntity<?> createClass(@Valid @RequestBody ClassCreateRequest request) {
        try {
            ClassDTO cls = classService.createClass(request);
            return ResponseEntity.ok(cls);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClass(@PathVariable Long id, @Valid @RequestBody ClassCreateRequest request) {
        try {
            ClassDTO cls = classService.updateClass(id, request);
            return ResponseEntity.ok(cls);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        try {
            classService.deleteClass(id);
            return ResponseEntity.ok(Map.of("message", "Zajęcia usunięte"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<List<Long>> getMyRegistrations(Authentication auth) {
        return ResponseEntity.ok(classService.getMyRegisteredClassIds(auth.getName()));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForClass(@PathVariable Long id, Authentication auth) {
        try {
            classService.registerForClass(id, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Zapisano na zajęcia"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/unregister")
    public ResponseEntity<?> unregisterFromClass(@PathVariable Long id, Authentication auth) {
        try {
            classService.unregisterFromClass(id, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Wypisano z zajęć"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
