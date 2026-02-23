package org.gymapp.gymapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PurchaseCreateRequest {
    @NotNull
    private Long offerId;

    // Guest fields (only if not logged in)
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
}
