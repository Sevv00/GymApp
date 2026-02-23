package org.gymapp.gymapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClassCreateRequest {
    @NotNull
    private Long offerId;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    private Long instructorId;

    @NotNull
    private Integer capacity;
}
