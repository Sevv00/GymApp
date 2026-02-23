package org.gymapp.gymapp.service;

import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.configuration.JwtUtil;
import org.gymapp.gymapp.dto.AuthResponse;
import org.gymapp.gymapp.dto.LoginRequest;
import org.gymapp.gymapp.dto.RegisterRequest;
import org.gymapp.gymapp.model.User;
import org.gymapp.gymapp.model.UserDiscount;
import org.gymapp.gymapp.model.UserRole;
import org.gymapp.gymapp.repository.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Użytkownik z tym adresem email już istnieje");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setUserRole(UserRole.CLIENT);
        user.setIsGoogle(false);
        user.setIsActive(true);
        user.setAdAgreement(request.getAdAgreement() != null && request.getAdAgreement());

        if (request.getDiscount() != null) {
            user.setDiscount(UserDiscount.valueOf(request.getDiscount()));
        } else {
            user.setDiscount(UserDiscount.NONE);
        }

        userRepo.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getUserRole().name());
        return new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName(), user.getUserRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Nieprawidłowy email lub hasło"));

        if (!user.getIsActive()) {
            throw new RuntimeException("Konto jest nieaktywne");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Nieprawidłowy email lub hasło");
        }

        user.setLastLoggedInDate(java.time.LocalDateTime.now());
        userRepo.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getUserRole().name());
        return new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName(), user.getUserRole().name());
    }
}
