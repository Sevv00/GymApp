package org.gymapp.gymapp.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name = "Purchases")
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false, unique = true)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", referencedColumnName = "id")
    private Offer offer;

    @Column(name = "purchase_date")
    private LocalDateTime purchaseDate;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    //Delete this if a bidirectional relation with Class is not needed
    @OneToOne(mappedBy = "purchaseId", cascade = CascadeType.ALL, orphanRemoval = true)
    private GuestAction guestAction;

    @PrePersist
    protected void onCreate() {
        purchaseDate = LocalDateTime.now();

        if (offer != null && offer.getDurationDays() != null) {
            this.validUntil = this.purchaseDate.plusDays(offer.getDurationDays());
        }
        else {
            this.validUntil = null;
        }
    }
}
