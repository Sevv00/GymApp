package org.gymapp.gymapp.service;

import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.UserDTO;
import org.gymapp.gymapp.dto.UserUpdateRequest;
import org.gymapp.gymapp.model.User;
import org.gymapp.gymapp.model.UserDiscount;
import org.gymapp.gymapp.model.UserRole;
import org.gymapp.gymapp.repository.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserDTO getCurrentUser(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        return mapToDTO(user);
    }

    public UserDTO updateCurrentUser(String email, UserUpdateRequest request) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAdAgreement() != null) user.setAdAgreement(request.getAdAgreement());
        if (request.getDiscount() != null) user.setDiscount(UserDiscount.valueOf(request.getDiscount()));
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepo.save(user);
        return mapToDTO(user);
    }

    public void deactivateAccount(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        user.setIsActive(false);
        userRepo.save(user);
    }

    // --- Admin methods ---

    public List<UserDTO> getAllUsers() {
        return userRepo.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        return mapToDTO(user);
    }

    public UserDTO updateUser(Long id, UserUpdateRequest request) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAdAgreement() != null) user.setAdAgreement(request.getAdAgreement());
        if (request.getDiscount() != null) user.setDiscount(UserDiscount.valueOf(request.getDiscount()));
        if (request.getUserRole() != null) user.setUserRole(UserRole.valueOf(request.getUserRole()));
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepo.save(user);
        return mapToDTO(user);
    }

    public void deleteUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        user.setIsActive(false);
        userRepo.save(user);
    }

    public UserDTO createUser(org.gymapp.gymapp.dto.RegisterRequest request, String role) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setUserRole(UserRole.valueOf(role));
        user.setIsGoogle(false);
        user.setIsActive(true);
        user.setAdAgreement(request.getAdAgreement() != null && request.getAdAgreement());
        user.setDiscount(request.getDiscount() != null ? UserDiscount.valueOf(request.getDiscount()) : UserDiscount.NONE);
        userRepo.save(user);
        return mapToDTO(user);
    }

    public void uploadAvatar(String email, byte[] avatarData) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        user.setAvatar(avatarData);
        userRepo.save(user);
    }

    public byte[] getAvatar(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        return user.getAvatar();
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setUserRole(user.getUserRole().name());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLoggedInDate(user.getLastLoggedInDate());
        dto.setIsGoogle(user.getIsGoogle());
        dto.setDiscount(user.getDiscount() != null ? user.getDiscount().name() : "NONE");
        dto.setAdAgreement(user.getAdAgreement());
        dto.setIsActive(user.getIsActive());
        return dto;
    }
}
