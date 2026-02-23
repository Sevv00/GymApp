package org.gymapp.gymapp.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GymAdmissionDTO {
    private Long id;
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
