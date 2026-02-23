package org.gymapp.gymapp.dto;

import lombok.Data;

@Data
public class GymInfoUpdateRequest {
    private String openingHours;
    private String gymDesc;
    private String firstPhoneNumber;
    private String secondPhoneNumber;
    private String firstEmail;
    private String secondEmail;
}
