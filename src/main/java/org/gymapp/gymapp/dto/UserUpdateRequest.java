package org.gymapp.gymapp.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(max = 25)
    private String firstName;

    @Size(max = 50)
    private String lastName;

    @Size(max = 15)
    private String phoneNumber;

    private String discount;
    private Boolean adAgreement;
    private String password;
    private String userRole;
    private Boolean isActive;
}
