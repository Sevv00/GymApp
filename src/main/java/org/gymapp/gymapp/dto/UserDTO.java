package org.gymapp.gymapp.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private String userRole;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoggedInDate;
    private Boolean isGoogle;
    private String discount;
    private Boolean adAgreement;
    private Boolean isActive;
}
