package org.gymapp.gymapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnnouncementCreateRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
