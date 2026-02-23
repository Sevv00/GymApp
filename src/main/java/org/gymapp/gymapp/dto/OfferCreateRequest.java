package org.gymapp.gymapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OfferCreateRequest {
    @NotBlank
    private String offerName;

    private String offerDescription;
    private String priceText;

    @NotNull
    private BigDecimal price;

    @NotNull
    private Short durationDays;

    @NotNull
    private Boolean isPermanent;

    private LocalDateTime offerExpiredDate;
}
