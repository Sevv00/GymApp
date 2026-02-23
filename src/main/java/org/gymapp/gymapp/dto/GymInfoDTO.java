package org.gymapp.gymapp.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GymInfoDTO {
    private Long id;
    private String openingHours;
    private String gymDesc;
    private String firstPhoneNumber;
    private String secondPhoneNumber;
    private String firstEmail;
    private String secondEmail;
    private LocalDateTime updatedAt;
    private String updatedByName;
}
