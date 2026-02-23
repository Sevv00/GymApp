package org.gymapp.gymapp.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OfferDTO {
    private Long id;
    private String offerName;
    private String offerDescription;
    private String priceText;
    private BigDecimal price;
    private Short durationDays;
    private Boolean isPermanent;
    private LocalDateTime offerExpiredDate;
    private LocalDateTime createdAt;
    private Long createdById;
    private String createdByName;
    private Boolean isActive;
    // Class info (if exists)
    private ClassDTO classInfo;
}
