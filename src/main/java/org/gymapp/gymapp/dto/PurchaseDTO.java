package org.gymapp.gymapp.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PurchaseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long offerId;
    private String offerName;
    private LocalDateTime purchaseDate;
    private LocalDateTime validUntil;
}
