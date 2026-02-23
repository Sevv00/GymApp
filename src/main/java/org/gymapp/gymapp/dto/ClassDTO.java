package org.gymapp.gymapp.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClassDTO {
    private Long id;
    private Long offerId;
    private String offerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long instructorId;
    private String instructorName;
    private Integer capacity;
    private Integer registeredCount;
}
